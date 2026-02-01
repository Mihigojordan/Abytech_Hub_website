import { Request } from 'express';

export interface RequestWithChatUser extends Request {
    user: {
        id: string;
        email?: string;
        type: 'ADMIN' | 'USER';
        role?: string;
    };
}
