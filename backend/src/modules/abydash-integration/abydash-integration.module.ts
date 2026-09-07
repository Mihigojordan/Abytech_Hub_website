import { Module } from '@nestjs/common';
import { AbydashIntegrationController } from './abydash-integration.controller';
import { AbydashIntegrationService } from './abydash-integration.service';
import { AdminModule } from '../admin-management/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [AbydashIntegrationController],
  providers: [AbydashIntegrationService],
})
export class AbydashIntegrationModule {}
