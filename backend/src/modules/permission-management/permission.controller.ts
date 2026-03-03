import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpException,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { RequirePermission } from 'src/guards/permission.guard';
import { PERMISSIONS } from './permission.service';

@Controller('permissions')
@UseGuards(AdminJwtAuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Post('seed')
  async seedPermissions() {
    try {
      return await this.permissionService.seedPermissions();
    } catch (error) {
      throw new HttpException(error.message, error.status || 400);
    }
  }

  @Get()
  async getAllPermissions() {
    try {
      return await this.permissionService.findAll();
    } catch (error) {
      throw new HttpException(error.message, error.status || 400);
    }
  }

  @Get('me')
  async getMyPermissions(@Req() req: RequestWithAdmin) {
    try {
      return await this.permissionService.getAdminPermissions(req.admin?.id as string);
    } catch (error) {
      throw new HttpException(error.message, error.status || 400);
    }
  }

  @Get('admin/:adminId')
  @UseGuards(RequirePermission(PERMISSIONS.EMPLOYEE_MANAGEMENT))
  async getAdminPermissions(@Param('adminId') adminId: string) {
    try {
      return await this.permissionService.getAdminPermissions(adminId);
    } catch (error) {
      throw new HttpException(error.message, error.status || 400);
    }
  }

  @Post('assign')
  @UseGuards(RequirePermission(PERMISSIONS.EMPLOYEE_MANAGEMENT))
  async assignPermission(
    @Body() body: { adminId: string; permissionName: string },
    @Req() req: RequestWithAdmin,
  ) {
    try {
      return await this.permissionService.assignPermission(
        body.adminId, body.permissionName, req.admin?.id as string,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || 400);
    }
  }

  @Delete('revoke')
  @UseGuards(RequirePermission(PERMISSIONS.EMPLOYEE_MANAGEMENT))
  async revokePermission(@Body() body: { adminId: string; permissionName: string }) {
    try {
      return await this.permissionService.revokePermission(body.adminId, body.permissionName);
    } catch (error) {
      throw new HttpException(error.message, error.status || 400);
    }
  }

  @Put('set/:adminId')
  @UseGuards(RequirePermission(PERMISSIONS.EMPLOYEE_MANAGEMENT))
  async setAdminPermissions(
    @Param('adminId') adminId: string,
    @Body() body: { permissionNames: string[] },
    @Req() req: RequestWithAdmin,
  ) {
    try {
      return await this.permissionService.setAdminPermissions(
        adminId, body.permissionNames, req.admin?.id as string,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || 400);
    }
  }

  @Post('super-admin/:adminId')
  @UseGuards(RequirePermission(PERMISSIONS.EMPLOYEE_MANAGEMENT))
  async toggleSuperAdmin(
    @Param('adminId') adminId: string,
    @Body() body: { isSuperAdmin: boolean },
  ) {
    try {
      return await this.permissionService.toggleSuperAdmin(adminId, body.isSuperAdmin);
    } catch (error) {
      throw new HttpException(error.message, error.status || 400);
    }
  }
}
