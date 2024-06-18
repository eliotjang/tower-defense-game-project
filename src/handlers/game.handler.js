import { getGameAssets } from '../init/assets.js';
import { gameRedis, highscoreRedis } from '../utils/redis.utils.js';

export const gameStart = (uuid, payload, socket) => {
  const { timeStamp, userGold, baseHp, numOfInitialTowers, score } = payload;
  const { game } = getGameAssets();

  const userGoldAsset = game.data.userGold;
  const baseHpAsset = game.data.baseHp;
  const numOfInitialTowersAsset = game.data.numOfinitialTowers;
  const scoreAsset = game.data.score;

  let verification = false;
  if (
    userGold === userGoldAsset &&
    baseHp === baseHpAsset &&
    numOfInitialTowers === numOfInitialTowersAsset &&
    score === scoreAsset
  ) {
    verification = true;
  }

  if (!verification) {
    socket.emit('gameStart', { status: 'fail', message: '게임 초기 정보 검증 실패' });
    return;
  }

  socket.emit('gameStart', { status: 'success', message: '게임 시작!' });
};

export const gameEnd = async (uuid, payload, socket) => {
  const { score: currentScore } = payload;

  if (false) {
    socket.emit('gameEnd', { status: 'fail', message: '게임 오버 검증 실패' });
  }

  const isHighscore = await highscoreRedis.createHighscoreData(uuid, score);
  if (isHighscore && isHighscore[1]) {
    io.emit('highscore', { highscore: score });
  }

  socket.emit('gameEnd', { status: 'success', message: '게임 오버' });
};
