import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { VaultCryptoService } from './vault-crypto.service';
import { VaultService } from './vault.service';

export const VAULT_SESSION_COOKIE = 'VaultSession';

export interface RequestWithVault extends RequestWithAdmin {
  vault?: { id: string };
}

/**
 * Second gate after AdminJwtAuthGuard: the admin must also have unlocked
 * their vault recently (short-lived, HMAC-signed cookie), the token must
 * belong to the same admin, and it must not have been revoked by a lock or
 * master password change.
 */
@Injectable()
export class VaultSessionGuard implements CanActivate {
  constructor(
    private readonly crypto: VaultCryptoService,
    private readonly vaultService: VaultService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithVault>();
    const claims = this.crypto.verifySession(req.cookies?.[VAULT_SESSION_COOKIE]);
    if (!req.admin?.id || claims.adminId !== req.admin.id) {
      throw new UnauthorizedException('Vault is locked');
    }
    const current = await this.vaultService.getSessionVersion(claims.vaultId);
    if (current === null || current !== claims.sessionVersion) {
      throw new UnauthorizedException('Vault is locked');
    }
    req.vault = { id: claims.vaultId };
    return true;
  }
}
