import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface RequestWithAdminOrUser extends Request {
  admin?: any;
  user?: any;
}

@Injectable()
export class AdminUserDualAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithAdminOrUser>();

    // 1️⃣ Check admin token
    const adminToken = req.cookies?.['AccessAdminToken'];
    if (adminToken) {
      try {
        const decodedAdmin = await this.jwtService.verifyAsync(adminToken, {
          secret: process.env.Jwt_SECRET_KEY || 'secretkey',
        });
        req.admin = decodedAdmin;
        console.log('Admin authenticated:', decodedAdmin);
      } catch (err) {
        console.log('Invalid admin token:', err);
      }
    }

    // 2️⃣ Check user token
    const userToken = req.cookies?.['AccessUserToken'];
    if (userToken) {
      try {
        const decodedUser = await this.jwtService.verifyAsync(userToken, {
          secret: process.env.Jwt_SECRET_KEY || 'secretkey',
        });
        req.user = decodedUser;
        console.log('User authenticated:', decodedUser);
      } catch (err) {
        console.log('Invalid user token:', err);
      }
    }

    // 3️⃣ At least one must be authenticated
    if (!req.admin && !req.user) {
      throw new UnauthorizedException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}