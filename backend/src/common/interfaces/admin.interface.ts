import { Request } from 'express';

export interface RequestWithAdmin extends Request {
  admin?: {
    id: string;
  };
  /** Set by AdminOrBackupKeyGuard when authenticated via x-backup-api-key instead of an admin session. */
  isBackupServiceCall?: boolean;
}