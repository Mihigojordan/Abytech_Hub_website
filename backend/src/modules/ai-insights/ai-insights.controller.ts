import { Controller, Get, HttpException, Query, Req, UseGuards } from '@nestjs/common';
import { AiInsightsService } from './ai-insights.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

const ALLOWED_PERIODS = [1, 3, 6, 12];

@Controller('ai-insights')
@UseGuards(AdminJwtAuthGuard)
export class AiInsightsController {
  constructor(private readonly aiInsightsService: AiInsightsService) {}

  // GET /ai-insights?months=6&refresh=true
  @Get()
  async getInsights(
    @Req() req: RequestWithAdmin,
    @Query('months') months?: string,
    @Query('refresh') refresh?: string,
  ) {
    const adminId = req.admin?.id;
    if (!adminId) throw new HttpException('Unauthorized admin', 401);
    await this.aiInsightsService.assertSuperAdmin(adminId);

    const period = ALLOWED_PERIODS.includes(Number(months)) ? Number(months) : 6;
    return this.aiInsightsService.getInsights(period, refresh === 'true');
  }
}
