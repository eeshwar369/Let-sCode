import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws?: WebSocket;
  private messagesSubject = new Subject<any>();

  connect(userId: string): void {
    this.ws = new WebSocket(`ws://localhost:3001?userId=${userId}`);

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.messagesSubject.next(message);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }

  getMessages(): Observable<any> {
    return this.messagesSubject.asObservable();
  }
}
