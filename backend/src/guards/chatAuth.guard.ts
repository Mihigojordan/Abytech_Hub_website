import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RequestWithChatUser } from '../common/interfaces/chat.interface';

@Injectable()
export class ChatAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithChatUser>();

        // Try to extract token from either admin or user cookies
        const adminToken = this.extractTokenFromCookie(request, 'AccessAdminToken');
        const userToken = this.extractTokenFromCookie(request, 'AccessUserToken');

        // Determine which token to use (ADMIN takes priority if both exist)
        const token = adminToken || userToken;
        const tokenType = adminToken ? 'ADMIN' : userToken ? 'USER' : null;

        console.log('Chat auth - Token type:', tokenType);

        if (!token || !tokenType) {
            throw new UnauthorizedException('Not authenticated - no valid token found');
        }

        try {
            // Verify the JWT token
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: process.env.Jwt_SECRET_KEY || 'secretkey',
            });

            // Attach user info to request with explicit type
            request.user = {
                id: decoded.id,
                email: decoded.email || decoded.adminEmail,
                type: tokenType,
                role: decoded.role,
            };

            console.log('Chat auth successful - User:', request.user.id, 'Type:', request.user.type);

            return true;
        } catch (error) {
            console.log('Error in chat auth guard:', error);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    private extractTokenFromCookie(req: Request, cookieName: string): string | undefined {
        return req.cookies?.[cookieName];
    }
}
