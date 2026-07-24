import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual } from 'crypto';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

/**
 * Guards the export endpoint so it can be called either interactively by a
 * logged-in admin, or unattended by the external Backup-auto service.
 *
 * Passes if EITHER:
 *  - the existing interactive admin JWT-cookie check (AdminJwtAuthGuard) passes, exactly
 *    as it does everywhere else in the app, OR
 *  - the request carries an `x-backup-api-key` header that matches
 *    `process.env.BACKUP_SERVICE_API_KEY` (compared with a constant-time comparison).
 *
 * Extends AdminJwtAuthGuard and delegates to `super.canActivate()` for the admin path so
 * that interactive admin behavior (cookie name, JWT secret, `request.admin` shape, and the
 * UnauthorizedException thrown on failure) stays byte-for-byte identical to the original guard.
 */
@Injectable()
export class AdminOrBackupKeyGuard extends AdminJwtAuthGuard {
  constructor(jwtService: JwtService) {
    super(jwtService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAdmin>();

    if (this.hasValidBackupApiKey(request)) {
      return true;
    }

    // Not a valid backup-service call: fall back to the original admin JWT-cookie check.
    // This throws the same UnauthorizedException the original guard throws on failure.
    return super.canActivate(context);
  }

  private hasValidBackupApiKey(request: RequestWithAdmin): boolean {
    const provided = request.headers['x-backup-api-key'];
    const expected = process.env.BACKUP_SERVICE_API_KEY;

    if (!expected || typeof provided !== 'string' || provided.length === 0) {
      return false;
    }

    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);

    // timingSafeEqual throws if buffer lengths differ, so check that first.
    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    const matches = timingSafeEqual(providedBuffer, expectedBuffer);
    if (matches) {
      request.isBackupServiceCall = true;
    }
    return matches;
  }
}
