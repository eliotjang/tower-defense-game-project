import monsterData from '../assets/monster.json' with { type: 'json' };

let monsterPool = null;

export class Monster {
  constructor(path, monsterImages, isGoblin) {
    // 생성자 안에서 몬스터의 속성을 정의한다고 생각하시면 됩니다!
    if (!path || path.length <= 0) {
      throw new Error('몬스터가 이동할 경로가 필요합니다.');
    }
    if (!monsterPool) {
      throw new Error('생성할 몬스터 목록이 없습니다.');
    }

    if (isGoblin) {
      this.monsterNumber = monsterPool.length - 1;
    } else {
      this.monsterNumber = Math.floor(Math.random() * (monsterPool.length - 1)); // 고블린 제외
    }

    this.path = path; // 몬스터가 이동할 경로
    this.currentIndex = 0; // 몬스터가 이동 중인 경로의 인덱스
    this.x = path[0].x; // 몬스터의 x 좌표 (최초 위치는 경로의 첫 번째 지점)
    this.y = path[0].y; // 몬스터의 y 좌표 (최초 위치는 경로의 첫 번째 지점)
    this.width = monsterPool[this.monsterNumber].width; // 몬스터 이미지 가로 길이
    this.height = monsterPool[this.monsterNumber].height; // 몬스터 이미지 세로 길이
    this.speed = monsterPool[this.monsterNumber].speed; // 몬스터의 이동 속도
    this.image = monsterImages[monsterPool[this.monsterNumber].image_index]; // 몬스터 이미지
    this.maxHp = monsterPool[this.monsterNumber].hp;
    this.attackPower = monsterPool[this.monsterNumber].attack_power;
    this.hp = this.maxHp;
    this.score = monsterPool[this.monsterNumber].score;
    this.id = monsterPool[this.monsterNumber].id; //몬스터의 id
    // this.init(level);
  }

  /**
   * 게임 시작/ 스테이지 이동 시 외부에서 한 번 호출되어야 하는 method
   * @param {Number} stageId 스테이지 ID
   */
  static setMonsterPoolByStageId(stageId) {
    monsterPool = monsterData.data.filter((data) => data.stage_id == stageId);
    console.log('몬스터 풀 :', monsterPool);
  }

  init(level) {
    this.maxHp = 100 + 10 * level; // 몬스터의 현재 HP
    this.hp = this.maxHp; // 몬스터의 현재 HP
    this.attackPower = 10 + 1 * level; // 몬스터의 공격력 (기지에 가해지는 데미지)
  }

  move(base) {
    if (this.currentIndex < this.path.length - 1) {
      const nextPoint = this.path[this.currentIndex + 1];
      const deltaX = nextPoint.x - this.x;
      const deltaY = nextPoint.y - this.y;
      // 2차원 좌표계에서 두 점 사이의 거리를 구할 땐 피타고라스 정리를 활용하면 됩니다! a^2 = b^2 + c^2니까 루트를 씌워주면 되죠!
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < this.speed) {
        // 거리가 속도보다 작으면 다음 지점으로 이동시켜주면 됩니다!
        this.currentIndex++;
      } else {
        // 거리가 속도보다 크면 일정한 비율로 이동하면 됩니다. 이 때, 단위 벡터와 속도를 곱해줘야 해요!
        this.x += (deltaX / distance) * this.speed; // 단위 벡터: deltaX / distance
        this.y += (deltaY / distance) * this.speed; // 단위 벡터: deltaY / distance
      }
      return false;
    } else {
      const isDestroyed = base.takeDamage(this.attackPower); // 기지에 도달하면 기지에 데미지를 입힙니다!
      this.hp = 0; // 몬스터는 이제 기지를 공격했으므로 자연스럽게 소멸해야 합니다.
      this.passed = true;
      return isDestroyed;
    }
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    ctx.font = '12px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`(레벨 ${this.id % 10}) ${this.hp}/${this.maxHp}`, this.x, this.y - 5);
  }
}
