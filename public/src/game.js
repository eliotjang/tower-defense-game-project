import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';
import towerData from '../assets/tower.json' with { type: 'json' };
import { CLIENT_VERSION } from './Constants.js';

let serverSocket; // 서버 웹소켓 객체
let sendEvent;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const NUM_OF_TOWERS = 5; // 타워 이미지 개수
const NUM_OF_MONSTERS = 6; // 몬스터 이미지 개수

let userGold = null; // 유저 골드
let base; // 기지 객체
let baseHp = null; // 기지 체력

let towerCost = towerData.data[0].cost; // 타워 구입 비용
let numOfInitialTowers = null; // 초기 타워 개수
let monsterSpawnInterval = null; // 몬스터 생성 주기 (ms)
let goblinMinInterval = null; // 고블린 생성 최소 주기 (ms)
let goblinMaxInterval = null; // 고블린 생성 최대 주기 (ms)
let currentStage = 100;
let targetScore = 2000;
let monsterLevel = currentStage - 99; // 몬스터 레벨 = 스테이지 레벨

const monsters = [];
const towers = [];

let score = null; // 게임 점수
let highScore = 0; // 기존 최고 점수
let isInitGame = false;
let towerIndex = 0;

const print = document.querySelector('.print');
let printHTML = ``;

// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = 'images/bg.webp';

// const towerImage = new Image();
// towerImage.src = "images/tower.png";

const towerImages = {};
for (let i = 1; i <= NUM_OF_TOWERS; i++) {
  const img = new Image();
  img.src = `images/tower${i}.png`;
  towerImages[i] = img;
  // towerImages.push(img);
}

const baseImage = new Image();
baseImage.src = 'images/base.png';

const pathImage = new Image();
pathImage.src = 'images/path.png';

const monsterImages = {};
for (let i = 1; i <= NUM_OF_MONSTERS; i++) {
  const img = new Image();
  img.src = `images/monster${i}.png`;
  monsterImages[i] = img;
}

let monsterPath;

function generateRandomMonsterPath() {
  const path = [];
  let currentX = 0;
  let currentY = Math.floor(Math.random() * 21) + 500; // 500 ~ 520 범위의 y 시작 (캔버스 y축 중간쯤에서 시작할 수 있도록 유도)

  path.push({ x: currentX, y: currentY });

  while (currentX < canvas.width) {
    currentX += Math.floor(Math.random() * 100) + 50; // 50 ~ 150 범위의 x 증가
    // x 좌표에 대한 clamp 처리
    if (currentX > canvas.width) {
      currentX = canvas.width;
    }

    currentY += Math.floor(Math.random() * 200) - 100; // -100 ~ 100 범위의 y 변경
    // y 좌표에 대한 clamp 처리
    if (currentY < 0) {
      currentY = 0;
    }
    if (currentY > canvas.height) {
      currentY = canvas.height;
    }

    path.push({ x: currentX, y: currentY });
  }

  return path;
}

function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 그리기
  drawPath();
}

function drawPath() {
  const segmentLength = 20; // 몬스터 경로 세그먼트 길이
  const imageWidth = 60; // 몬스터 경로 이미지 너비
  const imageHeight = 60; // 몬스터 경로 이미지 높이
  const gap = 5; // 몬스터 경로 이미지 겹침 방지를 위한 간격

  for (let i = 0; i < monsterPath.length - 1; i++) {
    const startX = monsterPath[i].x;
    const startY = monsterPath[i].y;
    const endX = monsterPath[i + 1].x;
    const endY = monsterPath[i + 1].y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // 피타고라스 정리로 두 점 사이의 거리를 구함 (유클리드 거리)
    const angle = Math.atan2(deltaY, deltaX); // 두 점 사이의 각도는 tan-1(y/x)로 구해야 함 (자세한 것은 역삼각함수 참고): 삼각함수는 변의 비율! 역삼각함수는 각도를 구하는 것!

    for (let j = gap; j < distance - gap; j += segmentLength) {
      // 사실 이거는 삼각함수에 대한 기본적인 이해도가 있으면 충분히 이해하실 수 있습니다.
      // 자세한 것은 https://thirdspacelearning.com/gcse-maths/geometry-and-measure/sin-cos-tan-graphs/ 참고 부탁해요!
      const x = startX + Math.cos(angle) * j; // 다음 이미지 x좌표 계산(각도의 코사인 값은 x축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 x축 좌표를 구함)
      const y = startY + Math.sin(angle) * j; // 다음 이미지 y좌표 계산(각도의 사인 값은 y축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 y축 좌표를 구함)
      drawRotatedImage(pathImage, x, y, imageWidth, imageHeight, angle);
    }
  }
}

