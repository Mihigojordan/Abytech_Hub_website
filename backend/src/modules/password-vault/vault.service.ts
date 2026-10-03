import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { VaultCryptoService } from './vault-crypto.service';

const MAX_ATTEMPTS_BEFORE_LOCKOUT = 5;
const BASE_LOCKOUT_MS = 15 * 60 * 1000;
const MAX_LOCKOUT_MS = 24 * 60 * 60 * 1000;
const MAX_ITEMS = 2000;
const MAX_CIPHERTEXT_CHARS = 128 * 1024;

// Minimums the server enforces so a tampered client can't register a vault
// with a cheap-to-crack key derivation.
const KDF_LIMITS = {
  memoryKiB: { min: 19 * 1024, max: 1024 * 1024 },
  iterations: { min: 2, max: 10 },
  parallelism: { min: 1, max: 4 },
};

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

export interface KdfParams {
  alg: 'argon2id';
  memoryKiB: number;
  iterations: number;
  parallelism: number;
}

/** Client-side ciphertext: AES-256-GCM output, base64 encoded. */
export interface CipherBlob {
  v: 1;
  iv: string;
  ct: string;
}

export interface SetupInput {
  kdfSalt: string;
  kdfParams: KdfParams;
  authKey: string;
  encryptedDek: CipherBlob;
}

export interface ChangeMasterInput {
  currentAuthKey: string;
  newKdfSalt: string;
  newKdfParams: KdfParams;
  newAuthKey: string;
  newEncryptedDek: CipherBlob;
}

