import { getGameAssets } from '../init/assets.js';

export const towerInitialHandler = (userId, payload, socket) => {
  const { towerData } = payload;

  console.log(towerData);

  // 추후 Redis 연동하여 towerData 값 저장

  if (!towerData) {
    socket.emit('towerInitial', { status: 'fail', message: '최초 타워 추가 검증 실패' });
    return;
  }

  socket.emit('towerInitial', { status: 'success', message: '최초 타워 추가 완료', towerData });
};

export const towerPurchaseHandler = (userId, payload, socket) => {
  const { towerData } = payload;
  let { userGold } = payload;
  const { tower } = getGameAssets();

  // 추후 Redis 연동하여 towerData 값 저장

  let verification = false;
  if (userGold >= tower.data[0].cost) {
    userGold -= tower.data[0].cost;
    verification = true;
  }

  if (!verification) {
    socket.emit('towerPurchase', { status: 'fail', message: '타워 구매 검증 실패' });
    return;
  }

  socket.emit('towerPurchase', { status: 'success', message: '타워 구매 완료', towerData, userGold });
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
