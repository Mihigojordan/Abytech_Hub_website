import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { AdminService } from '../admin-management/admin.service';
import { AbydashIntegrationService, Actor, OrganizationIndustry } from './abydash-integration.service';

// Everything under here is reachable only by an admin already logged into
// THIS site (AdminJwtAuthGuard — the existing AccessAdminToken cookie, no
// new login flow). That's the real authorization boundary: AbyDash itself
// never sees which admin did what beyond the actorEmail/actorName this
// controller attaches from the already-authenticated session — see
// AbydashIntegrationService.
@Controller('abydash')
@UseGuards(AdminJwtAuthGuard)
export class AbydashIntegrationController {
  constructor(
    private readonly abydash: AbydashIntegrationService,
    private readonly adminService: AdminService,
  ) {}

  private async actorFrom(req: RequestWithAdmin): Promise<Actor> {
    const admin = await this.adminService.findAdminById(req.admin!.id);
    if (!admin) throw new UnauthorizedException('Admin not found');
    return {
      actorEmail: admin.adminEmail ?? 'unknown@abytechhub.com',
      actorName: admin.adminName ?? 'Unknown Admin',
    };
  }

  @Get('organizations')
  listOrganizations() {
    return this.abydash.listOrganizations();
  }

  @Post('organizations')
  async createOrganization(
    @Body()
    body: {
      organizationName: string;
      organizationSlug?: string;
      businessType?: 'MANUFACTURER' | 'RETAILER' | 'WHOLESALER';
      industry?: OrganizationIndustry;
      superAdmin: { name: string; email: string; password: string };
    },
    @Req() req: RequestWithAdmin,
  ) {
    return this.abydash.createOrganization(body, await this.actorFrom(req));
  }

  @Patch('organizations/:organizationId')
  async updateOrganization(
    @Param('organizationId') organizationId: string,
    @Body()
    body: {
      name?: string;
      status?: 'ACTIVE' | 'SUSPENDED';
      businessType?: 'MANUFACTURER' | 'RETAILER' | 'WHOLESALER';
      industry?: OrganizationIndustry;
    },
    @Req() req: RequestWithAdmin,
  ) {
    return this.abydash.updateOrganization(organizationId, body, await this.actorFrom(req));
  }

  @Get('plans')
  listPlans() {
    return this.abydash.listPlans();
  }

  @Get('modules')
  listModuleDefinitions() {
    return this.abydash.listModuleDefinitions();
  }

  @Get('organizations/:organizationId/module-access')
  getOrganizationAccess(@Param('organizationId') organizationId: string) {
    return this.abydash.getOrganizationAccess(organizationId);
  }

  @Post('organizations/:organizationId/assign-plan')
  async assignPlan(
    @Param('organizationId') organizationId: string,
    @Body() body: { planId: string },
    @Req() req: RequestWithAdmin,
  ) {
    return this.abydash.assignPlan(organizationId, body.planId, await this.actorFrom(req));
  }

  @Post('organizations/:organizationId/module-override')
  async setModuleOverride(
    @Param('organizationId') organizationId: string,
    @Body() body: { moduleKey: string; enabled: boolean },
    @Req() req: RequestWithAdmin,
  ) {
    return this.abydash.setModuleOverride(
      organizationId,
      body.moduleKey,
      body.enabled,
      await this.actorFrom(req),
    );
  }

  @Post('organizations/:organizationId/module-overrides')
  async setModuleOverrides(
    @Param('organizationId') organizationId: string,
    @Body() body: { overrides: { moduleKey: string; enabled: boolean }[] },
    @Req() req: RequestWithAdmin,
  ) {
    return this.abydash.setModuleOverrides(
      organizationId,
      body.overrides,
      await this.actorFrom(req),
    );
  }

  @Post('organizations/:organizationId/grant-group')
  async grantGroup(
    @Param('organizationId') organizationId: string,
    @Body() body: { groupKey: string; enabled?: boolean; includeCore?: boolean },
    @Req() req: RequestWithAdmin,
  ) {
    return this.abydash.grantGroup(organizationId, body, await this.actorFrom(req));
  }

  @Get('platform-settings/payment')
  getPaymentSettings() {
    return this.abydash.getPaymentSettings();
  }

  @Patch('platform-settings/payment')
  async updatePaymentSettings(
    @Body() body: { commissionRatePercent: number },
    @Req() req: RequestWithAdmin,
  ) {
    return this.abydash.updatePaymentSettings(body.commissionRatePercent, await this.actorFrom(req));
  }

  @Get('module-groups')
  listModuleGroups() {
    return this.abydash.listModuleGroups();
  }

  @Post('module-groups')
  async createModuleGroup(
    @Body() body: { key: string; label: string; description?: string; order?: number },
    @Req() req: RequestWithAdmin,
  ) {
    return this.abydash.createModuleGroup(body, await this.actorFrom(req));
  }

  @Patch('module-groups/:groupKey')
  async updateModuleGroup(
    @Param('groupKey') groupKey: string,
    @Body() body: { label?: string; description?: string; order?: number },
    @Req() req: RequestWithAdmin,
  ) {
    return this.abydash.updateModuleGroup(groupKey, body, await this.actorFrom(req));
  }

  @Delete('module-groups/:groupKey')
  async deleteModuleGroup(
    @Param('groupKey') groupKey: string,
    @Req() req: RequestWithAdmin,
  ) {
    return this.abydash.deleteModuleGroup(groupKey, await this.actorFrom(req));
  }

  @Post('modules/:moduleKey/group')
  async setModuleGroup(
    @Param('moduleKey') moduleKey: string,
    @Body() body: { groupKey: string; order?: number },
    @Req() req: RequestWithAdmin,
  ) {
    return this.abydash.setModuleGroup(
      moduleKey,
      body.groupKey,
      body.order,
      await this.actorFrom(req),
    );
  }
}
