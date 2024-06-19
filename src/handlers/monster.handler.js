import { getGameAssets } from '../init/assets.js';
import { gameRedis } from '../utils/redis.utils.js';
import { constants } from '../constants.js';
import CustomError from '../utils/errors/classes/custom.error.js';

const userData = [];
const getUser = (socketId) => {
  return userData.find((user) => user.socketId === socketId);
};

const initializeUser = (socketId) => {
  //킬로그를 저장하는 인메모리 저장공간
  let user = getUser(socketId);
  if (!user) {
    user = {
      socketId: socketId,
      killLog: [],
    };
    userData.push(user);
    console.log(`유저 정보가 생성되었습니다 socketId: ${socketId}`);
  }
  return user;
};

export const monsterKillHandler = async (uuid, payload, socket) => {
  try {
    const { monster, monster_unlock, stage } = getGameAssets();
    const { monsterId } = payload; //클라이언트로 부터 몬스터 id 데이터 받아옴
    const score = monster.data.find((item) => item.id === monsterId).score; // 몬스터의 점수 찾기
    const timeStamp = Date.now();
    const inMemoryUserData = initializeUser(socket.id);
    let currentStageId; //redis 데이터 기준 유저의 현재 스테이지
    let monsterList; //현재 있는 스테이지에 출현 가능한 몬스터 목록
    let stageField; //현재 스테이지의 정보
    const user = await gameRedis.getGameData(uuid);
    if (!user) {
      throw new Error('정보를 찾을 수 없습니다');
    }
    currentStageId = user.stage_id;
    monsterList = monster_unlock.data.find((item) => item.stage_id == currentStageId).monster;
    stageField = stage.data.find((item) => item.id == currentStageId).target_score;
    console.log('현재 점수', user.score);
    if (monsterList.includes(monsterId)) {
      const addScore = user.score + score;
      await gameRedis.patchGameDataEx(uuid, { score: addScore }); // 몬스터 존재시 점수 증감
      inMemoryUserData.killLog.push({ monsterId, timeStamp }); //킬로그에 저장
      await gameRedis.patchGameDataEx(uuid,{kill_count:user.kill_count+1})
    } else {
      console.log('처치 검증 실패', monsterId, '가 처치됨');
      socket.emit('monsterKill', { status: 'fail', message: '몬스터 처치 검증 실패' });
      return;
    }
    if (stageField < user.score) {
      await gameRedis.patchGameDataEx(uuid, { stage_id: user.stage_id + 1 });
      console.log('스테이지 이동! 현재 스테이지', currentStageId - 98);
    }
    socket.emit('monsterKill', { status: 'success', message: '몬스터 처치 성공', timeStamp });
  } catch (error) {
    console.log({ errorMessage: error.message });
  }
};

//리펙터링
//getUserData를 통해 모든 필드를 불러온다

export const monsterPassHandler = (uuid, payload, socket) => {
  const { monsterId } = payload;

  if (false) {
    socket.emit('monsterPass', { status: 'fail', message: '몬스터 통과 검증 실패' });
    return;
  }

  socket.emit('monsterPass', { status: 'success', message: '몬스터 통과 성공' });
};

export const goblinSpawnHandler = async (uuid, payload, socket) => {
  const { spawnTime } = payload;

  const gameData = await gameRedis.getGameData(uuid);
  const elapsedTime = spawnTime - gameData.goblin_time;
  const data = getGameAssets().game.data;

  if (elapsedTime < data.goblinMinInterval - constants.GOBLIN_SPAWN_INTERVAL_TOLERANCE) {
    throw new CustomError('보물 고블린 소환 검증 실패: 너무 빨리 소환됨', 'goblinSpawn');
  }

  if (false) {
    throw new CustomError('보물 고블린 소환 검증 실패', 'goblinSpawn');
  }

  socket.emit('goblinSpawn', { status: 'success', message: '보물 고블린 소환' });
};
