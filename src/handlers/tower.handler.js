import { getGameAssets } from '../init/assets.js';
import { addUser, addUserGoldData, getUserGoldData } from '../models/user.model.js';
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
  const { towerData, towerIndex, towerLevel } = payload;
  const { tower } = getGameAssets();

  if (!towerData) {
    throw new CustomError('타워 구매 검증 실패', 'towerPurchase');
  }

  const user = await gameRedis.getGameData(uuid);
  // let userGold = user.user_gold;
  let userGold = getUserGoldData(uuid);
  if (userGold < tower.data[towerLevel - 1].cost) {
    socket.emit('towerPurchase', { status: 'fail', message: '타워 구매 검증 실패' });
  }

  await gameRedis.patchGameDataTower(uuid, towerData, towerIndex);

  // userGold -= tower.data[towerLevel - 1].cost;

  // await gameRedis.patchGameDataGold(uuid, userGold);
  addUserGoldData(uuid, -tower.data[towerLevel - 1].cost);

  const data = await gameRedis.getGameDataTowerList(uuid);

  socket.emit('towerPurchase', { status: 'success', message: '타워 구매 완료', towerData, userGold, towerLevel });
};

export const towerRefundHandler = async (uuid, payload, socket) => {
  const { towerData, towerLevel } = payload;
  const { tower } = getGameAssets();

  const user = await gameRedis.getGameData(uuid);
  // let userGold = +user.user_gold;
  let userGold = getUserGoldData(uuid);

  const targetTower = await gameRedis.getGameDataTower(uuid, towerData);

  if (targetTower.constructor === Object && Object.keys(targetTower).length === 0) {
    throw new CustomError('타워 환불 검증 실패', 'towerRefund');
  }

  addUserGoldData(uuid, Math.floor((tower.data[towerLevel - 1].cost * 75) / 100));
  // await gameRedis.patchGameDataGold(uuid, userGold);

  await gameRedis.deleteGameDataTower(uuid, towerData);

  socket.emit('towerRefund', { status: 'success', message: '타워 환불 성공', userGold });
};

export const towerUpgradeHandler = async (uuid, payload, socket) => {
  const { towerData, towerLevel } = payload;
  const { tower } = getGameAssets();

  //console.log(towerData);

  const user = await gameRedis.getGameData(uuid);
  // let userGold = +user.user_gold;

  let userGold = getUserGoldData(uuid);
  const targetTower = await gameRedis.getGameDataTower(uuid, towerData);

  // if (targetTower.constructor === Object && Object.keys(targetTower).length === 0) {
  //   throw new CustomError('타워 업그레이드 검증 실패', 'towerUpgrade');
  // }

  // if (userGold < tower.data[towerLevel].cost) {
  //   socket.emit('towerUpgrade', { status: 'fail', message: '타워 구매 검증 실패' });
  // }

  // userGold -= tower.data[towerLevel].cost;
  // await gameRedis.patchGameDataGold(uuid, userGold);
  addUserGoldData(uuid, -tower.data[towerLevel].cost);
  socket.emit('towerUpgrade', { status: 'success', message: '타워 업그레이드 성공', userGold });
};

export const towerMoveHandler = async (uuid, payload, socket) => {
  const { towerData, towerLevel } = payload;
  const { tower } = getGameAssets();

  //console.log(towerData);

  /*   const user = await gameRedis.getGameData(uuid);
  let userGold = +user.user_gold;

  const targetTower = await gameRedis.getGameDataTower(uuid, towerData); */

  if (targetTower.constructor === Object && Object.keys(targetTower).length === 0) {
    throw new CustomError('타워 이동 검증 실패', 'towerMove');
  }

  /*   userGold -= tower.data[towerLevel].cost;
  await gameRedis.patchGameDataGold(uuid, userGold); */

  socket.emit('towerMove', { status: 'success', message: '타워 이동 성공' });
};
