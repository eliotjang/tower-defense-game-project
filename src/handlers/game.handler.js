export const gameStart = (uuid, payload) => {
  const { timeStamp } = payload;

  if (false) {
    return { status: 'fail', message: '게임 시작 실패' };
  }

  return { status: 'success', message: '게임 시작!' };
};

export const gameEnd = (uuid, payload) => {
  const { score: currentScore } = payload;

  if (false) {
    return { status: 'fail', message: '게임 오버 검증 실패' };
  }

  return { status: 'success', message: '게임 오버' };
};
