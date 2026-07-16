import { Module } from '@nestjs/common';
import { CookieCheckController } from './cookie-check.controller';

@Module({
  controllers: [CookieCheckController],
})
export class CookieCheckModule {}
