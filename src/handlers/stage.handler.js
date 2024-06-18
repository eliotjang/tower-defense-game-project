export const moveStageHandler = (uuid, payload, socket) => {
  if (false) {
    socket.emit('moveStage', { status: 'fail', message: '스테이지 이동 검증 실패' });
    return;
  }

  socket.emit('moveStage', { status: 'success', message: '스테이지 이동' });
};
