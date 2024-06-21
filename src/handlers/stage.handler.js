import { getGameAssets } from '../init/assets.js';
import { gameRedis } from '../utils/redis.utils.js';
import CustomError from '../utils/errors/classes/custom.error.js';
import { addUserGoldData } from '../models/user.model.js';

export const moveStageHandler = async (uuid, payload, socket) => {
  const tolerance = 100; //오차값
  // console.log('스테이지 이동 요청 받음!'); 테스트 코드
  const { stage } = getGameAssets();
  const { currentStage } = payload; //클라이언트에서 보낸 현재 스테이지 정보
  const user = await gameRedis.getGameData(uuid);
  const targetScore = stage.data.find((item) => item.id == user.stage_id).target_score;
  const nextStageId = stage.data.find((item) => item.id == user.stage_id + 1);
  if (!nextStageId) {
    socket.emit('moveStage', {
      status: 'success',
      message: '마지막 스테이지 입니다.',
      stageId: user.stage_id,
      targetScore: 99999999, //하드 코딩
    });
    return;
  }
  if (targetScore - tolerance <= user.score) {
    //스테이지 이동 허락
    // await gameRedis.patchGameDataEx(uuid, { user_gold: user.user_gold + 1000 }); //천원 지급 필수구현과제
    addUserGoldData(uuid, 1000);
    socket.emit('moveStage', {
      status: 'success',
      message: '스테이지 이동',
      stageId: user.stage_id + 1,
      targetScore: stage.data.find((item) => item.id == user.stage_id + 1).target_score,
    });
    return;
  }
  // throw new CustomError('스테이지 이동 검증 실패', 'moveStage');
};
