import { getGameAssets } from '../init/assets.js';
import { gameRedis } from '../utils/redis.utils.js';

let index = 0;
export const towerInitialHandler = async (uuid, payload, socket) => {
  const { towerData } = payload;

  console.log('1', towerData, index);
  await gameRedis.patchGameDataTowerTest(uuid, towerData, index++);

  const user = await gameRedis.getGameData(uuid);
  const towers = await gameRedis.getGameDataTowerList(uuid);
  console.log('2', towers);

  if (!towerData) {
    socket.emit('towerInitial', { status: 'fail', message: '최초 타워 추가 검증 실패' });
    return;
  }

  socket.emit('towerInitial', { status: 'success', message: '최초 타워 추가 완료', towerData });
};

export const towerPurchaseHandler = async (uuid, payload, socket) => {
  const { towerData } = payload;
  const { tower } = getGameAssets();

  const user = await gameRedis.getGameData(uuid);
  let userGold = user.user_gold;

  let verification = false;
  if (userGold >= tower.data[0].cost) {
    userGold -= tower.data[0].cost;
    verification = true;
    await gameRedis.patchGameDataGold(uuid, userGold);
  }

  if (!verification) {
    socket.emit('towerPurchase', { status: 'fail', message: '타워 구매 검증 실패' });
    return;
  }

  socket.emit('towerPurchase', { status: 'success', message: '타워 구매 완료', towerData, userGold });
};

export const towerRefundHandler = (uuid, payload, socket) => {
  const { towerData } = payload;

  if (false) {
    socket.emit('towerRefund', { status: 'fail', message: '타워 환불 검증 실패' });
    return;
  }

  socket.emit('towerRefund', { status: 'success', message: '타워 환불 성공' });
};

export const towerUpgradeHandler = (uuid, payload, socket) => {
  const { towerData } = payload;

  if (false) {
    socket.emit('towerUpgrade', { status: 'fail', message: '타워 업그레이드 검증 실패' });
    return;
  }

  socket.emit('towerUpgrade', { status: 'success', message: '타워 업그레이드 성공' });
};
