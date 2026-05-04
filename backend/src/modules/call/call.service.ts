import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CallService {
    constructor(private readonly prisma: PrismaService) {}

    async createCallRecord(
        conversationId: number,
        callerId: string,
        callerType: string,
        callType: string,
    ): Promise<string> {
        const call = await this.prisma.call.create({
            data: {
                conversationId,
                callerId,
                callerType,
                callType,
                status: 'ringing',
            },
        });
        return call.id;
    }

    async updateCallStatus(
        callId: string,
        status: string,
        startedAt?: Date,
        endedAt?: Date,
    ) {
        return this.prisma.call.update({
            where: { id: callId },
            data: {
                status,
                ...(startedAt && { startedAt }),
                ...(endedAt && { endedAt }),
            },
        });
    }

    /**
     * Create the initial "ringing" call message when a call starts.
     * Returns the message ID so it can be updated later.
     */
    async createInitialCallMessage(
        conversationId: number,
        callerId: string,
        callerType: string,
        callId: string,
        callType: string,
    ): Promise<number> {
        const msg = await this.prisma.message.create({
            data: {
                conversationId,
                senderId: callerId,
                senderType: callerType as any,
                type: 'call' as any,
                content: '📞 Calling...',
                callData: {
                    callId,
                    callType,
                    status: 'ringing',
                    duration: null,
                    startedAt: null,
                    endedAt: null,
                },
            },
        });
        return msg.id;
    }

    /**
     * Update the existing call message in-place when the call ends/is missed/declined.
     * This makes the bubble transition from "Calling..." to the final state.
     */
    async updateCallMessage(
        messageId: number,
        callData: {
            callId: string;
            callType: string;
            status: string;       // ended | missed | declined
            startedAt?: Date | null;
            endedAt?: Date | null;
        },
    ) {
        const duration = callData.startedAt && callData.endedAt
            ? Math.floor((callData.endedAt.getTime() - callData.startedAt.getTime()) / 1000)
            : null;

        const content = callData.status === 'ended'
            ? `📞 Voice call · ${duration != null ? formatDuration(duration) : ''}`
            : callData.status === 'missed'
                ? '📞 Missed voice call'
                : '📞 Declined voice call';

        return this.prisma.message.update({
            where: { id: messageId },
            data: {
                content,
                callData: {
                    callId: callData.callId,
                    callType: callData.callType,
                    status: callData.status,
                    duration,
                    startedAt: callData.startedAt?.toISOString() ?? null,
                    endedAt: callData.endedAt?.toISOString() ?? null,
                },
            },
        });
    }

    async getCallHistory(conversationId: number, limit = 20) {
        return this.prisma.call.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
