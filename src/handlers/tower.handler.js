import { getGameAssets } from '../init/assets.js';
import CustomError from '../utils/errors/classes/custom.error.js';
import { gameRedis } from '../utils/redis.utils.js';

export const towerInitialHandler = async (uuid, payload, socket) => {
  const { towerData, towerIndex } = payload;

  await gameRedis.patchGameDataTower(uuid, towerData, towerIndex);

  // 타워 좌표 저장 확인
  // await gameRedis.getGameDataTowerList(uuid);

  if (!towerData) {
    throw new CustomError('최초 타워 추가 검증 실패', 'towerInitial');
  }

  socket.emit('towerInitial', { status: 'success', message: '최초 타워 추가 완료', towerData });
};

export const towerPurchaseHandler = async (uuid, payload, socket) => {
  const { towerData, towerIndex } = payload;
  const { tower } = getGameAssets();

  await gameRedis.patchGameDataTower(uuid, towerData, towerIndex);

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

  const test = await gameRedis.getGameDataTowerList(uuid);
  console.log(test);

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
