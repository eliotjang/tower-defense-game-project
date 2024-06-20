import { gameStart, gameEnd } from './game.handler.js';
import { moveStageHandler } from './stage.handler.js';
import { monsterKillHandler, monsterSpawnHandler, goblinSpawnHandler } from './monster.handler.js';
import {
  towerInitialHandler,
  towerPurchaseHandler,
  towerRefundHandler,
  towerUpgradeHandler,
  towerMoveHandler,
} from './tower.handler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
  21: monsterKillHandler,
  22: monsterSpawnHandler,
  23: goblinSpawnHandler,
  30: towerInitialHandler,
  31: towerPurchaseHandler,
  32: towerRefundHandler,
  33: towerUpgradeHandler,
  34: towerMoveHandler,
};

export default handlerMappings;
