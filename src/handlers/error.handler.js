import { gameRedis } from '../utils/redis.utils.js';

export const handleError = async (error, socket, uuid) => {
  try {
    console.error(error);
    await gameRedis.removeGameData(uuid);
    // TODO: remove tower data
    socket.emit('error', { status: 'fail', message: error.message });
  } catch (err) {
    console.error(err);
  } finally {
    socket.disconnect(true);
  }
};
