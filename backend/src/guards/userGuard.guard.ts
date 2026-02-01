import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RequestWithUser } from '../common/interfaces/user.interface';

@Injectable()
export class UserJwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const userToken = this.extractTokenFromCookies(request);

        console.log("User's token is:", userToken);

        if (!userToken) {
            throw new UnauthorizedException('Not authenticated');
        }

        try {
            const decodedUser = await this.jwtService.verifyAsync(userToken, {
                secret: process.env.Jwt_SECRET_KEY || 'secretkey',
            });

            request.user = decodedUser;
            return true;
        } catch (error) {
            console.log('Error in user guard:', error);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    private extractTokenFromCookies(req: Request): string | undefined {
        return req.cookies?.['AccessUserToken'];
    }
}
