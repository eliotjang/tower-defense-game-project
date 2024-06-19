import { loadGameAssets } from '../init/assets.js';

const gameAssets = await loadGameAssets(); // 검증을 위한 게임 에셋을 로드
const userData = []; //유저의 정보를 소켓id 기반 인메모리 방식으로 임시 저장

const getUser = (socketId) => {
  return userScore.find((user) => user.socketId === socketId);
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
    userScore.push(user);
    console.log(`Initialized user with socketId: ${socketId}`);
  } else {
    console.log(`User with socketId: ${socketId} already exists`);
  }
  return user;
};

export const monsterKillHandler = (uuid, payload, socket) => {
  const { monsterId, timeStamp, score } = payload;
  let user = getUser(socket.id);
  if (!user) {
    //서버 인메모리에 데이터가 없다면, 새로 생성함
    initializeUser(socket.id);
    user = getUser(socket.id);
  }
  //유저 스테이지 값을 기준으로 몹 리스트 가져와서 전부 넣어줌
  let currentStageId = user.currentStageId;
  let monsterList = gameAssets.monster_unlock.find((index)=>{index.stage_id === currentStageId});
  console.log(monsterList.monster,"현재 출현가능한 몬스터의 목록");
  //스테지에 해당하는 몹이 있는지
  //있다면 점수를 증감,없으면 에러
  //점수 증감 기준으로 스테이지 이동에 대한 로직도 구현
  
  //userScore에 socket 기반으로 값이 없으면 새로운 값 생성,값이 있다면 내부 값을 기준으로 수정
  //현재 스테이지 id = (parseInt(score % 2000)) +100

  if (false) {
    socket.emit('monsterKill', { status: 'fail', message: '몬스터 처치 검증 실패' });
    return;
  }

  socket.emit('monsterKill', { status: 'success', message: '몬스터 처치 성공', timeStamp });
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
