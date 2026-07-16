import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

const PROBE_COOKIE_NAME = 'abytech_3p_probe';
const PROBE_COOKIE_VALUE = '1';

// Lets the frontend find out whether the browser is actually storing the
// cross-site cookies our auth flow depends on (SameSite=None). There is no
// browser event for this — the only way to know is to set a cookie on one
// request and see whether it comes back on the next one.
@Controller('cookie-check')
export class CookieCheckController {
  @Get('probe')
  probe(@Res({ passthrough: true }) res: Response) {
    res.cookie(PROBE_COOKIE_NAME, PROBE_COOKIE_VALUE, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: 2 * 60 * 1000,
      path: '/',
    });
    return { ok: true };
  }

  @Get('verify')
  verify(@Req() req: Request) {
    const received = req.cookies?.[PROBE_COOKIE_NAME] === PROBE_COOKIE_VALUE;
    return { thirdPartyCookiesAllowed: received };
  }
}
