import { WebSocket } from 'ws';
import EventEmitter from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';

class QuantumEntanglementSocket extends EventEmitter {
  constructor(url) {
    super();
    this.connection = new WebSocket(url);
    this.entangledPairs = new Map();

    fromEvent(this.connection, 'message')
      .pipe(
        map(event => JSON.parse(event.data)),
        filter(message => message.type === 'entanglement' && this.entangledPairs.has(message.id))
      )
      .subscribe(message => {
        this.emit('entangledMessage', message.content);
      });

    this.connection.onopen = () => {
      this.emit('connected');
    };

    this.connection.onerror = (error) => {
      this.emit('error', error);
    };
  }

  entangle(message) {
    const id = uuidv4();
    this.entangledPairs.set(id, true);
    this.connection.send(JSON.stringify({ type: 'entanglement', id, content: message }));
  }

  send(message) {
    this.connection.send(JSON.stringify({ type: 'standard', content: message }));
  }
}

export default QuantumEntanglementSocket;
