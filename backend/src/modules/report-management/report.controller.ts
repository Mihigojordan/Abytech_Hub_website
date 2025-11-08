import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpException,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ReportFileFields, ReportUploadConfig } from 'src/common/utils/file-upload.utils';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  // ✅ Create a new report (uses admin ID from req.user)
  @Post()
  @UseGuards(AdminJwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor(ReportFileFields, ReportUploadConfig))
  async create(
    @Body() data: any,
    @Req() req: RequestWithAdmin,
    @UploadedFiles() files: { reportUrl?: Express.Multer.File[] }
  ) {
    const adminId = req.admin?.id;
    if (!adminId) throw new HttpException('Unauthorized admin', 401);

    // If a file is uploaded, use its path
    if (files?.reportUrl && files.reportUrl.length > 0) {
      data.reportUrl = files.reportUrl[0].path; // absolute path for Cloudinary upload
    }

    return this.reportService.create(data, adminId);
  }

  // ✅ Get all reports
@Get()
async findAll(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Query('search') search = '',
  @Query('filter') filter?: string,
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  return this.reportService.findAll(pageNum, limitNum, search, filter, from, to);
}

  // ✅ Get one report
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  // ✅ Update report
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor(ReportFileFields, ReportUploadConfig))
  async update(
    @Param('id') id: string,
    @Body() data: any,
    @UploadedFiles() files: { reportUrl?: Express.Multer.File[] }
  ) {
    // If a new file is uploaded, set data.reportUrl to its path
    if (files?.reportUrl && files.reportUrl.length > 0) {
      data.reportUrl = files.reportUrl[0].path;
    }

    return this.reportService.update(id, data);
  }

  // ✅ Reply to a report
@Post(':id/reply')
@UseGuards(AdminJwtAuthGuard)
async replyToReport(
  @Param('id') reportId: string,
  @Body('content') content: string,
  @Req() req: RequestWithAdmin,
) {
  const adminId = req.admin?.id;
  if (!adminId) throw new HttpException('Unauthorized admin', 401);

  if (!content || content.trim() === '') {
    throw new HttpException('Reply content cannot be empty', 400);
  }

  return this.reportService.replyToReport(reportId, adminId, content);
}



  // ✅ Delete report
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reportService.remove(id);
  }
}
