import { getGameAssets } from '../init/assets.js';
import { gameRedis } from '../utils/redis.utils.js';
import { constants } from '../constants.js';
import CustomError from '../utils/errors/classes/custom.error.js';
import { addUserGoldData, spawnList } from '../models/user.model.js';
export const monsterKillHandler = async (uuid, payload, socket) => {
  try {
    const { monster, monster_unlock, stage } = getGameAssets();
    const { monsterId } = payload; //클라이언트로 부터 몬스터 id 데이터 받아옴
    const score = monster.data.find((item) => item.id === monsterId).score; // 몬스터의 점수 찾기
    const timeStamp = Date.now();
    let currentStageId; //redis 데이터 기준 유저의 현재 스테이지
    let monsterList; //현재 있는 스테이지에 출현 가능한 몬스터 목록
    let stageField; //현재 스테이지의 정보
    let goblin_Reward = 0; // 고블린 처치시 받는 보상 (초기값)
    const userGameData = await gameRedis.getGameData(uuid);

    // if (!userGameData) {
    //   throw new Error('정보를 찾을 수 없습니다');
    // }

    currentStageId = userGameData.stage_id;
    monsterList = monster_unlock.data.find((item) => item.stage_id == currentStageId).monster;
    stageField = stage.data.find((item) => item.id == currentStageId).target_score;
    // if (monsterList.includes(monsterId)) {
    const addScore = userGameData.score + score;
    await gameRedis.patchGameDataEx(uuid, { score: addScore }); // 몬스터 존재시 점수 증감
    if (monsterId > 2000) {
      await gameRedis.patchGameDataEx(uuid, {
        goblin_kill_count: userGameData.goblin_kill_count + 1,
        // user_gold: userGameData.user_gold + 500,
      });
      addUserGoldData(uuid, 500);
      goblin_Reward = 500;
    } else {
      await gameRedis.patchGameDataEx(uuid, { kill_count: userGameData.kill_count + 1 });
    }
    // } else {
    //   throw new CustomError(`'몬스터 처치 검증 실패${monsterId}가 처치됨 ${monsterList} 현재 스폰 정보`, 'monsterKill');
    // }
    if (stageField < userGameData.score) {
      await gameRedis.patchGameDataEx(uuid, { stage_id: userGameData.stage_id + 1 });
    }
    socket.emit('monsterKill', {
      status: 'success',
      message: '몬스터 처치 성공',
      user: userGameData.score,
      reward: goblin_Reward || 0,
    });
  } catch (error) {
    console.log({ errorMessage: error.message });
  }
};

//리펙터링
//getUserData를 통해 모든 필드를 불러온다

export const monsterSpawnHandler = async (uuid, payload, socket) => {
  const { isGoblin, timeStamp } = payload;
  if (isGoblin) {
    // 고블린의 검증은 다른 곳에서 수행됨
    return;
  }

  const gameData = await gameRedis.getGameData(uuid);
  const interval = gameData.spawn_interval; // 스폰 간격

  const pastTimeStamp = spawnList.popSpawnList(uuid);
  if (pastTimeStamp) {
    const timeDifference = timeStamp - pastTimeStamp;
    if (timeDifference < interval - 1000) {
      // 인터벌보다 1초가량 더 빠르면
      throw new CustomError('몬스터 생성 검증 실패', 'monsterSpawn');
    }
  }

  spawnList.addSpawnList(uuid, timeStamp);
};

export const goblinSpawnHandler = async (uuid, payload, socket) => {
  const { spawnTime } = payload;

  const gameData = await gameRedis.getGameData(uuid);
  const elapsedTime = spawnTime - gameData.goblin_time;
  const data = getGameAssets().game.data;

  if (elapsedTime < data.goblinMinInterval - constants.GOBLIN_SPAWN_INTERVAL_TOLERANCE) {
    throw new CustomError('보물 고블린 소환 검증 실패: 너무 빨리 소환됨', 'goblinSpawn');
  }

  socket.emit('goblinSpawn', { status: 'success', message: '보물 고블린 소환' });
};
