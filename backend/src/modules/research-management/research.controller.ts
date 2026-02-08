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
import { ResearchService } from './research.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AttachmentsFileFields as ResearchFileFields, AttachmentsUploadConfig as ResearchUploadConfig } from 'src/common/utils/file-upload.utils';

@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  // ✅ Create new research
  @Post()
  @UseGuards(AdminJwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor(ResearchFileFields, ResearchUploadConfig))
  async create(
    @Body() data: any,
    @Req() req: RequestWithAdmin,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] }
  ) {
    const adminId = req.admin?.id;
    if (!adminId) throw new HttpException('Unauthorized admin', 401);

    if (files?.attachments) {
      data.attachments = files.attachments.map(file => ({
        filename: file.originalname,
        url: file.path,
        size: file.size,
      }));
    }

    return this.researchService.create(data, adminId);
  }

  // ✅ Get all researches with pagination and optional search
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.researchService.findAll(
      parseInt(page),
      parseInt(limit),
      search,
      status,
      type,
    );
  }

  // ✅ Get one research by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.researchService.findOne(id);
  }

  // ✅ Update research
  @Put(':id')
  @UseGuards(AdminJwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor(ResearchFileFields, ResearchUploadConfig))
  async update(
    @Param('id') id: string,
    @Body() data: any,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] }
  ) {
    if (files?.attachments) {
      data.attachments = files.attachments.map(file => ({
        filename: file.originalname,
        url: file.path,
        size: file.size,
      }));
    }

    return this.researchService.update(id, data);
  }

  // ✅ Delete research
  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.researchService.remove(id);
  }
}
