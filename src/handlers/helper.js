import { CLIENT_VERSION } from '../constants.js';
import { handleError } from './error.handler.js';
import handlerMappings from './handlerMapping.js';

export const handleConnection = (socket, userUUID) => {
  socket.emit('connection', { uuid: userUUID });
};

export const handleDisconnect = (socket, uuid) => {
  console.log(`유저 연결을 해제합니다.`);
  socket.isAuthenticated = false; // 인증 정보 초기화
  console.log(`uuid : ${uuid}, socket id : ${socket.id}`);
};

export const handleEvent = (io, socket, data) => {
  try {
    // 클라이언트 버전 체크
    if (!CLIENT_VERSION.includes(data.clientVersion)) {
      socket.emit('response', { status: 'fail', message: '클라이언트 버전 미일치' });
      return;
    }

    // 핸들러 맵핑
    const handler = handlerMappings[data.handlerId];
    if (!handler) {
      socket.emit('response', { status: 'fail', message: '유효하지 않은 핸들러' });
      return;
    }

    // 유저에게 메시지 전송
    const result = handler(data.userId, data.payload, socket, io);
    if (result?.broadcast) {
      io.emit(result.broadcast.namespace, result.broadcast[namespace]);
    }
  } catch (err) {
    handleError(err, socket, data.userId);
  }
};
