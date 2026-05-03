import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CallService } from './call.service';
import { ChatAuthGuard } from 'src/guards/chatAuth.guard';

@Controller('call')
@UseGuards(ChatAuthGuard)
export class CallController {
    constructor(private readonly callService: CallService) {}

    @Get('history/:conversationId')
    async getCallHistory(@Param('conversationId') conversationId: string) {
        return this.callService.getCallHistory(Number(conversationId));
    }
}