function drawRotatedImage(image, x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function getRandomPositionNearPath(maxDistance) {
  // 타워 배치를 위한 몬스터가 지나가는 경로 상에서 maxDistance 범위 내에서 랜덤한 위치를 반환하는 함수!
  const segmentIndex = Math.floor(Math.random() * (monsterPath.length - 1));
  const startX = monsterPath[segmentIndex].x;
  const startY = monsterPath[segmentIndex].y;
  const endX = monsterPath[segmentIndex + 1].x;
  const endY = monsterPath[segmentIndex + 1].y;

  const t = Math.random();
  const posX = startX + t * (endX - startX);
  const posY = startY + t * (endY - startY);

  const offsetX = (Math.random() - 0.5) * 2 * maxDistance;
  const offsetY = (Math.random() - 0.5) * 2 * maxDistance;

  return {
    x: posX + offsetX,
    y: posY + offsetY,
  };
}

function placeInitialTower(x, y) {
  const tower = new Tower(x, y);
  towers.push(tower);
  tower.draw(ctx, towerImages[tower.getLevel()]);
}

function placeNewTower(x, y) {
  const tower = new Tower(x, y);
  towers.push(tower);
  tower.draw(ctx, towerImages[tower.getLevel()]);
}

function refundTower(x, y) {
  const index = towers.findIndex((e) => e.x === x && e.y === y);
  towers.splice(index, 1);
}

function upgradeTower() {
  if (towers.length === 0) {
    alert('업그레이드를 할 타워가 없습니다.');
    return;
  }

  const upgradeIndex = Math.floor(Math.random() * towers.length);
  const targetTower = towers[upgradeIndex];
  const level = targetTower.getLevel();

  if (level === 5) {
    alert('해당 타워가 최대 레벨에 도달했습니다.');
    return;
  }

  if (userGold < towerData.data[level].cost) {
    alert(`해당 타워의 업그레이드 비용이 부족합니다. 필요 골드 : ${towerData.data[level].cost}`);
    return;
  }

  sendEvent(33, { towerData: { x: targetTower.x, y: targetTower.y }, towerLevel: level });
  targetTower.upgrade();
}

const onClickUpgradeTower = () => {
  const x = event.offsetX;
  const y = event.offsetY;

  let checkClick = false;
  for (const tower of towers) {
    const left = tower.x;
    const right = tower.x + tower.width;
    const top = tower.y;
    const bottom = tower.y + tower.height;
    if (left <= x && x <= right && top <= y && y <= bottom) {
      if (tower.level === 5) {
        alert('해당 타워가 최대 레벨에 도달했습니다.');
        return;
      }
      if (userGold < towerData.data[tower.level].cost) {
        alert(`해당 타워의 업그레이드 비용이 부족합니다. 필요 골드 : ${towerData.data[tower.level].cost}`);
        return;
      }

      sendEvent(33, { towerData: { x: tower.x, y: tower.y }, towerLevel: tower.getLevel() });

      tower.upgrade();
      checkClick = true;
      printHTML = ``;
      print.innerHTML = printHTML;
      canvas.removeEventListener('click', onClickUpgradeTower);
      break;
    }
  }

  if (!checkClick) {
    alert('타워를 클릭하세요');
  }
  printHTML = ``;
  print.innerHTML = printHTML;
  canvas.removeEventListener('click', onClickUpgradeTower);
};

function upgradeTargetTower() {
  canvas.addEventListener('click', onClickUpgradeTower);
}

const onClickRefundTower = () => {
  const x = event.offsetX;
  const y = event.offsetY;

  let checkClick = false;
  for (const tower of towers) {
    const left = tower.x;
    const right = tower.x + tower.width;
    const top = tower.y;
    const bottom = tower.y + tower.height;
    if (left <= x && x <= right && top <= y && y <= bottom) {
      sendEvent(32, { towerData: { x: tower.x, y: tower.y }, towerLevel: tower.getLevel() });

      refundTower(tower.x, tower.y);
      checkClick = true;
      printHTML = ``;
      print.innerHTML = printHTML;
      canvas.removeEventListener('click', onClickRefundTower);
      break;
    }
  }

  if (!checkClick) {
    alert('타워를 클릭하세요');
  }
  printHTML = ``;
  print.innerHTML = printHTML;
  canvas.removeEventListener('click', onClickRefundTower);
};

function refundTargetTower() {
  canvas.addEventListener('click', onClickRefundTower);
}

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, baseHp);
  base.draw(ctx, baseImage);
}

