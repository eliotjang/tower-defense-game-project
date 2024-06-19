import { getGameAssets } from '../init/assets.js';
import { gameRedis, highscoreRedis } from '../utils/redis.utils.js';

let startTime;

export const gameStart = async (uuid, payload, socket) => {
  const { timeStamp } = payload;
  const { game, stage } = getGameAssets();
  const { userGold, baseHp, numOfInitialTowers, score, monsterSpawnInterval } = game.data;
  const stageId = stage.data[0].id;

  if (!timeStamp) {
    socket.emit('gameStart', { status: 'fail', message: '게임 초기 정보 검증 실패' });
    return;
  }

  startTime = timeStamp;

  await gameRedis.removeGameData(uuid);
  await gameRedis.createGameData(uuid, userGold, stageId, score, numOfInitialTowers, baseHp);
  const data = await gameRedis.getGameData(uuid);

  // Redis 저장 데이터
  //console.log('Redis 데이터', data);

  socket.emit('gameStart', {
    status: 'success',
    message: '게임 시작!',
    userGold: data.user_gold,
    baseHp: data.base_hp,
    numOfInitialTowers,
    score: data.score,
    monsterSpawnInterval,
  });
};

export const gameEnd = async (uuid, payload, socket) => {
  const { timeStamp, score } = payload;
  const { game, monster } = getGameAssets();
  const { baseHp, monsterSpawnInterval } = game.data;
  const { attack_power: attackPower, speed } = monster.data[0];
  console.log('attackPower', attackPower);
  console.log('speed', speed);

  const elapsedTime = (timeStamp - startTime) / 1000;
  console.log('경과 시간', elapsedTime);

  const userGameData = await gameRedis.getGameData(uuid);

  const prevScore = userGameData.score;
  /* 검증 로직 구현 */
  let verification = false;
  if (prevScore === score) {
    verification = true;
  }

  // 최소로 진행되는 플레이 시간보다 짧은 시간으로 종료 시 게임 오버 검증 실패
  let totalDamagePerInterval = 0;
  for (let i = speed * 20; i < elapsedTime; i += monsterSpawnInterval / 1000) {
    totalDamagePerInterval += attackPower;
  }
  if (totalDamagePerInterval <= baseHp) {
    verification = false;
  }

  console.log('totalDamagePerInterval', totalDamagePerInterval);

  if (!verification) {
    socket.emit('gameEnd', { status: 'fail', message: '게임 오버 검증 실패' });
    return;
  }
  /* highscore 갱신 */
  const isHighscore = await highscoreRedis.createHighscoreData(uuid, score);
  if (isHighscore && isHighscore[1]) {
    io.emit('highscore', { highscore: score });
  }
  /* ----- */
  socket.emit('gameEnd', { status: 'success', message: '게임 오버', elapsedTime, score });
};
