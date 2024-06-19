import { loadGameAssets } from '../init/assets.js';

const gameAssets = await loadGameAssets(); // 검증을 위한 게임 에셋을 로드
const userData = []; //유저의 정보를 소켓id 기반 인메모리 방식으로 임시 저장

const getUser = (socketId) => {
  return userData.find((user) => user.socketId === socketId);
};

const initializeUser = (socketId) => {
  let user = getUser(socketId);
  if (!user) {
    user = {
      socketId: socketId,
      totalScore: 0,
      currentStageId: 100,
      killLog: [],
    };
    userData.push(user);
    console.log(`유저 정보가 생성되었습니다 socketId: ${socketId}`);
  } else {
    console.log(`기존 유저를 불러옵니다 socketId: ${socketId}`);
  }
  return user;
};

export const monsterKillHandler = (uuid, payload, socket) => {
  try {
    const { monsterId, score } = payload;
    const timeStamp = Date.now();
    const user = initializeUser(socket.id);
    //유저 스테이지 값을 기준으로 몹 리스트 가져와서 전부 넣어줌
    const currentStageId = user.currentStageId;
    const monsterData = gameAssets.monster_unlock.data.find((item) => item.stage_id === currentStageId);
    const monsterList = monsterData.monster; //출현 가능 몬스터의 목록
    //스테지에 해당하는 몹이 있는지
    if (monsterList.includes(monsterId)) {
      user.totalScore += score; // 몬스터 존재시 점수 증감
      user.killLog.push({ monsterId, timeStamp }); //킬로그에 저장
    } else {
      console.log('처치 검증 실패', monsterId, '가 처치됨');
      socket.emit('monsterKill', { status: 'fail', message: '몬스터 처치 검증 실패' });
      return;
    }
    //점수 증감 기준으로 스테이지 이동에 대한 로직도 구현
    const stageProgress = Math.floor(user.totalScore / 2000); //stage.json 의 targetScore에 대한 하드코딩
    if (stageProgress > user.currentStageId - 100) {
      user.currentStageId++;
    }

    socket.emit('monsterKill', { status: 'success', message: '몬스터 처치 성공', timeStamp });
  } catch (error) {
    console.log({ errorMessage: error.message });
  }
};

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
