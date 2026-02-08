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
import { WeeklyGoalService } from './weekly-goal.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { WeeklyGoalStatus } from '../../../generated/prisma';

@Controller('weekly-goals')
@UseGuards(AdminJwtAuthGuard)
export class WeeklyGoalController {
  constructor(private readonly weeklyGoalService: WeeklyGoalService) {}

  // Create weekly goal
  @Post()
  async create(@Body() data: any, @Req() req: RequestWithAdmin) {
    const adminId = req.admin?.id as any;
    return this.weeklyGoalService.create(data, adminId);
  }

  // Get all weekly goals with pagination and filters
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('status') status?: WeeklyGoalStatus,
    @Query('ownerId') ownerId?: string,
    @Query('weekStart') weekStart?: string,
    @Query('weekEnd') weekEnd?: string,
  ) {
    return this.weeklyGoalService.findAll(
      parseInt(page),
      parseInt(limit),
      search,
      status,
      ownerId,
      weekStart,
      weekEnd,
    );
  }

  // Get current week goals
  @Get('current-week')
  async findCurrentWeek(@Query('ownerId') ownerId?: string) {
    return this.weeklyGoalService.findCurrentWeek(ownerId);
  }

  // Get my goals
  @Get('my-goals')
  async findMyGoals(@Req() req: RequestWithAdmin, @Query('limit') limit = '10') {
    const adminId = req.admin?.id as  any;
    return this.weeklyGoalService.findMyGoals(adminId, parseInt(limit));
  }

  // Get statistics
  @Get('stats')
  async getStats(@Query('ownerId') ownerId?: string) {
    return this.weeklyGoalService.getStats(ownerId);
  }

  // Get one weekly goal by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.weeklyGoalService.findOne(id);
  }

  // Update weekly goal
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.weeklyGoalService.update(id, data);
  }

  // Update status
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: WeeklyGoalStatus,
  ) {
    return this.weeklyGoalService.updateStatus(id, status);
  }

  // Update progress
  @Patch(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body('progress') progress: number,
  ) {
    return this.weeklyGoalService.updateProgress(id, progress);
  }

  // Add task
  @Post(':id/tasks')
  async addTask(
    @Param('id') id: string,
    @Body() task: { title: string; description?: string; done?: boolean },
  ) {
    return this.weeklyGoalService.addTask(id, task);
  }

  // Toggle task completion
  @Patch(':id/tasks/:taskId/toggle')
  async toggleTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
  ) {
    return this.weeklyGoalService.toggleTask(id, taskId);
  }

  // Remove task
  @Delete(':id/tasks/:taskId')
  async removeTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
  ) {
    return this.weeklyGoalService.removeTask(id, taskId);
  }

  // Add review notes
  @Patch(':id/review')
  async addReviewNotes(
    @Param('id') id: string,
    @Body('reviewNotes') reviewNotes: string,
  ) {
    return this.weeklyGoalService.addReviewNotes(id, reviewNotes);
  }

  // Delete weekly goal
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.weeklyGoalService.remove(id);
  }
}
