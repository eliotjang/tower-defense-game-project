export const gameStart = (uuid, payload, socket) => {
  // socket emit test
  const { timeStamp } = payload;

  if (false) {
    return { status: 'fail', message: '게임 시작 실패' };
  }

  console.log(timeStamp);

  socket.emit('gameStart', { message: '게임 시작 시간 정보입니다.', timeStamp });

  return { status: 'success', message: '게임 시작!' };
};

export const gameEnd = (uuid, payload) => {
  const { score: currentScore } = payload;

  if (false) {
    return { status: 'fail', message: '게임 오버 검증 실패' };
  }

  return { status: 'success', message: '게임 오버' };
};
