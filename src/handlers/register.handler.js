import { handleConnection, handleDisconnect, handleEvent } from './helper.js';
import configs from '../utils/configs.js';
import jwt from 'jsonwebtoken';
import { userRedis } from '../utils/redis.utils.js';
import redisClient from '../init/redis.js';
import { RedisFlushModes } from 'redis';
import { handleError } from './error.handler.js';
import CustomError from '../utils/errors/classes/custom.error.js';

const registerHandler = (io) => {
  io.on('connection', async (socket) => {
    // 최초 커넥션을 맺은 이후 발생하는 각종 이벤트를 처리하는 곳
    try {
      const token = socket.handshake.auth.token;
      const jwtSecret = configs.jwtSecret;
      if (!token) {
        //토큰이 없으면 연결 종료
        throw new CustomError('토큰이 존재하지 않습니다 로그인을 해 주세요', 'unauthorized');
      }
      jwt.verify(token, jwtSecret, (err, tokenPayload) => {
        if (err) throw new CustomError('JWT 검증중 오류 발생', 'unauthorized');
        console.log('JWT 검증 성공');
        socket.data = {
          user_id: tokenPayload.user_id,
          isAuthenticated: true,
        }; //인증된 사용자의 상태를 저장
      });
      const USER_KEY_PREFIX = 'user:';
      const key = USER_KEY_PREFIX + socket.data.user_id;
      const UUID = await redisClient.hGet(key, 'uuid');
      const sanitizedUUID = UUID.replace(/"/g, '');

      handleConnection(socket, sanitizedUUID);

      // 모든 서비스 이벤트 처리
      socket.on('event', (data) => {
        if (data?.timestamp) {
          const timestamp = Date.now();
          const tolerance = 1000;
          const diff = timestamp - data.timestamp;
          if (diff > tolerance) {
            throw new CustomError('Timestamp 검증 실패');
          }
        }

        handleEvent(io, socket, data);
      });

      // 접속 해제시 이벤트 처리
      socket.on('disconnect', () => handleDisconnect(socket, sanitizedUUID));
    } catch (err) {
      await handleError(err, socket);
    }
  });
};

export default registerHandler;
