import { Module } from '@nestjs/common';
import { VaultController } from './vault.controller';
import { VaultCryptoService } from './vault-crypto.service';
import { VaultSessionGuard } from './vault-session.guard';
import { VaultService } from './vault.service';

@Module({
  controllers: [VaultController],
  providers: [VaultService, VaultCryptoService, VaultSessionGuard],
})
export class VaultModule {}
