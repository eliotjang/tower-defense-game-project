import { getGameAssets } from '../init/assets.js';
import { gameRedis } from '../utils/redis.utils.js';
const userData = []; //유저의 정보를 소켓id 기반 인메모리 방식으로 임시 저장

const getUser = (socketId) => {
  return userData.find((user) => user.socketId === socketId);
};

const initializeUser = (socketId) => {
  //킬로그를 저장하는 인메모리 저장공간
  let user = getUser(socketId);
  if (!user) {
    user = {
      count: 0,
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
    await gameRedis.getGameData(uuid).then((user) => {
      if (!user) {
        throw new Error('정보를 찾을 수 없습니다');
      }
      currentStageId = user.stage_id;
      monsterList = monster_unlock.data.find((item) => item.stage_id == currentStageId).monster;
      stageField = stage.data.find((item) => item.id == currentStageId).target_score;
      console.log('현재 점수', user.score);
      console.log('현재 스테이지', currentStageId);
      if (monsterList.includes(monsterId)) {
        
        const addScore = user.score + score;
        console.log("추가되는 점수",addScore);
        gameRedis.patchGameData(uuid, score, addScore); // 몬스터 존재시 점수 증감
        inMemoryUserData.killLog.push({ monsterId, timeStamp }); //킬로그에 저장
        inMemoryUserData.count++;
      } else {
        console.log('처치 검증 실패', monsterId, '가 처치됨');
        socket.emit('monsterKill', { status: 'fail', message: '몬스터 처치 검증 실패' });
        return;
      }
      if (stageField < user.score) {
        gameRedis.patchGameData(uuid, stage_id, user.stage_id + 1);
      }
      socket.emit('monsterKill', { status: 'success', message: '몬스터 처치 성공', timeStamp });
    });
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

export const goblinSpawnHandler = (uuid, payload, socket) => {
  const { goblinId, spawnTime } = payload;

  if (false) {
    socket.emit('goblinSpawn', { status: 'fail', message: '보물 고블린 소환 검증 실패' });
    return;
  }

  socket.emit('goblinSpawn', { status: 'success', message: '보물 고블린 소환', score });
};
