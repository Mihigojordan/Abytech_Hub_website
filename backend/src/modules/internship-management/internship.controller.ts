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
  Query,
} from '@nestjs/common';
import { InternshipService } from './internship.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { InternshipStatus, InternshipType, InternshipPeriod } from '../../../generated/prisma';

@Controller('internships')
export class InternshipController {
  constructor(private readonly internshipService: InternshipService) {}

  // Submit application (public - no auth required)
  @Post('apply')
  async create(@Body() data: any) {
    return this.internshipService.create(data);
  }

  // Get all applications with pagination and filters (admin only)
  @Get()
  @UseGuards(AdminJwtAuthGuard)
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('status') status?: InternshipStatus,
    @Query('internshipType') internshipType?: InternshipType,
    @Query('period') period?: InternshipPeriod,
    @Query('isShortlisted') isShortlisted?: string,
    @Query('isContacted') isContacted?: string,
    @Query('country') country?: string,
  ) {
    return this.internshipService.findAll(
      parseInt(page),
      parseInt(limit),
      search,
      status,
      internshipType,
      period,
      isShortlisted === 'true' ? true : isShortlisted === 'false' ? false : undefined,
      isContacted === 'true' ? true : isContacted === 'false' ? false : undefined,
      country,
    );
  }

  // Get shortlisted applications
  @Get('shortlisted')
  @UseGuards(AdminJwtAuthGuard)
  async findShortlisted(@Query('limit') limit = '10') {
    return this.internshipService.findShortlisted(parseInt(limit));
  }

  // Get application statistics
  @Get('stats')
  @UseGuards(AdminJwtAuthGuard)
  async getStats() {
    return this.internshipService.getStats();
  }

  // Get one application by ID
  @Get(':id')
  @UseGuards(AdminJwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.internshipService.findOne(id);
  }

  // Update application
  @Put(':id')
  @UseGuards(AdminJwtAuthGuard)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.internshipService.update(id, data);
  }

  // Update application status
  @Patch(':id/status')
  @UseGuards(AdminJwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: InternshipStatus,
  ) {
    return this.internshipService.updateStatus(id, status);
  }

  // Review application
  @Post(':id/review')
  @UseGuards(AdminJwtAuthGuard)
  async review(
    @Param('id') id: string,
    @Req() req: RequestWithAdmin,
    @Body() reviewData: { score?: number; reviewNotes?: string; status?: InternshipStatus },
  ) {
    const adminId = req.admin?.id as any;
    return this.internshipService.review(id, adminId, reviewData);
  }

  // Toggle shortlist status
  @Patch(':id/shortlist')
  @UseGuards(AdminJwtAuthGuard)
  async toggleShortlist(@Param('id') id: string) {
    return this.internshipService.toggleShortlist(id);
  }

  // Mark as contacted
  @Patch(':id/contacted')
  @UseGuards(AdminJwtAuthGuard)
  async markAsContacted(@Param('id') id: string) {
    return this.internshipService.markAsContacted(id);
  }

  // Bulk update status
  @Patch('bulk/status')
  @UseGuards(AdminJwtAuthGuard)
  async bulkUpdateStatus(
    @Body() body: { ids: string[]; status: InternshipStatus },
  ) {
    return this.internshipService.bulkUpdateStatus(body.ids, body.status);
  }

  // Delete application
  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.internshipService.remove(id);
  }
}