@Injectable()
export class VaultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: VaultCryptoService,
  ) {}

  // ─── Validation ────────────────────────────────────────────────────────

  private assertBase64(value: unknown, field: string, bytes?: number): string {
    if (typeof value !== 'string' || !BASE64.test(value)) {
      throw new BadRequestException(`${field} must be base64`);
    }
    if (bytes !== undefined && Buffer.from(value, 'base64').length !== bytes) {
      throw new BadRequestException(`${field} must be ${bytes} bytes`);
    }
    return value;
  }

  private assertKdf(params: any): KdfParams {
    if (!params || params.alg !== 'argon2id') {
      throw new BadRequestException('kdfParams.alg must be argon2id');
    }
    for (const key of Object.keys(KDF_LIMITS) as (keyof typeof KDF_LIMITS)[]) {
      const v = params[key];
      const { min, max } = KDF_LIMITS[key];
      if (!Number.isInteger(v) || v < min || v > max) {
        throw new BadRequestException(`kdfParams.${key} must be between ${min} and ${max}`);
      }
    }
    return {
      alg: 'argon2id',
      memoryKiB: params.memoryKiB,
      iterations: params.iterations,
      parallelism: params.parallelism,
    };
  }

  private assertBlob(blob: any, field: string): string {
    if (!blob || blob.v !== 1) throw new BadRequestException(`${field} is malformed`);
    this.assertBase64(blob.iv, `${field}.iv`, 12);
    this.assertBase64(blob.ct, `${field}.ct`);
    if (blob.ct.length > MAX_CIPHERTEXT_CHARS) {
      throw new BadRequestException(`${field} is too large`);
    }
    // GCM tag alone is 16 bytes; anything shorter cannot be real ciphertext.
    if (Buffer.from(blob.ct, 'base64').length < 17) {
      throw new BadRequestException(`${field} is malformed`);
    }
    return JSON.stringify({ v: 1, iv: blob.iv, ct: blob.ct });
  }

  // ─── Vault lifecycle ───────────────────────────────────────────────────

  async status(adminId: string) {
    const vault = await this.prisma.vaultAccount.findUnique({ where: { adminId } });
    if (!vault) return { exists: false };
    return {
      exists: true,
      kdfSalt: vault.kdfSalt,
      kdfParams: vault.kdfParams,
      lockedUntil: vault.lockedUntil && vault.lockedUntil > new Date() ? vault.lockedUntil : null,
      lastUnlockedAt: vault.lastUnlockedAt,
    };
  }

  async setup(adminId: string, input: SetupInput) {
    const kdfSalt = this.assertBase64(input?.kdfSalt, 'kdfSalt', 16);
    const kdfParams = this.assertKdf(input?.kdfParams);
    const authKey = this.assertBase64(input?.authKey, 'authKey', 32);
    const dek = this.assertBlob(input?.encryptedDek, 'encryptedDek');

    const existing = await this.prisma.vaultAccount.findUnique({ where: { adminId } });
    if (existing) throw new ConflictException('Vault already exists');

    const authSalt = this.crypto.newSalt();
    const authHash = await this.crypto.hashAuthKey(authKey, authSalt);
    // Id is chosen up front so the DEK envelope can be bound to it via AAD.
    const id = randomUUID();
    const vault = await this.prisma.vaultAccount.create({
      data: {
        id,
        adminId,
        kdfSalt,
        kdfParams: kdfParams as any,
        authSalt,
        authHash,
        encryptedDek: this.crypto.seal(dek, this.dekContext(id)),
        lastUnlockedAt: new Date(),
      },
    });
    return { token: this.issueSession(adminId, vault.id, vault.sessionVersion) };
  }

  async unlock(adminId: string, authKey: string) {
    this.assertBase64(authKey, 'authKey', 32);
    const vault = await this.prisma.vaultAccount.findUnique({ where: { adminId } });
    if (!vault) throw new NotFoundException('No vault set up yet');
    this.assertNotLockedOut(vault.lockedUntil);

    const ok = await this.crypto.verifyAuthKey(authKey, vault.authSalt, vault.authHash);
    if (!ok) await this.recordFailure(vault.id);

    const fresh = await this.prisma.vaultAccount.update({
      where: { id: vault.id },
      data: { failedAttempts: 0, lockedUntil: null, lastUnlockedAt: new Date() },
    });
    return {
      encryptedDek: JSON.parse(this.crypto.open(fresh.encryptedDek, this.dekContext(fresh.id))),
      token: this.issueSession(adminId, fresh.id, fresh.sessionVersion),
    };
  }

  /** Revokes every open vault session for this admin (all tabs/devices). */
  async lock(adminId: string) {
    await this.prisma.vaultAccount.updateMany({
      where: { adminId },
      data: { sessionVersion: { increment: 1 } },
    });
  }

  async changeMaster(adminId: string, vaultId: string, input: ChangeMasterInput) {
    const currentAuthKey = this.assertBase64(input?.currentAuthKey, 'currentAuthKey', 32);
    const kdfSalt = this.assertBase64(input?.newKdfSalt, 'newKdfSalt', 16);
    const kdfParams = this.assertKdf(input?.newKdfParams);
    const newAuthKey = this.assertBase64(input?.newAuthKey, 'newAuthKey', 32);
    const dek = this.assertBlob(input?.newEncryptedDek, 'newEncryptedDek');

    const vault = await this.prisma.vaultAccount.findUnique({ where: { id: vaultId } });
    if (!vault || vault.adminId !== adminId) throw new NotFoundException('Vault not found');
    this.assertNotLockedOut(vault.lockedUntil);
    if (!(await this.crypto.verifyAuthKey(currentAuthKey, vault.authSalt, vault.authHash))) {
      await this.recordFailure(vault.id);
    }

    const authSalt = this.crypto.newSalt();
    const updated = await this.prisma.vaultAccount.update({
      where: { id: vault.id },
      data: {
        kdfSalt,
        kdfParams: kdfParams as any,
        authSalt,
        authHash: await this.crypto.hashAuthKey(newAuthKey, authSalt),
        encryptedDek: this.crypto.seal(dek, this.dekContext(vault.id)),
        failedAttempts: 0,
        lockedUntil: null,
        sessionVersion: { increment: 1 },
      },
    });
    return { token: this.issueSession(adminId, updated.id, updated.sessionVersion) };
  }

  /**
   * Permanently destroys the vault and every item in it. This is the only
   * way out of a forgotten master password — nobody, including the server
   * operator, can decrypt the items without it.
   */
  async destroy(adminId: string, confirm: string) {
    if (confirm !== 'DELETE MY VAULT') {
      throw new BadRequestException('Type "DELETE MY VAULT" to confirm');
    }
    await this.prisma.vaultAccount.deleteMany({ where: { adminId } });
  }

  // ─── Items ─────────────────────────────────────────────────────────────

  async listItems(vaultId: string) {
    const items = await this.prisma.vaultItem.findMany({
      where: { vaultId },
      orderBy: { updatedAt: 'desc' },
    });
    return items.map((item) => this.toClient(item));
  }

  async createItem(vaultId: string, payload: CipherBlob) {
    const blob = this.assertBlob(payload, 'payload');
    const count = await this.prisma.vaultItem.count({ where: { vaultId } });
    if (count >= MAX_ITEMS) throw new BadRequestException('Vault item limit reached');
    const item = await this.prisma.vaultItem.create({
      data: { vaultId, payload: this.crypto.seal(blob, this.itemContext(vaultId)) },
    });
    return this.toClient(item);
  }

  async updateItem(vaultId: string, id: string, payload: CipherBlob) {
    const blob = this.assertBlob(payload, 'payload');
    await this.findOwnedItem(vaultId, id);
    const item = await this.prisma.vaultItem.update({
      where: { id },
      data: { payload: this.crypto.seal(blob, this.itemContext(vaultId)) },
    });
    return this.toClient(item);
  }

  async deleteItem(vaultId: string, id: string) {
    await this.findOwnedItem(vaultId, id);
    await this.prisma.vaultItem.delete({ where: { id } });
    return { deleted: true };
  }

  async getSessionVersion(vaultId: string): Promise<number | null> {
    const vault = await this.prisma.vaultAccount.findUnique({
      where: { id: vaultId },
      select: { sessionVersion: true },
    });
    return vault?.sessionVersion ?? null;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────

  private async findOwnedItem(vaultId: string, id: string) {
    const item = await this.prisma.vaultItem.findUnique({ where: { id } });
    if (!item || item.vaultId !== vaultId) throw new NotFoundException('Item not found');
    return item;
  }

  private toClient(item: { id: string; vaultId: string; payload: string; createdAt: Date; updatedAt: Date }) {
    return {
      id: item.id,
      payload: JSON.parse(this.crypto.open(item.payload, this.itemContext(item.vaultId))),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private assertNotLockedOut(lockedUntil: Date | null) {
    if (lockedUntil && lockedUntil > new Date()) {
      throw new HttpException(
        { message: 'Too many failed attempts. Vault is temporarily locked.', lockedUntil },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /** Counts a wrong master password atomically and always throws. */
  private async recordFailure(vaultId: string): Promise<never> {
    const { failedAttempts } = await this.prisma.vaultAccount.update({
      where: { id: vaultId },
      data: { failedAttempts: { increment: 1 } },
      select: { failedAttempts: true },
    });
    if (failedAttempts % MAX_ATTEMPTS_BEFORE_LOCKOUT === 0) {
      // 15 min, 30 min, 1 h, ... capped at 24 h.
      const rounds = failedAttempts / MAX_ATTEMPTS_BEFORE_LOCKOUT - 1;
      const lockedUntil = new Date(
        Date.now() + Math.min(BASE_LOCKOUT_MS * 2 ** rounds, MAX_LOCKOUT_MS),
      );
      await this.prisma.vaultAccount.update({ where: { id: vaultId }, data: { lockedUntil } });
      throw new HttpException(
        { message: 'Too many failed attempts. Vault is temporarily locked.', lockedUntil },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    throw new UnauthorizedException({
      message: 'Wrong master password',
      attemptsLeft: MAX_ATTEMPTS_BEFORE_LOCKOUT - (failedAttempts % MAX_ATTEMPTS_BEFORE_LOCKOUT),
    });
  }

  private issueSession(adminId: string, vaultId: string, sessionVersion: number) {
    return this.crypto.signSession({ adminId, vaultId, sessionVersion });
  }

  private dekContext(vaultId: string) {
    return `vault-dek:${vaultId}`;
  }

  private itemContext(vaultId: string) {
    return `vault-item:${vaultId}`;
  }
}
