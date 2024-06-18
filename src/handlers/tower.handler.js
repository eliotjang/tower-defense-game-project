export const towerInitialHandler = (userId, payload, socket) => {
  const { numOfInitialTowers } = payload;

  if (false) {
    socket.emit('towerInitial', { status: 'fail', message: '최초 타워 추가 검증 실패' });
    return;
  }

  socket.emit('towerInitial', { status: 'success', message: '최초 타워 추가 완료' });
};

export const towerPurchaseHandler = (userId, payload, socket) => {
  const { towerData } = payload;

  if (false) {
    socket.emit('towerPurchase', { status: 'fail', message: '타워 구매 검증 실패' });
    return;
  }

  socket.emit('towerPurchase', { status: 'success', message: '타워 구매 완료' });
};

export const towerRefundHandler = (userId, payload, socket) => {
  const { towerData } = payload;

  if (false) {
    socket.emit('towerRefund', { status: 'fail', message: '타워 환불 검증 실패' });
    return;
  }

  socket.emit('towerRefund', { status: 'success', message: '타워 환불 성공' });
};

export const towerUpgradeHandler = (userId, payload, socket) => {
  const { towerData } = payload;

  if (false) {
    socket.emit('towerUpgrade', { status: 'fail', message: '타워 업그레이드 검증 실패' });
    return;
  }

  socket.emit('towerUpgrade', { status: 'success', message: '타워 업그레이드 성공' });
};
