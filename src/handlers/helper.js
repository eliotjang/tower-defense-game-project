import { CLIENT_VERSION } from '../constants.js';
import { handleError } from './error.handler.js';
import handlerMappings from './handlerMapping.js';
import CustomError from '../utils/errors/classes/custom.error.js';

export const handleConnection = (socket, userUUID) => {
  socket.emit('connection', { uuid: userUUID });
};

export const handleDisconnect = (socket, uuid) => {
  console.log(`유저 연결을 해제합니다.`);
  socket.isAuthenticated = false; // 인증 정보 초기화
  console.log(`uuid : ${uuid}, socket id : ${socket.id}`);
};

export const handleEvent = async (io, socket, data) => {
  try {
    // 클라이언트 버전 체크
    if (!CLIENT_VERSION.includes(data.clientVersion)) {
      throw new CustomError('클라이언트 버전 미일치');
    }

    // 핸들러 맵핑
    const handler = handlerMappings[data.handlerId];
    if (!handler) {
      throw new CustomError('유효하지 않은 핸들러');
    }

    // 유저에게 메시지 전송
    const result = await handler(data.userId, data.payload, socket, io);
    if (result) {
      if (result.broadcast?.event) {
        io.emit(result.broadcast.event, result.broadcast[namespace]);
      }
      socket.emit(result.emit.event, result.emit.data);
    }
  } catch (err) {
    await handleError(err, socket, data.userId);
  }
};
