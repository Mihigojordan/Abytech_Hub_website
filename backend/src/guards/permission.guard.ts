import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    mixin,
    Type,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

export function RequirePermission(permissionName: string): Type<CanActivate> {
    @Injectable()
    class PermissionGuardMixin implements CanActivate {
        constructor(
            private readonly jwtService: JwtService,
            private readonly prisma: PrismaService,
        ) { }

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const request = context.switchToHttp().getRequest();
            const adminId = request.admin?.id;

            if (!adminId) {
                throw new ForbiddenException('Authentication required');
            }

            const admin = await this.prisma.admin.findUnique({
                where: { id: adminId },
                include: {
                    permissions: {
                        include: { permission: true },
                    },
                },
            });

            if (!admin) {
                throw new ForbiddenException('Admin not found');
            }

            // Super admin bypasses all permission checks
            if (admin.isSuperAdmin) {
                return true;
            }

            const hasPermission = admin.permissions.some(
                (ap) => ap.permission.name === permissionName,
            );

            if (!hasPermission) {
                throw new ForbiddenException(
                    `You do not have the "${permissionName}" permission`,
                );
            }

            return true;
        }
    }

    return mixin(PermissionGuardMixin);
}
