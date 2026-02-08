import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WeeklyGoalStatus } from '../../../generated/prisma';

@Injectable()
export class WeeklyGoalService {
  constructor(private prisma: PrismaService) {}

  // Create weekly goal
  async create(data: any, adminId: string) {
    try {
      const weekStart = new Date(data.weekStart);
      const weekEnd = new Date(data.weekEnd);

      if (weekEnd <= weekStart) {
        throw new BadRequestException('Week end must be after week start');
      }

      // Parse tasks if it's a string
      let tasks = data.tasks;
      if (typeof tasks === 'string') {
        tasks = JSON.parse(tasks);
      }

      return await this.prisma.weeklyGoal.create({
        data: {
          title: data.title,
          description: data.description,
          weekStart,
          weekEnd,
          status: data.status || 'PENDING',
          progress: data.progress || 0,
          tasks: tasks || [],
          owner: { connect: { id: adminId } },
        },
        include: { owner: true },
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to create weekly goal: ' + error.message);
    }
  }

  // Get all weekly goals with pagination and filters
  async findAll(
    page = 1,
    limit = 10,
    search = '',
    status?: WeeklyGoalStatus,
    ownerId?: string,
    weekStart?: string,
    weekEnd?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (ownerId) where.ownerId = ownerId;

    if (weekStart || weekEnd) {
      where.weekStart = {};
      if (weekStart) where.weekStart.gte = new Date(weekStart);
      if (weekEnd) where.weekStart.lte = new Date(weekEnd);
    }

    const [data, total] = await Promise.all([
      this.prisma.weeklyGoal.findMany({
        where,
        include: { owner: true },
        skip,
        take: limit,
        orderBy: { weekStart: 'desc' },
      }),
      this.prisma.weeklyGoal.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get current week goals
  async findCurrentWeek(ownerId?: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const where: any = {
      weekStart: { lte: endOfWeek },
      weekEnd: { gte: startOfWeek },
    };

    if (ownerId) where.ownerId = ownerId;

    return this.prisma.weeklyGoal.findMany({
      where,
      include: { owner: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get my goals (for current admin)
  async findMyGoals(adminId: string, limit = 10) {
    return this.prisma.weeklyGoal.findMany({
      where: { ownerId: adminId },
      include: { owner: true },
      take: limit,
      orderBy: { weekStart: 'desc' },
    });
  }

  // Get one weekly goal by ID
  async findOne(id: string) {
    const goal = await this.prisma.weeklyGoal.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!goal) {
      throw new NotFoundException('Weekly goal not found');
    }

    return goal;
  }

  // Update weekly goal
  async update(id: string, data: any) {
    const goal = await this.prisma.weeklyGoal.findUnique({ where: { id } });
    if (!goal) {
      throw new NotFoundException('Weekly goal not found');
    }

    const updateData: any = { ...data };

    if (data.weekStart) {
      updateData.weekStart = new Date(data.weekStart);
    }
    if (data.weekEnd) {
      updateData.weekEnd = new Date(data.weekEnd);
    }

    // Parse tasks if it's a string
    if (typeof data.tasks === 'string') {
      updateData.tasks = JSON.parse(data.tasks);
    }

    return this.prisma.weeklyGoal.update({
      where: { id },
      data: updateData,
      include: { owner: true },
    });
  }

  // Update status
  async updateStatus(id: string, status: WeeklyGoalStatus) {
    const goal = await this.prisma.weeklyGoal.findUnique({ where: { id } });
    if (!goal) {
      throw new NotFoundException('Weekly goal not found');
    }

    return this.prisma.weeklyGoal.update({
      where: { id },
      data: { status },
      include: { owner: true },
    });
  }

  // Update progress
  async updateProgress(id: string, progress: number) {
    const goal = await this.prisma.weeklyGoal.findUnique({ where: { id } });
    if (!goal) {
      throw new NotFoundException('Weekly goal not found');
    }

    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    // Auto-update status based on progress
    let status = goal.status;
    if (progress === 100) {
      status = 'COMPLETED';
    } else if (progress > 0 && status === 'PENDING') {
      status = 'IN_PROGRESS';
    }

    return this.prisma.weeklyGoal.update({
      where: { id },
      data: { progress, status },
      include: { owner: true },
    });
  }

  // Add task to goal
  async addTask(id: string, task: { title: string; description?: string; done?: boolean }) {
    const goal = await this.prisma.weeklyGoal.findUnique({ where: { id } });
    if (!goal) {
      throw new NotFoundException('Weekly goal not found');
    }

    const tasks = (goal.tasks as any[]) || [];
    tasks.push({
      id: Date.now().toString(),
      title: task.title,
      description: task.description || '',
      done: task.done ?? false,
      createdAt: new Date().toISOString(),
    });

    // Calculate progress based on completed tasks
    const completedCount = tasks.filter(t => t.done).length;
    const progress = Math.round((completedCount / tasks.length) * 100);

    return this.prisma.weeklyGoal.update({
      where: { id },
      data: { tasks, progress },
      include: { owner: true },
    });
  }

  // Toggle task completion
  async toggleTask(id: string, taskId: string) {
    const goal = await this.prisma.weeklyGoal.findUnique({ where: { id } });
    if (!goal) {
      throw new NotFoundException('Weekly goal not found');
    }

    const tasks = (goal.tasks as any[]) || [];
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );

    // Calculate progress based on completed tasks
    const completedCount = updatedTasks.filter(t => t.done).length;
    const progress = updatedTasks.length > 0
      ? Math.round((completedCount / updatedTasks.length) * 100)
      : 0;

    // Auto-update status
    let status = goal.status;
    if (progress === 100) {
      status = 'COMPLETED';
    } else if (progress > 0 && status === 'PENDING') {
      status = 'IN_PROGRESS';
    } else if (progress < 100 && status === 'COMPLETED') {
      status = 'IN_PROGRESS';
    }

    return this.prisma.weeklyGoal.update({
      where: { id },
      data: { tasks: updatedTasks, progress, status },
      include: { owner: true },
    });
  }

  // Remove task
  async removeTask(id: string, taskId: string) {
    const goal = await this.prisma.weeklyGoal.findUnique({ where: { id } });
    if (!goal) {
      throw new NotFoundException('Weekly goal not found');
    }

    const tasks = (goal.tasks as any[]) || [];
    const updatedTasks = tasks.filter(t => t.id !== taskId);

    // Recalculate progress
    const completedCount = updatedTasks.filter(t => t.done).length;
    const progress = updatedTasks.length > 0
      ? Math.round((completedCount / updatedTasks.length) * 100)
      : 0;

    return this.prisma.weeklyGoal.update({
      where: { id },
      data: { tasks: updatedTasks, progress },
      include: { owner: true },
    });
  }

  // Add review notes
  async addReviewNotes(id: string, reviewNotes: string) {
    const goal = await this.prisma.weeklyGoal.findUnique({ where: { id } });
    if (!goal) {
      throw new NotFoundException('Weekly goal not found');
    }

    return this.prisma.weeklyGoal.update({
      where: { id },
      data: { reviewNotes },
      include: { owner: true },
    });
  }

  // Delete weekly goal
  async remove(id: string) {
    const goal = await this.prisma.weeklyGoal.findUnique({ where: { id } });
    if (!goal) {
      throw new NotFoundException('Weekly goal not found');
    }

    return this.prisma.weeklyGoal.delete({ where: { id } });
  }

  // Get statistics
  async getStats(ownerId?: string) {
    const where: any = {};
    if (ownerId) where.ownerId = ownerId;

    const [total, pending, inProgress, completed, missed] = await Promise.all([
      this.prisma.weeklyGoal.count({ where }),
      this.prisma.weeklyGoal.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.weeklyGoal.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      this.prisma.weeklyGoal.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.weeklyGoal.count({ where: { ...where, status: 'MISSED' } }),
    ]);

    // Calculate average progress
    const avgProgress = await this.prisma.weeklyGoal.aggregate({
      where,
      _avg: { progress: true },
    });

    return {
      total,
      pending,
      inProgress,
      completed,
      missed,
      averageProgress: Math.round(avgProgress._avg.progress || 0),
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}
