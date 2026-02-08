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
  Query,
} from '@nestjs/common';
import { DemoRequestService } from './demo-request.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { DemoRequestStatus, DemoType } from '../../../generated/prisma';

@Controller('demo-requests')
export class DemoRequestController {
  constructor(private readonly demoRequestService: DemoRequestService) {}

  // Submit demo request (public - no auth required)
  @Post()
  async create(@Body() data: any) {
    return this.demoRequestService.create(data);
  }

  // Get all demo requests with pagination and filters (admin only)
  @Get()
  @UseGuards(AdminJwtAuthGuard)
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('status') status?: DemoRequestStatus,
    @Query('demoType') demoType?: DemoType,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.demoRequestService.findAll(
      parseInt(page),
      parseInt(limit),
      search,
      status,
      demoType,
      assignedToId,
    );
  }

  // Get pending requests
  @Get('pending')
  @UseGuards(AdminJwtAuthGuard)
  async findPending(@Query('limit') limit = '10') {
    return this.demoRequestService.findPending(parseInt(limit));
  }

  // Get scheduled demos
  @Get('scheduled')
  @UseGuards(AdminJwtAuthGuard)
  async findScheduled(@Query('limit') limit = '10') {
    return this.demoRequestService.findScheduled(parseInt(limit));
  }

  // Get statistics
  @Get('stats')
  @UseGuards(AdminJwtAuthGuard)
  async getStats() {
    return this.demoRequestService.getStats();
  }

  // Get one demo request by ID
  @Get(':id')
  @UseGuards(AdminJwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.demoRequestService.findOne(id);
  }

  // Update demo request
  @Put(':id')
  @UseGuards(AdminJwtAuthGuard)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.demoRequestService.update(id, data);
  }

  // Update status
  @Patch(':id/status')
  @UseGuards(AdminJwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: DemoRequestStatus,
  ) {
    return this.demoRequestService.updateStatus(id, status);
  }

  // Assign to admin
  @Patch(':id/assign')
  @UseGuards(AdminJwtAuthGuard)
  async assign(
    @Param('id') id: string,
    @Body('adminId') adminId: string,
  ) {
    return this.demoRequestService.assign(id, adminId);
  }

  // Schedule demo
  @Patch(':id/schedule')
  @UseGuards(AdminJwtAuthGuard)
  async schedule(
    @Param('id') id: string,
    @Body() body: { scheduledAt: string; meetingLink?: string },
  ) {
    return this.demoRequestService.schedule(id, body.scheduledAt, body.meetingLink);
  }

  // Mark as completed
  @Patch(':id/complete')
  @UseGuards(AdminJwtAuthGuard)
  async complete(
    @Param('id') id: string,
    @Body('internalNotes') internalNotes?: string,
  ) {
    return this.demoRequestService.complete(id, internalNotes);
  }

  // Cancel demo request
  @Patch(':id/cancel')
  @UseGuards(AdminJwtAuthGuard)
  async cancel(
    @Param('id') id: string,
    @Body('internalNotes') internalNotes?: string,
  ) {
    return this.demoRequestService.cancel(id, internalNotes);
  }

  // Delete demo request
  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.demoRequestService.remove(id);
  }
}
