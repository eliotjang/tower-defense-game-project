import { gameStart, gameEnd } from './game.handler.js';
import { moveStageHandler } from './stage.handler.js';
import { monsterKillHandler, monsterPassHandler, goblinSpawnHandler } from './monster.handler.js';
import { towerInitialHandler, towerPurchaseHandler, towerRefundHandler, towerUpgradeHandler } from './tower.handler.js';



const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
  21: monsterKillHandler,
  22: monsterPassHandler,
  23: goblinSpawnHandler,
  30: towerInitialHandler,
  31: towerPurchaseHandler,
  32: towerRefundHandler,
  33: towerUpgradeHandler,
};

export default handlerMappings;
