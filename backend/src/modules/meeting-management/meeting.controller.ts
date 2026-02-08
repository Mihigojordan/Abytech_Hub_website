import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { MeetingService } from './meeting.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AttachmentsFileFields, AttachmentsUploadConfig } from 'src/common/utils/file-upload.utils';
import { MeetingStatus } from '../../../generated/prisma';

@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  // Create new meeting
  @Post()
  @UseGuards(AdminJwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor(AttachmentsFileFields, AttachmentsUploadConfig))
  async create(
    @Body() data: any,
    @Req() req: RequestWithAdmin,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] }
  ) {
    const adminId = req.admin?.id;
    if (!adminId) throw new HttpException('Unauthorized admin', 401);

    // Parse JSON fields if they're strings (from FormData)
    if (typeof data.participants === 'string') {
      data.participants = JSON.parse(data.participants);
    }
    if (typeof data.keyPoints === 'string') {
      data.keyPoints = JSON.parse(data.keyPoints);
    }
    if (typeof data.actionItems === 'string') {
      data.actionItems = JSON.parse(data.actionItems);
    }

    if (files?.attachments) {
      data.attachments = files.attachments.map(file => ({
        fileName: file.originalname,
        fileUrl: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
      }));
    }

    return this.meetingService.create(data, adminId);
  }

  // Get all meetings with pagination and filters
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('status') status?: MeetingStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('createdById') createdById?: string,
  ) {
    return this.meetingService.findAll(
      parseInt(page),
      parseInt(limit),
      search,
      status,
      startDate,
      endDate,
      createdById,
    );
  }

  // Get upcoming meetings
  @Get('upcoming')
  async findUpcoming(
    @Query('limit') limit = '5',
    @Query('adminId') adminId?: string,
  ) {
    return this.meetingService.findUpcoming(parseInt(limit), adminId);
  }

  // Get meeting statistics
  @Get('stats')
  @UseGuards(AdminJwtAuthGuard)
  async getStats(@Query('adminId') adminId?: string) {
    return this.meetingService.getStats(adminId);
  }

  // Get one meeting by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.meetingService.findOne(id);
  }

  // Update meeting
  @Put(':id')
  @UseGuards(AdminJwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor(AttachmentsFileFields, AttachmentsUploadConfig))
  async update(
    @Param('id') id: string,
    @Body() data: any,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] }
  ) {
    // Parse JSON fields if they're strings
    if (typeof data.participants === 'string') {
      data.participants = JSON.parse(data.participants);
    }
    if (typeof data.keyPoints === 'string') {
      data.keyPoints = JSON.parse(data.keyPoints);
    }
    if (typeof data.actionItems === 'string') {
      data.actionItems = JSON.parse(data.actionItems);
    }

    if (files?.attachments) {
      data.attachments = files.attachments.map(file => ({
        fileName: file.originalname,
        fileUrl: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
      }));
    }

    return this.meetingService.update(id, data);
  }

  // Update meeting status
  @Patch(':id/status')
  @UseGuards(AdminJwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: MeetingStatus,
  ) {
    return this.meetingService.updateStatus(id, status);
  }

  // Add participant to meeting
  @Post(':id/participants')
  @UseGuards(AdminJwtAuthGuard)
  async addParticipant(
    @Param('id') id: string,
    @Body() participant: { adminId: string; name: string; attended?: boolean },
  ) {
    return this.meetingService.addParticipant(id, participant);
  }

  // Remove participant from meeting
  @Delete(':id/participants/:adminId')
  @UseGuards(AdminJwtAuthGuard)
  async removeParticipant(
    @Param('id') id: string,
    @Param('adminId') adminId: string,
  ) {
    return this.meetingService.removeParticipant(id, adminId);
  }

  // Update participant attendance
  @Patch(':id/participants/:adminId/attendance')
  @UseGuards(AdminJwtAuthGuard)
  async updateParticipantAttendance(
    @Param('id') id: string,
    @Param('adminId') adminId: string,
    @Body('attended') attended: boolean,
  ) {
    return this.meetingService.updateParticipantAttendance(id, adminId, attended);
  }

  // Add action item
  @Post(':id/action-items')
  @UseGuards(AdminJwtAuthGuard)
  async addActionItem(
    @Param('id') id: string,
    @Body() actionItem: { task: string; assignedToId?: string; dueDate?: string; completed?: boolean },
  ) {
    return this.meetingService.addActionItem(id, actionItem);
  }

  // Update action item status
  @Patch(':id/action-items/:actionItemId')
  @UseGuards(AdminJwtAuthGuard)
  async updateActionItemStatus(
    @Param('id') id: string,
    @Param('actionItemId') actionItemId: string,
    @Body('completed') completed: boolean,
  ) {
    return this.meetingService.updateActionItemStatus(id, actionItemId, completed);
  }

  // Add key point
  @Post(':id/key-points')
  @UseGuards(AdminJwtAuthGuard)
  async addKeyPoint(
    @Param('id') id: string,
    @Body() keyPoint: { title: string; notes?: string; actionItems?: string[] },
  ) {
    return this.meetingService.addKeyPoint(id, keyPoint);
  }

  // Delete meeting
  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.meetingService.remove(id);
  }
}
