import { getGameAssets } from '../init/assets.js';
import { gameRedis, highscoreRedis } from '../utils/redis.utils.js';
import CustomError from '../utils/errors/classes/custom.error.js';
import { createUserGoldData, spawnList } from '../models/user.model.js';

export const gameStart = async (uuid, payload, socket) => {
  const { timeStamp } = payload;
  const { game, stage } = getGameAssets();
  const { userGold, baseHp, numOfInitialTowers, score, monsterSpawnInterval, goblinMinInterval, goblinMaxInterval } =
    game.data;
  const stageId = stage.data[0].id;

  if (!timeStamp) {
    throw new CustomError('게임 초기 정보 검증 실패', 'gameStart');
  }

  await gameRedis.deleteGameDataTowerlist(uuid);

  await gameRedis.removeGameData(uuid);
  await gameRedis.createGameData(
    uuid,
    userGold,
    stageId,
    score,
    numOfInitialTowers,
    baseHp,
    timeStamp,
    monsterSpawnInterval,
    timeStamp,
    0
  );
  createUserGoldData(uuid, userGold);

  spawnList.addSpawnList(uuid, timeStamp);

  const data = await gameRedis.getGameData(uuid);

  //console.log('Redis 데이터', data);

  socket.emit('gameStart', {
    status: 'success',
    message: '게임 시작!',
    userGold: data.user_gold,
    baseHp: data.base_hp,
    numOfInitialTowers: data.initial_towers,
    score,
    monsterSpawnInterval: data.spawn_interval,
    goblinMinInterval,
    goblinMaxInterval,
  });

  socket.emit('highscore', { highscore: (await highscoreRedis.getHighscoreData())?.score || 0 });
};

export const gameEnd = async (uuid, payload, socket) => {
  const { timeStamp, score } = payload;
  const { game, monster } = getGameAssets();
  const { baseHp, monsterSpawnInterval } = game.data;
  const userGameData = await gameRedis.getGameData(uuid);

  const elapsedTime = timeStamp - userGameData.start_time;
  console.log('경과 시간', elapsedTime);

  /* 검증 로직 */
  // 일반 몬스터 kill count 검증
  const maxPossibleSpawn = elapsedTime / game.data.monsterSpawnInterval;
  // if (maxPossibleSpawn < userGameData.kill_count) {
  //   throw new CustomError('몬스터 kill count 검증 실패');
  // }

  // 고블린 kill count 검증
  const maxPossibleGoblinSpawn = elapsedTime / game.data.goblinMinInterval;
  // if (maxPossibleGoblinSpawn < userGameData.goblin_kill_count) {
  //   throw new CustomError('고블린 kill count 검증 실패');
  // }
  const result = {
    emit: {
      event: 'gameEnd',
      data: { status: 'success', message: '게임 오버', elapsedTime, score },
    },
  };

  /* highscore 갱신 */
  const isHighscore = await highscoreRedis.createHighscoreData(uuid, score);

  if (isHighscore && isHighscore[1]) {
    result.broadcast = { event: 'highscore', highscore: score };
  }
  /* ----- */
  return result;
};
