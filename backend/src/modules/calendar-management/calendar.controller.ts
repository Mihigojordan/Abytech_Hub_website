import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

// Every route is scoped to the logged-in admin's own calendar
@Controller('calendar')
@UseGuards(AdminJwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  private adminId(req: RequestWithAdmin) {
    const adminId = req.admin?.id;
    if (!adminId) throw new HttpException('Unauthorized admin', 401);
    return adminId;
  }

  @Get()
  async findAll(
    @Req() req: RequestWithAdmin,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.calendarService.findAll(this.adminId(req), from, to);
  }

  @Post()
  async create(@Body() body: any, @Req() req: RequestWithAdmin) {
    return this.calendarService.create(body, this.adminId(req));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: RequestWithAdmin) {
    return this.calendarService.update(id, body, this.adminId(req));
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestWithAdmin) {
    return this.calendarService.remove(id, this.adminId(req));
  }
}
