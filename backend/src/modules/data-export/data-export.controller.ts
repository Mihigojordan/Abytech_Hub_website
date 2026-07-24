import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { DataExportService } from './data-export.service';
import { DataImportService } from './data-import.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { AdminOrBackupKeyGuard } from './guards/admin-or-backup-key.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('data-export')
export class DataExportController {
  constructor(
    private readonly exportService: DataExportService,
    private readonly importService: DataImportService,
    private readonly prisma: PrismaService,
  ) {}

  private async resolveActor(req: RequestWithAdmin) {
    if (req.isBackupServiceCall) {
      return { id: 'backup-service', name: 'Backup Service' };
    }
    const adminId = req.admin?.id;
    if (!adminId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId }, select: { adminName: true } });
    return { id: adminId, name: admin?.adminName ?? 'Unknown' };
  }

  // Allows either an interactive admin (JWT cookie) or the external Backup-auto
  // service (x-backup-api-key header) to trigger an export unattended.
  @Post('export')
  @UseGuards(AdminOrBackupKeyGuard)
  async export(@Body() body: any, @Req() req: RequestWithAdmin, @Res() res: Response) {
    try {
      const actor = await this.resolveActor(req);
      const { format = 'json', groups = [] } = body;

      if (format === 'excel') {
        const buffer = await this.exportService.exportExcel({ groups, adminId: actor.id, adminName: actor.name });
        const date = new Date().toISOString().split('T')[0];
        res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="abytech-export-${date}.xlsx"`,
        });
        return res.send(buffer);
      }

      if (format === 'pdf') {
        const buffer = await this.exportService.exportPdf({ groups, adminId: actor.id, adminName: actor.name });
        const date = new Date().toISOString().split('T')[0];
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="abytech-report-${date}.pdf"`,
        });
        return res.send(buffer);
      }

      // JSON (default)
      const data = await this.exportService.exportJson({ groups, adminId: actor.id, adminName: actor.name });
      const date = new Date().toISOString().split('T')[0];
      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="abytech-backup-${date}.json"`,
      });
      return res.send(JSON.stringify(data, null, 2));
    } catch (err) {
      throw new HttpException(err.message || 'Export failed', err.status ?? HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('import/preview')
  @UseGuards(AdminJwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async importPreview(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: RequestWithAdmin) {
    try {
      await this.resolveActor(req);
      if (!file) throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      const payload = JSON.parse(file.buffer.toString('utf-8'));
      const strategy = body.strategy ?? 'SKIP';
      const groups = body.groups ? JSON.parse(body.groups) : undefined;
      return this.importService.preview(payload, strategy, groups);
    } catch (err) {
      throw new HttpException(err.message || 'Preview failed', err.status ?? HttpStatus.BAD_REQUEST);
    }
  }

  @Post('import')
  @UseGuards(AdminJwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async importData(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: RequestWithAdmin) {
    try {
      const actor = await this.resolveActor(req);
      if (!file) throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      const payload = JSON.parse(file.buffer.toString('utf-8'));
      const strategy = body.strategy ?? 'SKIP';
      const groups = body.groups ? JSON.parse(body.groups) : [];
      return this.importService.commit(payload, { strategy, groups, fileName: file.originalname }, actor);
    } catch (err) {
      throw new HttpException(err.message || 'Import failed', err.status ?? HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('import/history')
  @UseGuards(AdminJwtAuthGuard)
  async getHistory(@Req() req: RequestWithAdmin) {
    await this.resolveActor(req);
    return this.importService.getHistory(50);
  }

  @Post('import/rollback/:id')
  @UseGuards(AdminJwtAuthGuard)
  async rollback(@Param('id') id: string, @Req() req: RequestWithAdmin) {
    try {
      const actor = await this.resolveActor(req);
      return this.importService.rollback(id, actor);
    } catch (err) {
      throw new HttpException(err.message || 'Rollback failed', err.status ?? HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
