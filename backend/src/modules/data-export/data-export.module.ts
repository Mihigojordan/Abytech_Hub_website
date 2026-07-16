import { Module } from '@nestjs/common';
import { DataExportService } from './data-export.service';
import { DataImportService } from './data-import.service';
import { DataExportController } from './data-export.controller';

@Module({
  controllers: [DataExportController],
  providers: [DataExportService, DataImportService],
})
export class DataExportModule {}
