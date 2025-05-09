type EventCallback = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, EventCallback[]>;

  constructor() {
    this.events = new Map();
  }

  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  once(event: string, callback: EventCallback): void {
    const onceCallback = (...args: any[]) => {
      this.off(event, onceCallback);
      callback.apply(this, args);
    };
    this.on(event, onceCallback);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events.has(event)) return;
    this.events.get(event)!.forEach(callback => callback(...args));
  }

  off(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) return;
    const callbacks = this.events.get(event)!;
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
    if (callbacks.length === 0) {
      this.events.delete(event);
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
} 