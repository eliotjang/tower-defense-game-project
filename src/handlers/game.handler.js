import { getGameAssets } from '../init/assets.js';
import { gameRedis, highscoreRedis } from '../utils/redis.utils.js';

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

export const gameEnd = async (uuid, payload, socket) => {
  const { timestamp, score } = payload;

  const userGameData = await gameRedis.getGameData(uuid);
  if (!userGameData) {
    socket.emit('gameEnd', { status: 'fail', message: '게임 오버 검증 실패' });
    return;
  }

  const prevScore = userGameData.score;
  /* 검증 로직 구현 */

  /* ----- */

  /* highscore 갱신 */
  const isHighscore = await highscoreRedis.createHighscoreData(uuid, score);
  if (isHighscore && isHighscore[1]) {
    io.emit('highscore', { highscore: score });
  }
  /* ----- */
  socket.emit('gameEnd', { status: 'success', message: '게임 오버' });
};
