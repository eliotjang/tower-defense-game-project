import { getGameAssets } from '../init/assets.js';
import { gameRedis } from '../utils/redis.utils.js';

export const gameStart = async (uuid, payload, socket) => {
  const { timeStamp } = payload;
  const { game, stage } = getGameAssets();
  const { userGold, baseHp, numOfInitialTowers, score } = game.data;
  const stageId = stage.data[0].id;

  if (!timeStamp) {
    socket.emit('gameStart', { status: 'fail', message: '게임 초기 정보 검증 실패' });
    return;
  }

  await gameRedis.createGameData(uuid, userGold, stageId, score, numOfInitialTowers, baseHp);
  const data = await gameRedis.getGameData(uuid);

  //console.log('Redis 데이터', data);

  socket.emit('gameStart', {
    status: 'success',
    message: '게임 시작!',
    userGold,
    baseHp,
    numOfInitialTowers,
    score,
  });
};

export const gameEnd = (uuid, payload, socket) => {
  const { score: currentScore } = payload;

  if (false) {
    socket.emit('gameEnd', { status: 'fail', message: '게임 오버 검증 실패' });
  }

  socket.emit('gameEnd', { status: 'success', message: '게임 오버' });
};
