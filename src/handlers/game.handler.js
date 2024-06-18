export const gameStart = (uuid, payload, socket) => {
  // socket emit test
  const { timeStamp } = payload;

  if (false) {
    socket.emit('gameStart', { status: 'fail', message: '게임 시작 실패' });
    return;
  }

  console.log(timeStamp);

  socket.emit('gameStart', { status: 'success', message: '게임 시작!' });
};

export const gameEnd = (uuid, payload, socket) => {
  const { score: currentScore } = payload;

  if (false) {
    socket.emit('gameEnd', { status: 'fail', message: '게임 오버 검증 실패' });
  }

  socket.emit('gameEnd', { status: 'success', message: '게임 오버' });
};
