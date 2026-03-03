import {
    Body,
    Controller,
    Get,
    Post,
    Param,
    Put,
    Patch,
    Delete,
    Query,
    Req,
    UseGuards,
    HttpException,
} from '@nestjs/common';
import { SalaryService } from './salary.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('salary')
export class SalaryController {
    constructor(private readonly salaryService: SalaryService) { }

    // ✅ Employee submits salary request
    @Post()
    @UseGuards(AdminJwtAuthGuard)
    async create(@Body() body: any, @Req() req: RequestWithAdmin) {
        const adminId = req.admin?.id;
        if (!adminId) throw new HttpException('Unauthorized', 401);
        try {
            return await this.salaryService.create(body, adminId);
        } catch (error) {
            throw new HttpException(error.message, error.status || 400);
        }
    }

    // ✅ Get salary statistics
    @Get('stats')
    @UseGuards(AdminJwtAuthGuard)
    async getStats() {
        try {
            return await this.salaryService.getStats();
        } catch (error) {
            throw new HttpException(error.message, error.status || 400);
        }
    }

    // ✅ List all salary requests (with filters)
    @Get()
    @UseGuards(AdminJwtAuthGuard)
    async findAll(@Query() query: any) {
        try {
            return await this.salaryService.findAll(query);
        } catch (error) {
            throw new HttpException(error.message, error.status || 400);
        }
    }

    // ✅ Get single salary request
    @Get(':id')
    @UseGuards(AdminJwtAuthGuard)
    async findOne(@Param('id') id: string) {
        try {
            return await this.salaryService.findOne(id);
        } catch (error) {
            throw new HttpException(error.message, error.status || 400);
        }
    }

    // ✅ Update salary request (only if PENDING)
    @Put(':id')
    @UseGuards(AdminJwtAuthGuard)
    async update(@Param('id') id: string, @Body() body: any) {
        try {
            return await this.salaryService.update(id, body);
        } catch (error) {
            throw new HttpException(error.message, error.status || 400);
        }
    }

    // ✅ Approve salary request (boss can set bonus/deduction here)
    @Patch(':id/approve')
    @UseGuards(AdminJwtAuthGuard)
    async approve(
        @Param('id') id: string,
        @Body() body: { bonus?: number; deduction?: number },
        @Req() req: RequestWithAdmin,
    ) {
        const processedById = req.admin?.id;
        if (!processedById) throw new HttpException('Unauthorized', 401);
        try {
            return await this.salaryService.approve(
                id,
                processedById,
                body.bonus,
                body.deduction,
            );
        } catch (error) {
            throw new HttpException(error.message, error.status || 400);
        }
    }

    // ✅ Reject salary request
    @Patch(':id/reject')
    @UseGuards(AdminJwtAuthGuard)
    async reject(
        @Param('id') id: string,
        @Body() body: { rejectionReason?: string },
        @Req() req: RequestWithAdmin,
    ) {
        const processedById = req.admin?.id;
        if (!processedById) throw new HttpException('Unauthorized', 401);
        try {
            return await this.salaryService.reject(id, processedById, body.rejectionReason);
        } catch (error) {
            throw new HttpException(error.message, error.status || 400);
        }
    }

    // ✅ Mark salary as Paid
    @Patch(':id/pay')
    @UseGuards(AdminJwtAuthGuard)
    async markAsPaid(@Param('id') id: string, @Req() req: RequestWithAdmin) {
        const processedById = req.admin?.id;
        if (!processedById) throw new HttpException('Unauthorized', 401);
        try {
            return await this.salaryService.markAsPaid(id, processedById);
        } catch (error) {
            throw new HttpException(error.message, error.status || 400);
        }
    }

    // ✅ Delete salary request
    @Delete(':id')
    @UseGuards(AdminJwtAuthGuard)
    async remove(@Param('id') id: string) {
        try {
            return await this.salaryService.remove(id);
        } catch (error) {
            throw new HttpException(error.message, error.status || 400);
        }
    }
}
