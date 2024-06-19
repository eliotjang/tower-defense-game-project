import { gameRedis } from '../utils/redis.utils.js';

export const handleError = async (error, socket, uuid) => {
  try {
    console.error(error);
    await gameRedis.removeGameData(uuid);
    // TODO: remove tower data
  } catch (err) {
    console.error(err);
  } finally {
    socket.emit('broadcast', { status: 'fail', message: '서버와의 연결이 종료되었습니다.' });
    socket.disconnect(true);
  }
};
