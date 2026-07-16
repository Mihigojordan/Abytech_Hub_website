import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ReportGateway {
  @WebSocketServer()
  server: Server;

  // ✅ Emit event when a reply is created
  emitReplyCreated(reply: any) {
    this.server.emit('reportReplyCreated', reply);
  }

  // ✅ Emit event when a reply is edited
  emitReplyUpdated(reply: any) {
    this.server.emit('reportReplyUpdated', reply);
  }

  // ✅ Emit event when a reply is deleted
  emitReplyDeleted(payload: { replyId: string; reportId: string }) {
    this.server.emit('reportReplyDeleted', payload);
  }
}
