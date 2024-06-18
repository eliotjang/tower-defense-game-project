export const monsterKillHandler = (userId, payload, socket) => {
  const { score: currentScore } = payload;

  if (false) {
    socket.emit('monsterKill', { status: 'fail', message: '몬스터 처치 검증 실패' });
    return;
  }

  socket.emit('monsterKill', { status: 'success', message: '몬스터 처치 성공', score });
};

export const monsterPassHandler = (userId, payload, socket) => {
  const { monsterId } = payload;

  if (false) {
    socket.emit('monsterPass', { status: 'fail', message: '몬스터 통과 검증 실패' });
    return;
  }

  socket.emit('monsterPass', { status: 'success', message: '몬스터 통과 성공' });
};

export const goblinSpawnHandler = (userId, payload, socket) => {
  const { goblinId, spawnTime } = payload;

  if (false) {
    socket.emit('goblinSpawn', { status: 'fail', message: '보물 고블린 소환 검증 실패' });
    return;
  }

  socket.emit('goblinSpawn', { status: 'success', message: '보물 고블린 소환', score });
};
