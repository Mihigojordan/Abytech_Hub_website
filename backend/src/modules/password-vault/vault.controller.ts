import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { VAULT_SESSION_TTL_MS } from './vault-crypto.service';
import { RequestWithVault, VAULT_SESSION_COOKIE, VaultSessionGuard } from './vault-session.guard';
import { ChangeMasterInput, CipherBlob, SetupInput, VaultService } from './vault.service';

// Personal password locker. Every route needs a logged-in admin; item routes
// additionally need an unlocked vault session. Request/response bodies only
// ever carry ciphertext — encryption and decryption happen in the browser.
@Controller('vault')
@UseGuards(AdminJwtAuthGuard)
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  private setSession(res: Response, token: string) {
    res.cookie(VAULT_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: VAULT_SESSION_TTL_MS,
    });
    res.setHeader('Cache-Control', 'no-store');
  }

  private clearSession(res: Response) {
    res.clearCookie(VAULT_SESSION_COOKIE, { httpOnly: true, secure: true, sameSite: 'none' });
  }

  @Get('status')
  status(@Req() req: RequestWithVault) {
    return this.vaultService.status(req.admin!.id);
  }

  @Post('setup')
  async setup(
    @Req() req: RequestWithVault,
    @Body() body: SetupInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.vaultService.setup(req.admin!.id, body);
    this.setSession(res, token);
    return { ok: true };
  }

  @Post('unlock')
  @HttpCode(200)
  async unlock(
    @Req() req: RequestWithVault,
    @Body('authKey') authKey: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, encryptedDek } = await this.vaultService.unlock(req.admin!.id, authKey);
    this.setSession(res, token);
    return { encryptedDek };
  }

  @Post('lock')
  @HttpCode(200)
  async lock(@Req() req: RequestWithVault, @Res({ passthrough: true }) res: Response) {
    await this.vaultService.lock(req.admin!.id);
    this.clearSession(res);
    return { ok: true };
  }

  @Post('change-master')
  @HttpCode(200)
  @UseGuards(VaultSessionGuard)
  async changeMaster(
    @Req() req: RequestWithVault,
    @Body() body: ChangeMasterInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.vaultService.changeMaster(req.admin!.id, req.vault!.id, body);
    this.setSession(res, token);
    return { ok: true };
  }

  @Delete()
  async destroy(
    @Req() req: RequestWithVault,
    @Body('confirm') confirm: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.vaultService.destroy(req.admin!.id, confirm);
    this.clearSession(res);
    return { ok: true };
  }

  @Get('items')
  @UseGuards(VaultSessionGuard)
  listItems(@Req() req: RequestWithVault, @Res({ passthrough: true }) res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    return this.vaultService.listItems(req.vault!.id);
  }

  @Post('items')
  @UseGuards(VaultSessionGuard)
  createItem(@Req() req: RequestWithVault, @Body('payload') payload: CipherBlob) {
    return this.vaultService.createItem(req.vault!.id, payload);
  }

  @Put('items/:id')
  @UseGuards(VaultSessionGuard)
  updateItem(
    @Req() req: RequestWithVault,
    @Param('id') id: string,
    @Body('payload') payload: CipherBlob,
  ) {
    return this.vaultService.updateItem(req.vault!.id, id, payload);
  }

  @Delete('items/:id')
  @UseGuards(VaultSessionGuard)
  deleteItem(@Req() req: RequestWithVault, @Param('id') id: string) {
    return this.vaultService.deleteItem(req.vault!.id, id);
  }
}
