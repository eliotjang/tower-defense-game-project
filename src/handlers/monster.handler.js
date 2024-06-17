export const monsterKillHandler = (userId, payload) => {
  const { score: currentScore } = payload;

  if (false) {
    return { status: 'fail', message: '몬스터 처치 검증 실패' };
  }

  return { status: 'success', message: '몬스터 처치 성공', score };
};

export const monsterPassHandler = (userId, payload) => {
  const { monsterId } = payload;

  if (false) {
    return { status: 'fail', message: '몬스터 처치 검증 실패' };
  }

  return { status: 'success', message: '몬스터 처치 성공', score };
};

export const goblinSpawnHandler = (userId, payload) => {
  const { goblinId, spawnTime } = payload;

  if (false) {
    return { status: 'fail', message: '보물 고블린 소환 검증 실패' };
  }

  return { status: 'success', message: '보물 고블린 소환', score };
};
