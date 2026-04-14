import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GlobalSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Store connected sockets
  adminSockets = new Map<string, Set<string>>();
  userSockets = new Map<string, Set<string>>();

  // ──────────────────────────────────────────────
  // On socket connect
  // ──────────────────────────────────────────────
  handleConnection(socket: Socket) {
    console.log(`🔵 Socket connected: ${socket.id}`);
  }

  // ──────────────────────────────────────────────
  // On socket disconnect
  // ──────────────────────────────────────────────
  handleDisconnect(socket: Socket) {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
    this.removeSocketFromMaps(socket.id);
  }

  private removeSocketFromMaps(socketId: string) {
    this.adminSockets.forEach((set, adminId) => {
      if (set.delete(socketId) && set.size === 0) {
        this.adminSockets.delete(adminId);
      }
    });

    this.userSockets.forEach((set, userId) => {
      if (set.delete(socketId) && set.size === 0) {
        this.userSockets.delete(userId);
      }
    });
  }

  // ──────────────────────────────────────────────
  // CLIENT sends:
  // socket.emit("registerUser", { id, type })
  // type = "ADMIN" | "USER"
  // ──────────────────────────────────────────────
  @SubscribeMessage('registerUser')
  registerUser(
    @MessageBody()
    data: { id: string; type: 'ADMIN' | 'USER' },
    @ConnectedSocket() socket: Socket,
  ) {
    if (!data?.id || !data?.type) return;

    if (data.type === 'ADMIN') {
      if (!this.adminSockets.has(data.id)) {
        this.adminSockets.set(data.id, new Set());
      }
      this.adminSockets.get(data.id)?.add(socket.id);
      console.log(`🛡️ ADMIN ${data.id} registered → ${socket.id}`);
    }

    if (data.type === 'USER') {
      if (!this.userSockets.has(data.id)) {
        this.userSockets.set(data.id, new Set());
      }
      this.userSockets.get(data.id)?.add(socket.id);
      console.log(`👤 USER ${data.id} registered → ${socket.id}`);
    }

    return { success: true };
  }

  // ──────────────────────────────────────────────
  // Emit to Admin
  // ──────────────────────────────────────────────
  emitToAdmin(adminId: string, event: string, data: any) {
    const sockets = this.adminSockets.get(adminId);
    if (!sockets) return;

    sockets.forEach((socketId) => {
      this.server.to(socketId).emit(event, data);
    });
  }

  // ──────────────────────────────────────────────
  // Emit to User
  // ──────────────────────────────────────────────
  emitToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    sockets.forEach((socketId) => {
      this.server.to(socketId).emit(event, data);
    });
  }

  // ──────────────────────────────────────────────
  // Emit to many recipients
  // ──────────────────────────────────────────────
  emitToRecipients(
    recipients: { id: string; type: 'ADMIN' | 'USER' }[],
    event: string,
    data: any,
  ) {
    recipients.forEach((r) => {
      if (r.type === 'ADMIN') {
        this.emitToAdmin(r.id, event, data);
      } else {
        this.emitToUser(r.id, event, data);
      }
    });
  }

  // ──────────────────────────────────────────────
  // Emit to ALL connected admins
  // ──────────────────────────────────────────────
  emitToAllAdmins(event: string, data: any) {
    this.adminSockets.forEach((sockets) => {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    });
  }

  // ──────────────────────────────────────────────
  // Emit to ALL connected users
  // ──────────────────────────────────────────────
  emitToAllUsers(event: string, data: any) {
    this.userSockets.forEach((sockets) => {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    });
  }

  // ──────────────────────────────────────────────
  // Check if a specific user/admin is online
  // ──────────────────────────────────────────────
  isOnline(id: string, type: 'ADMIN' | 'USER'): boolean {
    const map = type === 'ADMIN' ? this.adminSockets : this.userSockets;
    const sockets = map.get(id);
    return !!sockets && sockets.size > 0;
  }
}