function spawnMonster(isGoblin) {
  monsters.push(new Monster(monsterPath, monsterImages, isGoblin));
  sendEvent(22, { isGoblin, timeStamp: Date.now() });
}

function gameLoop() {
  // 렌더링 시에는 항상 배경 이미지부터 그려야 합니다! 그래야 다른 이미지들이 배경 이미지 위에 그려져요!
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 다시 그리기
  drawPath(monsterPath); // 경로 다시 그리기

  ctx.font = '25px Times New Roman';
  ctx.fillStyle = 'skyblue';
  ctx.fillText(`최고 기록: ${highScore}`, 100, 50); // 최고 기록 표시
  ctx.fillStyle = 'white';
  ctx.fillText(`점수: ${score}`, 100, 100); // 현재 스코어 표시
  ctx.fillStyle = 'yellow';
  ctx.fillText(`골드: ${userGold}`, 100, 150); // 골드 표시
  ctx.fillStyle = 'black';
  ctx.fillText(`현재 레벨: ${monsterLevel}`, 100, 200); // 최고 기록 표시

  // 타워 그리기 및 몬스터 공격 처리
  towers.forEach((tower) => {
    tower.draw(ctx, towerImages[tower.getLevel()]);
    tower.updateCooldown();
    monsters.forEach((monster) => {
      const distance = Math.sqrt(Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2));
      if (distance < tower.range) {
        tower.attack(monster);
      }
    });
  });

  // 몬스터가 공격을 했을 수 있으므로 기지 다시 그리기
  base.draw(ctx, baseImage);

  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    if (monster.hp > 0) {
      const isDestroyed = monster.move(base);
      if (isDestroyed) {
        /* 게임 오버 */
        sendEvent(3, { timeStamp: Date.now(), score });
        location.reload();
        alert('게임 오버. 스파르타 본부를 지키지 못했다...ㅠㅠ');
      }
      monster.draw(ctx);
    } else {
      if (!monster.passed) {
        /* 몬스터가 죽었을 때 */
        score += monster.score;
        sendEvent(21, { monsterId: monster.id });
      }
      if (score > targetScore) {
        //스코어가 일정 이상이면 스테이지 이동요청
        sendEvent(11, { currentStage });
      }
      monsters.splice(i, 1);
    }
  }

  requestAnimationFrame(gameLoop); // 지속적으로 다음 프레임에 gameLoop 함수 호출할 수 있도록 함
}
function initGame() {
  if (isInitGame) {
    return;
  }
  monsterPath = generateRandomMonsterPath(); // 몬스터 경로 생성
  initMap(); // 맵 초기화 (배경, 몬스터 경로 그리기)

  for (let i = 0; i < numOfInitialTowers; i++) {
    const { x, y } = getRandomPositionNearPath(200);
    sendEvent(30, { towerData: { x, y }, towerIndex });
    towerIndex++;
  }

  let initialStageId = 100; // 최초 스테이지 정보
  Monster.setMonsterPoolByStageId(initialStageId);

  setInterval(() => {
    spawnMonster(false);
  }, monsterSpawnInterval); // 설정된 몬스터 생성 주기마다 몬스터 생성

  placeBase(); // 기지 배치
  setGoblinSpawnRequest(goblinMinInterval, goblinMaxInterval); // 고블린 스폰 인터벌 설정
  gameLoop(); // 게임 루프 최초 실행
  isInitGame = true;
}

async function setGoblinSpawnRequest(minInterval, maxInterval) {
  const diff = maxInterval - minInterval;
  const interval = Math.floor(Math.random() * diff + minInterval);
  setTimeout(() => {
    console.log('GOBLIN SPAWN REQUEST');
    sendEvent(23, { spawnTime: Date.now() });
    setGoblinSpawnRequest(minInterval, maxInterval);
  }, interval);
}

