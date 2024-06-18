import { v4 as uuidv4 } from 'uuid';
import { handleConnection, handleDisconnect, handleEvent } from './helper.js';
import { addUser, findUser } from '../models/user.model.js';
import configs from '../utils/configs.js';
import jwt from 'jsonwebtoken';
import { userRedis } from '../utils/redis.utils.js';

const registerHandler = (io) => {
  io.on('connection', async (socket) => {
    // 최초 커넥션을 맺은 이후 발생하는 각종 이벤트를 처리하는 곳
    const token = socket.handshake.auth.token;
    const jwtSecret = configs.jwtSecret;
    if (!token) {
      //토큰이 없으면 연결 종료
      socket.emit('unauthorized',"토큰이 존재하지 않습니다 로그인을 해 주세요")
      socket.disconnect(true);
      return;
    }
    try {
      const decoded = jwt.verify(token, jwtSecret);
      console.log('JWT 검증 성공');
      socket.data = {
        user_id: decoded.user_id,
        isAuthenticated: true,
      }; //인증된 사용자의 상태를 저장
    } catch (error) {
      console.error('JWT 검증중 오류 발생', error);
      socket.disconnect(true);
    }

    const user = await findUser(socket.id);

    let userUUID;
    if (!user) {
      userUUID = uuidv4(); // UUID 생성
      console.log('생성된 uuid', userUUID);
      await userRedis.createUserData(userUUID, userData.userId, userData.password);
      console.log(`새로운 유저 ${userData.userId}님이 등록되었습니다.`);
    } else {
      console.log(`기존 유저 ${user.user_id}님이 접속했습니다.`);
    }

    handleConnection(socket, userUUID);

    // 모든 서비스 이벤트 처리
    socket.on('event', (data) => handleEvent(io, socket, data));

    // 접속 해제시 이벤트 처리
    socket.on('disconnect', () => handleDisconnect(socket, userUUID));
  });
};

export default registerHandler;
