export const towerInitialHandler = (userId, payload) => {
  const { numOfInitialTowers } = payload;

  if (false) {
    return { status: 'fail', message: '최초 타워 추가 검증 실패' };
  }

  return { status: 'success', message: '최초 타워 추가 완료' };
};

export const towerPurchaseHandler = (userId, payload) => {
  const { towerData } = payload;

  if (false) {
    return { status: 'fail', message: '타워 구매 검증 실패' };
  }

  return { status: 'success', message: '타워 구매 완료' };
};

export const towerRefundHandler = (userId, payload) => {
  const { towerData } = payload;

  if (false) {
    return { status: 'fail', message: '타워 환불 검증 실패' };
  }

  return { status: 'success', message: '타워 환불 성공' };
};

export const towerUpgradeHandler = (userId, payload) => {
  const { towerData } = payload;

  if (false) {
    return { status: 'fail', message: '타워 업그레이드 검증 실패' };
  }

  return { status: 'success', message: '타워 업그레이드 성공' };
};
