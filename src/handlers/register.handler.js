import { v4 as uuidv4 } from 'uuid';
import { handleConnection, handleDisconnect, handleEvent } from './helper.js';
import { addUser, findUser } from '../models/user.model.js';
import configs from '../utils/configs.js';
import jwt from 'jsonwebtoken';

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
      addUser({ uuid: userUUID, socketId: socket.id }); // 사용자 추가
      console.log(`새로운 유저입니다. 등록합니다. ${userUUID}`);
    } else {
      userUUID = user.uuid;
      console.log(`기존 유저입니다. 연결합니다. ${userUUID}`);
    }

    handleConnection(socket, userUUID);

    // 모든 서비스 이벤트 처리
    socket.on('event', (data) => handleEvent(io, socket, data));

    // 접속 해제시 이벤트 처리
    socket.on('disconnect', () => handleDisconnect(socket, userUUID));
  });
};

export default registerHandler;
