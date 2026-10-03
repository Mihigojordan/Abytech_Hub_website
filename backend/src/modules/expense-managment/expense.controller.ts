import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Put,
  Delete,
  Req,
  UseGuards,
  HttpException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ExpenseService } from './expense.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import {
  ExpenseFileFields,
  ExpenseUploadConfig,
} from 'src/common/utils/file-upload.utils';

type ExpenseFiles = { receipt?: Express.Multer.File[] };

const receiptPath = (files?: ExpenseFiles) => {
  const file = files?.receipt?.[0];
  return file ? `/uploads/expense_receipts/${file.filename}` : undefined;
};

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  // ✅ Create Expense (adminId passed separately, optional receipt upload)
  @Post()
  @UseGuards(AdminJwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor(ExpenseFileFields, ExpenseUploadConfig))
  async create(
    @Body() body: any,
    @Req() req: RequestWithAdmin,
    @UploadedFiles() files: ExpenseFiles,
  ) {
    const adminId = req.admin?.id;
    if (!adminId) throw new HttpException('Unauthorized admin', 401);

    try {
      return await this.expenseService.create(body, adminId, receiptPath(files));
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @Get()
  async findAll() {
    return this.expenseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor(ExpenseFileFields, ExpenseUploadConfig))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: ExpenseFiles,
  ) {
    return this.expenseService.update(id, body, receiptPath(files));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.expenseService.remove(id);
  }
}
