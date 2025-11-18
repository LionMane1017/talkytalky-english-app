
export enum AppStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
