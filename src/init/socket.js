import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';

const initSocket = (server) => {
  const io = new SocketIO();
  io.attach(server);
  // 클라이언트로부터 오는 이벤트를 처리할 핸들러를 서버에 등록
  registerHandler(io);
};

export default initSocket;
