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
import { HostedWebsiteService } from './hosted-website.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { WebsiteStatus } from '../../../generated/prisma';

@Controller('hosted-websites')
export class HostedWebsiteController {
  constructor(private readonly hostedWebsiteService: HostedWebsiteService) {}

  // Create new website
  @Post()
  @UseGuards(AdminJwtAuthGuard)
  async create(@Body() data: any) {
    return this.hostedWebsiteService.create(data);
  }

  // Get all websites with pagination and filters
  @Get()
  @UseGuards(AdminJwtAuthGuard)
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('status') status?: WebsiteStatus,
  ) {
    return this.hostedWebsiteService.findAll(
      parseInt(page),
      parseInt(limit),
      search,
      status,
    );
  }

  // Get active websites (public)
  @Get('active')
  async findActive() {
    return this.hostedWebsiteService.findActive();
  }

  // Get website statistics
  @Get('stats')
  @UseGuards(AdminJwtAuthGuard)
  async getStats() {
    return this.hostedWebsiteService.getStats();
  }

  // Check domain availability
  @Get('check-domain/:domain')
  async checkDomainAvailability(@Param('domain') domain: string) {
    return this.hostedWebsiteService.checkDomainAvailability(domain);
  }

  // Get website by domain
  @Get('domain/:domain')
  async findByDomain(@Param('domain') domain: string) {
    return this.hostedWebsiteService.findByDomain(domain);
  }

  // Get one website by ID
  @Get(':id')
  @UseGuards(AdminJwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.hostedWebsiteService.findOne(id);
  }

  // Update website
  @Put(':id')
  @UseGuards(AdminJwtAuthGuard)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.hostedWebsiteService.update(id, data);
  }

  // Update website status
  @Patch(':id/status')
  @UseGuards(AdminJwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: WebsiteStatus,
  ) {
    return this.hostedWebsiteService.updateStatus(id, status);
  }

  // Suspend website
  @Patch(':id/suspend')
  @UseGuards(AdminJwtAuthGuard)
  async suspend(@Param('id') id: string) {
    return this.hostedWebsiteService.suspend(id);
  }

  // Activate website
  @Patch(':id/activate')
  @UseGuards(AdminJwtAuthGuard)
  async activate(@Param('id') id: string) {
    return this.hostedWebsiteService.activate(id);
  }

  // Mark as expired
  @Patch(':id/expire')
  @UseGuards(AdminJwtAuthGuard)
  async expire(@Param('id') id: string) {
    return this.hostedWebsiteService.expire(id);
  }

  // Delete website
  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.hostedWebsiteService.remove(id);
  }
}
