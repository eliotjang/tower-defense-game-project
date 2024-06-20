import { gameRedis } from '../utils/redis.utils.js';

export const handleError = async (error, socket, uuid) => {
  try {
    console.error(error);
    if (uuid) {
      await gameRedis.removeGameData(uuid);
      // TODO: remove tower data
    }
    if (error.name === 'CustomError') {
      socket.emit(error.namespace || 'error', { status: 'fail', message: error.message });
    } else {
      console.error(error);
      socket.emit('error', { status: 'fail', message: '서버에서 에러가 발생했습니다.' });
    }
  } catch (err) {
    console.error(err);
  } finally {
    socket.disconnect(true);
  }
};
