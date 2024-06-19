import { getGameAssets } from '../init/assets.js';
import { gameRedis } from '../utils/redis.utils.js';

export const moveStageHandler = async (uuid, payload, socket) => {
  const { stage } = getGameAssets();
  const { currentStage } = payload; //클라이언트에서 보낸 현재 스테이지 정보
  const user = await gameRedis.getGameData(uuid);
  if (user.stage_id == currentStage) {
    const targetScore = stage.data.find((item) => item.id == user.stage_id).target_score;
    const nextStageId = stage.data.find((item) => item.id == user.stage_id + 1);
    if (!nextStageId) {
      socket.emit('moveStage', {
        status: 'success',
        message: '마지막 스테이지 입니다.',
        stageId: user.stage_id,
        targetScore: 99999999,
      });
      return;
    }
    if (targetScore <= user.score) {
      //스테이지 이동 허락
      socket.emit('moveStage', {
        status: 'success',
        message: '스테이지 이동',
        stageId: user.stage_id + 1,
        targetScore: stage.data.find((item) => item.id == user.stage_id + 1).target_score,
      });
      return;
    }
    console.log(user.stage_id,"-불일치-",currentStage);
  }

  if (false) {
    socket.emit('moveStage', { status: 'fail', message: '스테이지 이동 검증 실패' });
    return;
  }
};
