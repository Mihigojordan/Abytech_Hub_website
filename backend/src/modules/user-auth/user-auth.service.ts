import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserAuthService {
    private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    // Find user by ID
    async findUserById(id: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    initial: true,
                    lastSeen: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            return user;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    // Find user by email
    async findUserByEmail(email: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            return user;
        } catch (error) {
            console.error('Error finding user by email:', error);
            return null;
        }
    }

    // Register a new user
    async registerUser(data: { name: string; email: string; password: string; avatar?: string }) {
        try {
            const { name, email, password, avatar } = data;

            // Validate inputs
            if (!email || !name || !password) {
                throw new BadRequestException('Name, email, and password are required');
            }

            if (!this.emailRegex.test(email)) {
                throw new BadRequestException('Invalid email format');
            }

            // Check if user already exists
            const existingUser = await this.findUserByEmail(email);
            if (existingUser) {
                throw new BadRequestException('User with this email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generate initial from name (first letter of each word, max 5)
            const initial = name
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase())
                .join('')
                .substring(0, 5);

            // Create user
            const newUser = await this.prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    avatar: avatar || null,
                    initial,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    initial: true,
                    createdAt: true,
                },
            });

            return {
                message: 'User registered successfully',
                userId: newUser.id,
                user: newUser,
            };
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    }

    // User login
    async userLogin(data: { email: string; password: string }) {
        try {
            const { email, password } = data;

            // Validate inputs
            if (!email || !password) {
                throw new BadRequestException('Email and password are required');
            }

            // Find user by email
            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }

            // Update last seen
            await this.prisma.user.update({
                where: { id: user.id },
                data: { lastSeen: new Date() },
            });

            // Generate JWT token
            const token = this.jwtService.sign({
                id: user.id,
                email: user.email,
                type: 'USER'
            });

            return {
                token,
                authenticated: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    initial: user.initial,
                },
            };
        } catch (error) {
            console.error('Error during user login:', error);
            throw error;
        }
    }

    // Update user profile
    async updateUser(userId: string, data: { name?: string; avatar?: string; password?: string }) {
        try {
            const user = await this.findUserById(userId);

            const updateData: any = {};

            if (data.name) {
                updateData.name = data.name;
                // Update initial if name changes
                updateData.initial = data.name
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase())
                    .join('')
                    .substring(0, 5);
            }

            if (data.avatar !== undefined) {
                updateData.avatar = data.avatar;
            }

            if (data.password) {
                updateData.password = await bcrypt.hash(data.password, 10);
            }

            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    initial: true,
                    lastSeen: true,
                    updatedAt: true,
                },
            });

            return {
                message: 'User updated successfully',
                user: updatedUser,
            };
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Get all users
    async getAllUsers() {
        try {
            const users = await this.prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    initial: true,
                    lastSeen: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Change password
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Current password is incorrect');
            }

            if (newPassword.length < 6) {
                throw new BadRequestException('New password must be at least 6 characters long');
            }

            // Hash and update new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await this.prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });

            return { message: 'Password changed successfully' };
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    // Delete user
    async deleteUser(userId: string) {
        try {
            const user = await this.findUserById(userId);

            await this.prisma.user.delete({
                where: { id: userId },
            });

            return { message: 'User deleted successfully' };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}
