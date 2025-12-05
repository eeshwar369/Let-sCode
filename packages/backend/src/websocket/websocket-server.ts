import { WebSocketServer, WebSocket } from 'ws';
import { StatusUpdate, SystemStatus } from '@letscode/shared';

export class ExecutionWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocket>>;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.clients = new Map();
    this.setupHandlers();
  }

  private setupHandlers() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const userId = this.extractUserId(req.url || '');

      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId)!.add(ws);

      console.log(`WebSocket client connected: ${userId}`);

      ws.on('close', () => {
        const userClients = this.clients.get(userId);
        if (userClients) {
          userClients.delete(ws);
          if (userClients.size === 0) {
            this.clients.delete(userId);
          }
        }
        console.log(`WebSocket client disconnected: ${userId}`);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  sendUpdate(userId: string, update: StatusUpdate) {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    const message = JSON.stringify({ type: 'status_update', data: update });
    userClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  broadcastSystemStatus(status: SystemStatus) {
    const message = JSON.stringify({ type: 'system_status', data: status });
    this.clients.forEach((userClients) => {
      userClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  }

  private extractUserId(url: string): string {
    const match = url.match(/userId=([^&]+)/);
    return match ? match[1] : 'anonymous';
  }
}