// 이미지 로딩 완료 후 서버와 연결하고 게임 초기화
Promise.all([
  new Promise((resolve) => (backgroundImage.onload = resolve)),
  // new Promise((resolve) => (towerImage.onload = resolve)),
  new Promise((resolve) => (baseImage.onload = resolve)),
  new Promise((resolve) => (pathImage.onload = resolve)),
  Object.values(towerImages).map((img) => new Promise((resolve) => (img.onload = resolve))),
  Object.values(monsterImages).map((img) => new Promise((resolve) => (img.onload = resolve))),
]).then(() => {
  serverSocket = io('localhost:3000', {
    query: {
      clientVersion: CLIENT_VERSION,
    },
    auth: {
      token: localStorage.getItem('accessToken'),
    },
  });

  let userId = null;
  serverSocket.on('connection', async (data) => {
    console.log(data);
    userId = data.uuid;
    sendEvent(2, { timeStamp: Date.now() });
  });

  serverSocket.on('towerInitial', (data) => {
    if (data.status === 'success') {
      placeInitialTower(data.towerData.x, data.towerData.y); // 설정된 초기 타워 개수만큼 사전에 타워 배치
    } else {
      alert('최초 타워 추가 검증 실패');
    }
    console.log(data);
  });

  serverSocket.on('authorization', (message) => {
    alert(message);
    window.location.href = 'index.html';
  });
  serverSocket.on('gameStart', (data) => {
    if (data.status === 'success') {
      userGold = data.userGold;
      baseHp = data.baseHp;
      numOfInitialTowers = data.numOfInitialTowers;
      score = +data.score;
      monsterSpawnInterval = data.monsterSpawnInterval;
      goblinMinInterval = data.goblinMinInterval;
      goblinMaxInterval = data.goblinMaxInterval;
      if (!isInitGame) {
        initGame();
      }
    } else {
      alert('게임 초기 정보 검증에 실패했습니다.');
    }
    console.log(data);
  });

  serverSocket.on('gameEnd', (data) => {
    if (data.status === 'success') {
    } else {
      alert('gameEnd 실패 메시지 입력');
    }
    console.log(data);
  });

  serverSocket.on('monsterKill', (data) => {
    if (data.status === 'success') {
    } else {
      alert(data.message);
    }
    //console.log(data);
  });

  serverSocket.on('monsterSpawnHandler', (data) => {
    if (data.status === 'success') {
    } else {
      alert('monsterSpawnHandler 실패 메시지 입력');
    }
    console.log(data);
  });

  serverSocket.on('goblinSpawn', (data) => {
    if (data.status === 'success') {
      spawnMonster(true);
    } else {
      location.reload();
      alert('고블린 소환 실패: 클라이언트 변조 탐지');
    }
    console.log(data);
  });

  serverSocket.on('moveStage', async (data) => {
    if (data.status === 'success') {
      targetScore = data.targetScore;
      Monster.setMonsterPoolByStageId(data.stageId);
      console.log('스테이지 이동 허용.현재 스테이지:', data.stageId - 99, '목표 점수:', data.targetScore);
      userGold += 1000; //레벨이 오르면 유저에게 1000원 제공
      monsterLevel = data.stageId - 99; //스테이지 레벨 변경
    } else {
      alert(data.message);
    }
    console.log(data);
  });

  serverSocket.on('towerPurchase', (data) => {
    if (data.status === 'success') {
      userGold = data.userGold;
      console.log('타워 구매 후 잔액', userGold);
      placeNewTower(data.towerData.x, data.towerData.y);
    } else {
      alert('타워 구매 검증 실패');
    }

    console.log(data);
  });

  serverSocket.on('towerRefund', (data) => {
    if (data.status === 'success') {
      userGold = data.userGold;
    } else {
      alert('타워 환불 검증에 실패했습니다.');
    }
    console.log(data);
  });

  serverSocket.on('towerUpgrade', (data) => {
    if (data.status === 'success') {
      userGold = data.userGold;
    } else {
      alert('실패 메시지 입력');
    }
    console.log(data);
  });
  serverSocket.on('targetTowerUpgrade', (data) => {
    if (data.status === 'success') {
      userGold = data.userGold;
    } else {
      alert('실패 메시지 입력');
    }
    console.log(data);
  });

  serverSocket.on('highscore', (data) => {
    // TODO: update highscore
    console.log(data);
    highScore = data.highscore;
  });

  sendEvent = (handlerId, payload) => {
    serverSocket.emit('event', {
      userId,
      clientVersion: CLIENT_VERSION,
      handlerId,
      payload,
    });
  };

  serverSocket.on('error', (data) => {
    console.log(data);
  });
});

