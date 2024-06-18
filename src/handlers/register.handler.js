import { v4 as uuidv4 } from 'uuid';
import { handleConnection, handleDisconnect, handleEvent } from './helper.js';
import { userRedis } from '../utils/redis.utils.js';

const registerHandler = (io) => {
  io.on('connection', async (socket) => {
    // 최초 커넥션을 맺은 이후 발생하는 각종 이벤트를 처리하는 곳

    let userUUID;
    let user = await userRedis.getUserData(userUUID);
    const userData = { userId: '우쿵쿵', password: '1111' };

    /* if (!user) {
      await userRedis.createUserData(user.userId, user.password);
      const user = await userRedis.getUserData('우쿵쿵');
      console.log(`새로운 유저 ${user.user_id}님이 등록되었습니다.`);
    } else {
      console.log(`기존 유저 ${user.userId}님이 접속했습니다.`);
    }

    const userId = user.userId; */

    //let userUUID;
    if (!user) {
      userUUID = uuidv4(); // UUID 생성
      await userRedis.createUserData(userUUID, userData.userId, userData.password);
      user = await userRedis.getUserData(userUUID);
      console.log(`새로운 유저 ${user.user_id}님이 등록되었습니다.`);
    } else {
      userUUID = await userRedis.getUserData(socket.id);
      console.log(`기존 유저 ${user.userId}님이 접속했습니다.`);
    }

    handleConnection(socket, userId);

    // 모든 서비스 이벤트 처리
    socket.on('event', (data) => handleEvent(io, socket, data));

    // 접속 해제시 이벤트 처리
    socket.on('disconnect', () => handleDisconnect(socket, userId));
  });
};

export default registerHandler;
