import { Injectable, OnModuleInit } from '@nestjs/common';

interface CacheEntry<T> {
    data: T;
    expires: number;
}

@Injectable()
export class CacheService implements OnModuleInit {
    private conversationCache = new Map<string, CacheEntry<any>>();
    private onlineUsers = new Set<string>();
    private typingIndicators = new Map<string, number>();
    private cleanupInterval: NodeJS.Timeout;

    onModuleInit() {
        // Auto-cleanup expired cache every 10 seconds
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 10000);
    }

    onModuleDestroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }

    // Conversation caching
    setConversation(key: string, data: any, ttlSeconds: number = 1800) {
        this.conversationCache.set(key, {
            data,
            expires: Date.now() + ttlSeconds * 1000,
        });
    }

    getConversation(key: string): any | null {
        const entry = this.conversationCache.get(key);
        if (!entry) return null;

        if (entry.expires < Date.now()) {
            this.conversationCache.delete(key);
            return null;
        }

        return entry.data;
    }

    deleteConversation(key: string) {
        this.conversationCache.delete(key);
    }

    // Online users
    addOnlineUser(userId: string) {
        this.onlineUsers.add(userId);
    }

    removeOnlineUser(userId: string) {
        this.onlineUsers.delete(userId);
    }

    isUserOnline(userId: string): boolean {
        return this.onlineUsers.has(userId);
    }

    getOnlineUsers(): string[] {
        return Array.from(this.onlineUsers);
    }

    // User-to-Socket mapping for targeted emissions
    private userSocketMap = new Map<string, string>(); // key: userId_userType, value: socketId

    addUserSocket(userId: string, userType: 'ADMIN' | 'USER', socketId: string) {
        const key = `${userId}_${userType}`;
        this.userSocketMap.set(key, socketId);
        console.log(`Added socket mapping: ${key} -> ${socketId}`);
    }

    removeUserSocket(userId: string, userType: 'ADMIN' | 'USER') {
        const key = `${userId}_${userType}`;
        this.userSocketMap.delete(key);
        console.log(`Removed socket mapping: ${key}`);
    }

    getUserSocketId(userId: string, userType: 'ADMIN' | 'USER'): string | undefined {
        const key = `${userId}_${userType}`;
        return this.userSocketMap.get(key);
    }

    getSocketUser(socketId: string): { userId: string; userType: 'ADMIN' | 'USER' } | undefined {
        for (const [key, sId] of this.userSocketMap.entries()) {
            if (sId === socketId) {
                const [userId, userType] = key.split('_');
                return { userId, userType: userType as 'ADMIN' | 'USER' };
            }
        }
        return undefined;
    }

    getAllUserSockets(): Map<string, string> {
        return new Map(this.userSocketMap);
    }

    // Typing indicators
    setTyping(conversationId: string, userId: string) {
        const key = `${conversationId}:${userId}`;
        this.typingIndicators.set(key, Date.now());
    }

    isTyping(conversationId: string, userId: string): boolean {
        const key = `${conversationId}:${userId}`;
        const timestamp = this.typingIndicators.get(key);

        if (!timestamp) return false;

        // Consider typing if within last 5 seconds
        if (Date.now() - timestamp > 5000) {
            this.typingIndicators.delete(key);
            return false;
        }

        return true;
    }

    getTypingUsers(conversationId: string): string[] {
        const users: string[] = [];
        const now = Date.now();

        for (const [key, timestamp] of this.typingIndicators.entries()) {
            if (key.startsWith(`${conversationId}:`)) {
                if (now - timestamp <= 5000) {
                    const userId = key.split(':')[1];
                    users.push(userId);
                } else {
                    this.typingIndicators.delete(key);
                }
            }
        }

        return users;
    }

    // Cleanup expired entries
    private cleanup() {
        const now = Date.now();

        // Clean conversations
        for (const [key, entry] of this.conversationCache.entries()) {
            if (entry.expires < now) {
                this.conversationCache.delete(key);
            }
        }

        // Clean typing indicators
        for (const [key, timestamp] of this.typingIndicators.entries()) {
            if (now - timestamp > 5000) {
                this.typingIndicators.delete(key);
            }
        }
    }
}
