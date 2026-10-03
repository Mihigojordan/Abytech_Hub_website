import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from 'crypto';

// Server-side layer of the password locker. The browser already encrypts
// every secret with a key only the admin's master password can produce; this
// service adds a second, independent AES-256-GCM layer keyed by
// VAULT_SERVER_KEY so a leaked database dump alone is useless, and handles
// the password-equivalent proof (authKey) and vault session tokens.

const ENVELOPE_VERSION = 'v1';
const SCRYPT = { N: 1 << 15, r: 8, p: 1, keyLen: 64, maxmem: 64 * 1024 * 1024 };
export const VAULT_SESSION_TTL_MS = 30 * 60 * 1000;

export interface VaultSessionClaims {
  adminId: string;
  vaultId: string;
  sessionVersion: number;
  exp: number;
}

@Injectable()
export class VaultCryptoService {
  private keys?: { wrap: Buffer; session: Buffer };

  private getKeys() {
    if (this.keys) return this.keys;
    const hex = process.env.VAULT_SERVER_KEY ?? '';
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      // Never fall back to a default key: a vault without a real server key
      // would silently lose its second layer of protection.
      throw new ServiceUnavailableException(
        'Password locker is not configured (VAULT_SERVER_KEY must be 64 hex chars)',
      );
    }
    const master = Buffer.from(hex, 'hex');
    const derive = (info: string) =>
      Buffer.from(hkdfSync('sha256', master, Buffer.alloc(0), info, 32));
    this.keys = {
      wrap: derive('abydash-vault/server-wrap/v1'),
      session: derive('abydash-vault/session/v1'),
    };
    return this.keys;
  }

  /** AES-256-GCM wrap, bound to `context` (e.g. the owning vault id) via AAD. */
  seal(plaintext: string, context: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.getKeys().wrap, iv);
    cipher.setAAD(Buffer.from(context, 'utf8'));
    const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${ENVELOPE_VERSION}.${Buffer.concat([iv, tag, ct]).toString('base64')}`;
  }

  open(envelope: string, context: string): string {
    const [version, body] = envelope.split('.');
    if (version !== ENVELOPE_VERSION || !body) {
      throw new ServiceUnavailableException('Unsupported vault envelope');
    }
    const raw = Buffer.from(body, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', this.getKeys().wrap, raw.subarray(0, 12));
    decipher.setAAD(Buffer.from(context, 'utf8'));
    decipher.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8');
  }

  newSalt(): string {
    return randomBytes(16).toString('base64');
  }

  hashAuthKey(authKey: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      scrypt(
        Buffer.from(authKey, 'base64'),
        Buffer.from(salt, 'base64'),
        SCRYPT.keyLen,
        { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: SCRYPT.maxmem },
        (err, key) => (err ? reject(err) : resolve(key.toString('hex'))),
      );
    });
  }

  async verifyAuthKey(authKey: string, salt: string, expectedHex: string): Promise<boolean> {
    const actual = Buffer.from(await this.hashAuthKey(authKey, salt), 'hex');
    const expected = Buffer.from(expectedHex, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  signSession(claims: Omit<VaultSessionClaims, 'exp'>): string {
    const body = Buffer.from(
      JSON.stringify({ ...claims, exp: Date.now() + VAULT_SESSION_TTL_MS }),
    ).toString('base64url');
    return `${body}.${this.mac(body)}`;
  }

  verifySession(token: string | undefined): VaultSessionClaims {
    const [body, mac] = (token ?? '').split('.');
    if (!body || !mac) throw new UnauthorizedException('Vault is locked');
    const expected = Buffer.from(this.mac(body));
    const given = Buffer.from(mac);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
      throw new UnauthorizedException('Vault is locked');
    }
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as VaultSessionClaims;
    if (typeof claims.exp !== 'number' || claims.exp < Date.now()) {
      throw new UnauthorizedException('Vault session expired');
    }
    return claims;
  }

  private mac(body: string): string {
    return createHmac('sha256', this.getKeys().session).update(body).digest('base64url');
  }
}
