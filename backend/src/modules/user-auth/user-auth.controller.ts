import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Req,
    Res,
    UseGuards,
    HttpException,
} from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { Response } from 'express';
import { RequestWithUser } from 'src/common/interfaces/user.interface';
import { UserJwtAuthGuard } from 'src/guards/userGuard.guard';

@Controller('user-auth')
export class UserAuthController {
    constructor(private readonly userAuthService: UserAuthService) { }

    // Register a new user
    @Post('register')
    async register(
        @Body() body: { name: string; email: string; password: string; avatar?: string },
    ) {
        try {
            return await this.userAuthService.registerUser(body);
        } catch (error: any) {
            throw new HttpException(error.message || 'Registration failed', error.status || 400);
        }
    }

    // User login
    @Post('login')
    async login(
        @Body() body: { email: string; password: string },
        @Res() res: Response,
    ) {
        try {
            const loginResult = await this.userAuthService.userLogin(body);

            // Set cookie with JWT
            res.cookie('AccessUserToken', loginResult.token, {
                httpOnly: true,
                secure: true, // Set true in production
                sameSite: 'none', // Required for cross-origin
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return res.status(200).json(loginResult);
        } catch (error: any) {
            throw new HttpException(error.message || 'Login failed', error.status || 400);
        }
    }

    // Get all users (admin/protected endpoint)
    @Get('users')
    async getAllUsers() {
        try {
            return await this.userAuthService.getAllUsers();
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to fetch users', error.status || 400);
        }
    }

    // Get user by ID
    @Get('users/:id')
    async getUserById(@Param('id') id: string) {
        try {
            return await this.userAuthService.findUserById(id);
        } catch (error: any) {
            throw new HttpException(error.message || 'User not found', error.status || 404);
        }
    }

    // Get current user profile (protected)
    @Get('profile')
    @UseGuards(UserJwtAuthGuard)
    async getProfile(@Req() req: RequestWithUser) {
        try {
            const userId = req.user.id;
            return await this.userAuthService.findUserById(userId);
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to fetch profile', error.status || 400);
        }
    }

    // Update user profile (protected)
    @Patch('profile')
    @UseGuards(UserJwtAuthGuard)
    async updateProfile(
        @Req() req: RequestWithUser,
        @Body() body: { name?: string; avatar?: string },
    ) {
        try {
            const userId = req.user.id;
            return await this.userAuthService.updateUser(userId, body);
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to update profile', error.status || 400);
        }
    }

    // Change password (protected)
    @Patch('change-password')
    @UseGuards(UserJwtAuthGuard)
    async changePassword(
        @Req() req: RequestWithUser,
        @Body() body: { currentPassword: string; newPassword: string },
    ) {
        try {
            const userId = req.user.id;
            return await this.userAuthService.changePassword(
                userId,
                body.currentPassword,
                body.newPassword,
            );
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to change password', error.status || 400);
        }
    }

    // Logout (protected)
    @Post('logout')
    @UseGuards(UserJwtAuthGuard)
    async logout(@Res({ passthrough: true }) res: Response) {
        try {
            // Clear the cookie
            res.clearCookie('AccessUserToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            });

            return { message: 'Logged out successfully' };
        } catch (error: any) {
            throw new HttpException(error.message || 'Logout failed', error.status || 400);
        }
    }

    // Delete user (protected)
    @Delete('profile')
    @UseGuards(UserJwtAuthGuard)
    async deleteUser(@Req() req: RequestWithUser) {
        try {
            const userId = req.user.id;
            return await this.userAuthService.deleteUser(userId);
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to delete user', error.status || 400);
        }
    }
}