export { sendEvent };

const buyTowerButton = document.createElement('button');
buyTowerButton.textContent = '타워 구입';
buyTowerButton.style.position = 'absolute';
buyTowerButton.style.top = '10px';
buyTowerButton.style.right = '10px';
buyTowerButton.style.padding = '10px 20px';
buyTowerButton.style.fontSize = '16px';
buyTowerButton.style.cursor = 'pointer';

buyTowerButton.addEventListener('click', () => {
  const { x, y } = getRandomPositionNearPath(200);

  if (userGold < towerData.data[0].cost) {
    alert(`타워 구매 비용이 부족합니다. 필요 골드 : ${towerData.data[0].cost}`);
    return;
  }

  sendEvent(31, { towerData: { x, y }, towerIndex });
  towerIndex++;
});

document.body.appendChild(buyTowerButton);

const refundTowerButton = document.createElement('button');
refundTowerButton.textContent = '타워 판매(랜덤)';
refundTowerButton.style.position = 'absolute';
refundTowerButton.style.top = '10px';
refundTowerButton.style.right = '130px';
refundTowerButton.style.padding = '10px 20px';
refundTowerButton.style.fontSize = '16px';
refundTowerButton.style.cursor = 'pointer';

refundTowerButton.addEventListener('click', () => {
  if (towers.length === 0) {
    alert('환불할 타워가 없습니다');
    return;
  }

  const refundIndex = Math.floor(Math.random() * towers.length);
  const targetTower = towers[refundIndex];

  refundTower(targetTower.x, targetTower.y);
  sendEvent(32, { towerData: { x: targetTower.x, y: targetTower.y }, towerLevel: targetTower.getLevel() });
  towerIndex++;
});

document.body.appendChild(refundTowerButton);

const upgradeRandomTowerButton = document.createElement('button');
upgradeRandomTowerButton.textContent = '타워 업그레이드(랜덤)';
upgradeRandomTowerButton.style.position = 'absolute';
upgradeRandomTowerButton.style.top = '65px';
upgradeRandomTowerButton.style.right = '10px';
upgradeRandomTowerButton.style.padding = '10px 20px';
upgradeRandomTowerButton.style.fontSize = '16px';
upgradeRandomTowerButton.style.cursor = 'pointer';

upgradeRandomTowerButton.addEventListener('click', () => {
  upgradeTower();
});

document.body.appendChild(upgradeRandomTowerButton);

const upgradeTargetTowerButton = document.createElement('button');
upgradeTargetTowerButton.textContent = '타워 업그레이드(지정)';
upgradeTargetTowerButton.style.position = 'absolute';
upgradeTargetTowerButton.style.top = '65px';
upgradeTargetTowerButton.style.right = '220px';
upgradeTargetTowerButton.style.padding = '10px 20px';
upgradeTargetTowerButton.style.fontSize = '16px';
upgradeTargetTowerButton.style.cursor = 'pointer';

upgradeTargetTowerButton.addEventListener('click', () => {
  if (towers.length === 0) {
    alert('업그레이드할 타워가 없습니다.');
    return;
  }
  printHTML = `업그레이드할 타워를 클릭하세요`;
  print.innerHTML = printHTML;
  upgradeTargetTower();
});

document.body.appendChild(upgradeTargetTowerButton);

const refundTargetTowerButton = document.createElement('button');
refundTargetTowerButton.textContent = '타워 판매(지정)';
refundTargetTowerButton.style.position = 'absolute';
refundTargetTowerButton.style.top = '10px';
refundTargetTowerButton.style.right = '290px';
refundTargetTowerButton.style.padding = '10px 20px';
refundTargetTowerButton.style.fontSize = '16px';
refundTargetTowerButton.style.cursor = 'pointer';

refundTargetTowerButton.addEventListener('click', () => {
  if (towers.length === 0) {
    alert('환불할 타워가 없습니다.');
    return;
  }
  printHTML = `환불할 타워를 클릭하세요`;
  print.innerHTML = printHTML;
  refundTargetTower();
});

document.body.appendChild(refundTargetTowerButton);
