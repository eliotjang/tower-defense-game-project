import redisClient from '../init/redis.js';

const USER_PREFIX = 'user:';
const USER_FIELD_UUID = 'uuid';
const USER_FIELD_PASSWORD = 'password';
const GAME_DATA_PREFIX = 'game:';
const GAME_FIELD_GOLD = 'user_gold';
const GAME_FIELD_STAGE = 'stage_id';
const GAME_FIELD_SCORE = 'score';
const GAME_FIELD_TOWER = 'tower_coordinates';
const GAME_FIELD_INITIAL_TOWERS = 'initial_towers';
const GAME_FIELD_BASE_HP = 'base_hp';
const GAME_FIELD_START_TIME = 'start_time';
const GAME_FIELD_SPAWN_INTERVAL = 'spawn_interval';
const GAME_FIELD_KILL_COUNT = 'kill_count';
const GAME_FIELD_GOBLIN_KILL_COUNT = 'goblin_kill_count';
const GAME_FIELD_GOBLIN_TIME = 'goblin_time';
const TOWERS_PREFIX = 'towers:';
// const GAME_FIELD_HIGHSCORE = 'highscore';
const HIGHSCORE_PREFIX = 'highscore:';

export const userRedis = {
  /**
   * 유저 데이터 생성
   * @param {uuid} uuid 유저의 UUID
   * @param {string} userId 유저의 계정 이름
   * @param {string} hashedPassword bcrypt로 해시 처리 된 비밀번호 문자열
   */
  createUserData: async function (uuid, userId, hashedPassword) {
    try {
      const key = `${USER_PREFIX}${userId}`;
      const data = await redisClient.hVals(key);
      if (data && data.length > 0) {
        throw new Error('User data with the given userId already exists.');
      }
      await redisClient.hSet(key, `${USER_FIELD_UUID}`, JSON.stringify(uuid));
      await redisClient.hSet(key, `${USER_FIELD_PASSWORD}`, JSON.stringify(hashedPassword));
    } catch (err) {
      console.error('Error creating user data: ', err);
    }
  },
  /**
   * 유저 ID를 이용하여 해당 유저의 데이터를 조회
   * @param {userId} 유저의 userId
   * @returns 유저 데이터의 field 이름들을 key로 가지는 key-value가 담긴 객체, 혹은 에러 시 null
   */
  getUserData: async function (userId) {
    try {
      const key = `${USER_PREFIX}${userId}`;
      const data = await redisClient.hVals(key);
      if (!data || data.length === 0) {
        throw new Error(`User data doesn't exists.`);
      }
      return {
        userId: userId,
        [USER_FIELD_UUID]: data[0],
        [USER_FIELD_PASSWORD]: data[1],
      };
    } catch (err) {
      //console.error('Error getting user data: ', err);
      return null;
    }
  },
  /**
   * 모든 유저 데이터 조회
   * @returns 모든 유저의 데이터가 담긴 배열, 혹은 에러 시 null
   */
  getAllUserData: async function () {
    try {
      const keys = await redisClient.keys(`${USER_PREFIX}*`);
      if (!keys || keys.length === 0) {
        throw new Error('No user data exists.');
      }

      const data = keys.reduce((acc, key, idx) => {
        key = key.substring(USER_PREFIX.length);

        acc[idx] = {
          uuid: key,
          [USER_FIELD_USER_ID]: data[0],
          [USER_FIELD_PASSWORD]: data[1],
        };

        return acc;
      }, {});

      return data;
    } catch (err) {
      console.error('Error getting user data: ', err);
      return null;
    }
  },
};

export const gameRedis = {
  /**
   * 유저의 게임 데이터 생성
   * @param {uuid} uuid 유저의 UUID
   * @param {number} gold 유저 보유 gold
   * @param {number} stageId 현재 스테이지 ID
   * @param {number} score 유저 점수
   * @param {number} numOfInitialTowers 초기 타워 개수
   * @param {number} baseHp 기지의 HP
   * @param {number} startTime 게임 시작 시간(클라이언트 기준, Date.now())
   * @param {number} spawnInterval 몬스터 소환 interval in millis
   * @param {number} lastGoblinSpawnTime 마지막 고블린 스폰 시간 (클라 기준, Date.now())
   * @param {number} killCount 몬스터 킬 카운트
   * @param {number} goblinKillCount 고블린 킬 카운트
   */
  createGameData: async function (
    uuid,
    gold,
    stageId,
    score,
    numOfInitialTowers,
    baseHp,
    startTime,
    spawnInterval,
    lastGoblinSpawnTime,
    killCount,
    goblinKillCount
  ) {
    try {
      const key = `${GAME_DATA_PREFIX}${uuid}`;
      const data = await redisClient.hVals(key);
      await redisClient.watch(key);
      const transaction = redisClient.multi();
      if (!data || data.length === 0) {
        transaction.hSet(key, `${GAME_FIELD_GOLD}`, `${gold}`);
        transaction.hSet(key, `${GAME_FIELD_STAGE}`, `${stageId}`);
        transaction.hSet(key, `${GAME_FIELD_SCORE}`, `${score}`);
        transaction.hSet(key, `${GAME_FIELD_INITIAL_TOWERS}`, `${numOfInitialTowers}`);
        transaction.hSet(key, `${GAME_FIELD_BASE_HP}`, `${baseHp}`);
        transaction.hSet(key, `${GAME_FIELD_START_TIME}`, `${startTime}`);
        transaction.hSet(key, `${GAME_FIELD_SPAWN_INTERVAL}`, `${spawnInterval}`);
        transaction.hSet(key, `${GAME_FIELD_GOBLIN_TIME}`, `${lastGoblinSpawnTime}`);
        transaction.hSet(key, `${GAME_FIELD_KILL_COUNT}`, `${killCount}`);
        transaction.hSet(key, `${GAME_FIELD_GOBLIN_KILL_COUNT}`, `${goblinKillCount}`);
        while (true) {
          const result = await transaction.exec();
          if (result) {
            console.log('createGameData successful.');
            break;
          }
        }
      }
    } catch (err) {
      console.error('Error creating game data: ', err);
    } finally {
      await redisClient.unwatch();
    }
  },
  /**
   * 유저의 게임 정보 조회
   * @param {userId} uuid 유저의 UUID
   * @returns 유저의 게임 데이터가 담긴 객체 (key 이름은 redis에 매핑된 이름 사용), 혹은 에러 시 null
   */
  getGameData: async function (uuid) {
    try {
      const key = `${GAME_DATA_PREFIX}${uuid}`;
      const data = await redisClient.hGetAll(key);
      const keys = Object.keys(data);
      if (keys.length === 0) {
        throw new Error('No data exists for the user.');
      }
      for (let i = 0; i < keys.length; i++) {
        data[keys[i]] = +data[keys[i]];
      }

      return data;
    } catch (err) {
      return null;
    }
  },
  /**
   * 범용 함수, Redis 데이터 테이블에 정의된 field 이름과 value 타입에 맞춰서 사용
   * @param {uuid} uuid 유저의 UUID
   * @param {string} fieldName Redis 데이터 테이블에 정의한 필드 이름 (예: "initial_tower")
   * @param {*} value Redis 데이터 테이블에 정의한 value (예: 3)
   */
  patchGameData: async function (uuid, fieldName, value) {
    try {
      const key = `${GAME_DATA_PREFIX}${uuid}`;
      const exists = await redisClient.hExists(key, `${fieldName}`);
      if (exists) {
        await redisClient.hSet(key, `${fieldName}`, JSON.stringify(value));
      }
    } catch (err) {
      console.error('Error patching game data: ', err);
    }
  },
  /**
   * 범용 함수, Redis 데이터 테이블의 field 이름과 value 타입에 맞춘 key-value 객체를 통해 업데이트
   * @param {uuid} uuid 유저의 UUID
   * @param {Object} data Redis 테이블의 field를 key로 가지는 key-value 페어를 담은 객체 (예: {stage_id: 100, gold:50})
   */
  patchGameDataEx: async function (uuid, data, name) {
    console.log('patchGameDataEx from ', name);
    try {
      const key = `${GAME_DATA_PREFIX}${uuid}`;
      let retries = 3; // Number of retries
      let delay = 100; // Initial delay in milliseconds

      while (retries > 0) {
        await redisClient.watch(key);

        // Validate that the game data exists
        const gameData = await this.getGameData(uuid);
        if (!gameData) {
          await redisClient.unwatch();
          throw new Error("User's game data not found or invalid.");
        }

        const transaction = redisClient.multi();

        // Update fields based on the provided 'data' object
        if (data.hasOwnProperty(GAME_FIELD_GOLD)) {
          transaction.hSet(key, GAME_FIELD_GOLD, JSON.stringify(data[GAME_FIELD_GOLD]));
        }
        if (data.hasOwnProperty(GAME_FIELD_STAGE)) {
          transaction.hSet(key, GAME_FIELD_STAGE, JSON.stringify(data[GAME_FIELD_STAGE]));
        }
        if (data.hasOwnProperty(GAME_FIELD_SCORE)) {
          transaction.hSet(key, GAME_FIELD_SCORE, JSON.stringify(data[GAME_FIELD_SCORE]));
        }
        if (data.hasOwnProperty(GAME_FIELD_INITIAL_TOWERS)) {
          transaction.hSet(key, GAME_FIELD_INITIAL_TOWERS, JSON.stringify(data[GAME_FIELD_INITIAL_TOWERS]));
        }
        if (data.hasOwnProperty(GAME_FIELD_BASE_HP)) {
          transaction.hSet(key, GAME_FIELD_BASE_HP, JSON.stringify(data[GAME_FIELD_BASE_HP]));
        }
        if (data.hasOwnProperty(GAME_FIELD_START_TIME)) {
          transaction.hSet(key, GAME_FIELD_START_TIME, JSON.stringify(data[GAME_FIELD_START_TIME]));
        }
        if (data.hasOwnProperty(GAME_FIELD_SPAWN_INTERVAL)) {
          transaction.hSet(key, GAME_FIELD_SPAWN_INTERVAL, JSON.stringify(data[GAME_FIELD_SPAWN_INTERVAL]));
        }
        if (data.hasOwnProperty(GAME_FIELD_GOBLIN_TIME)) {
          transaction.hSet(key, GAME_FIELD_GOBLIN_TIME, JSON.stringify(data[GAME_FIELD_GOBLIN_TIME]));
        }
        if (data.hasOwnProperty(GAME_FIELD_KILL_COUNT)) {
          transaction.hSet(key, GAME_FIELD_KILL_COUNT, JSON.stringify(data[GAME_FIELD_KILL_COUNT]));
        }
        if (data.hasOwnProperty(GAME_FIELD_GOBLIN_KILL_COUNT)) {
          transaction.hSet(key, GAME_FIELD_GOBLIN_KILL_COUNT, JSON.stringify(data[GAME_FIELD_GOBLIN_KILL_COUNT]));
        }

        const result = await transaction.exec();
        if (result) {
          console.log('Patch game data (Ex) successful.');
          break; // Exit loop on successful transaction
        }

        retries--;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }

      if (retries === 0) {
        console.error('Max retries exceeded. Transaction failed.');
      }
    } catch (err) {
      console.error('Error patching game data (Ex): ', err);
    } finally {
      await redisClient.unwatch();
    }
  },
  /* ----- 제대로 동작하는 타워 함수들 ------- */
  patchGameDataTower: async function (uuid, towerData, index) {
    try {
      const key = `${TOWERS_PREFIX}${uuid}:${index}`;
      let retries = 3; // Number of retries
      let delay = 100; // Initial delay in milliseconds

      while (retries > 0) {
        await redisClient.watch(key);

        // Check current value of the tower data
        const currentValue = await redisClient.get(key);
        const parsedValue = JSON.parse(currentValue);

        // If no existing data, set initial tower data
        if (!parsedValue) {
          const transaction = redisClient.multi();
          transaction.set(key, JSON.stringify(towerData));
          const result = await transaction.exec();
          if (result) {
            console.log('Patch game data (Tower) successful.');
            break;
          }
        } else {
          // Update existing tower data
          const transaction = redisClient.multi();
          transaction.set(key, JSON.stringify(towerData));
          const result = await transaction.exec();
          if (result) {
            console.log('Patch game data (Tower) successful.');
            break;
          }
        }

        retries--;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }

      if (retries === 0) {
        console.error('Max retries exceeded. Transaction failed.');
      }
    } catch (err) {
      console.error('Error patching game data (Tower): ', err);
    } finally {
      await redisClient.unwatch();
    }
  },
  deleteGameDataTower: async function (uuid, towerData) {
    try {
      const pattern = `${TOWERS_PREFIX}${uuid}*`;
      const keys = await redisClient.keys(pattern);

      for (let i = 0; i < keys.length; i++) {
        const value = JSON.parse(await redisClient.get(keys[i]));

        if (towerData.x === value.x && towerData.y === value.y) {
          await redisClient.del(keys[i]);
        }
      }
    } catch (err) {
      console.error('Error delete game data (tower): ', err);
    }
  },
  deleteGameDataTowerlist: async function (uuid) {
    try {
      const pattern = `${TOWERS_PREFIX}${uuid}*`;
      const keys = await redisClient.keys(pattern);

      for (let i = 0; i < keys.length; i++) {
        await redisClient.del(keys[i]);
      }
    } catch (err) {
      console.error('Error delete game data (tower list): ', err);
    }
  },
  getGameDataTowerList: async function (uuid) {
    try {
      const pattern = `${TOWERS_PREFIX}${uuid}*`;
      const keys = await redisClient.keys(pattern);

      const values = {};
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i].replace(`${TOWERS_PREFIX}${uuid}`, '');
        values[key] = JSON.parse(await redisClient.get(keys[i]));
      }
      return values;
    } catch (err) {
      console.error('Error get game data (tower list): ', err);
    }
  },
  getGameDataTower: async function (uuid, towerData) {
    try {
      const pattern = `${TOWERS_PREFIX}${uuid}*`;
      const keys = await redisClient.keys(pattern);

      const values = {};
      for (let i = 0; i < keys.length; i++) {
        const value = JSON.parse(await redisClient.get(keys[i]));

        if (towerData.x === value.x && towerData.y === value.y) {
          const key = keys[i].replace(`${TOWERS_PREFIX}${uuid}`, '');
          values[key] = JSON.parse(await redisClient.get(keys[i]));
        }
      }
      return values;
    } catch (err) {
      console.error('Error get game data (tower): ', err);
    }
  },
  /* ------------ */

  /* (보류) rpush 사용할 시 변경될 함수 */
  patchGameDataTowerEx: async function (uuid, towerData) {
    try {
      const key = `${GAME_DATA_PREFIX}${uuid}`;
      let retries = 3; // Number of retries
      let delay = 100; // Initial delay in milliseconds

      while (retries > 0) {
        await redisClient.watch(key);
        const gameData = await this.getGameData(uuid);

        if (!gameData) {
          await redisClient.unwatch();
          throw new Error("User's game data not found.");
        }

        const towers = gameData[GAME_FIELD_TOWER];
        towers.push(towerData);

        const transaction = redisClient.multi();
        transaction.hSet(key, GAME_FIELD_TOWER, JSON.stringify(towers));

        const result = await transaction.exec();
        if (result) {
          console.log('Patch game data (towers Ex) successful.');
          break; // Exit loop on successful transaction
        }

        retries--;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }

      if (retries === 0) {
        console.error('Max retries exceeded. Transaction failed.');
      }
    } catch (err) {
      console.error('Error patching game data (towerEx): ', err);
    } finally {
      await redisClient.unwatch();
    }
  },
  patchGameDataGold: async function (uuid, newGold) {
    try {
      const key = `${GAME_DATA_PREFIX}${uuid}`;
      let retries = 3; // Number of retries
      let delay = 100; // Initial delay in milliseconds

      while (retries > 0) {
        await redisClient.watch(key);

        // Validate that the game data exists
        const gameData = await this.getGameData(uuid);
        if (!gameData) {
          await redisClient.unwatch();
          throw new Error("User's game data not found or invalid.");
        }

        const transaction = redisClient.multi();

        // Update the gold field
        transaction.hSet(key, GAME_FIELD_GOLD, JSON.stringify(newGold));

        const result = await transaction.exec();
        if (result) {
          console.log('Patch game data (Gold) successful.');
          break; // Exit loop on successful transaction
        }

        retries--;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }

      if (retries === 0) {
        console.error('Max retries exceeded. Transaction failed.');
      }
    } catch (err) {
      console.error('Error patching game data (Gold): ', err);
    } finally {
      await redisClient.unwatch();
    }
  },
  patchGameDataStage: async function (uuid, newStage) {
    try {
      const key = `${GAME_DATA_PREFIX}${uuid}`;
      const exists = await redisClient.hExists(key, `${GAME_FIELD_GOLD}`);
      if (exists) {
        await redisClient.hSet(key, `${fieldName}`, JSON.stringify(newGold));
      }
    } catch (err) {
      console.error('Error patching game data: ', err);
    }
  },
  /**
   * 유저의 게임 데이터 삭제
   * @param {uuid} uuid 유저의 UUID
   */
  removeGameData: async function (uuid) {
    try {
      const key = `${GAME_DATA_PREFIX}${uuid}`;
      await redisClient.del(`${GAME_DATA_PREFIX}${uuid}`);
    } catch (err) {
      console.error('Error removing game data: ', err);
    }
  },
};

export const highscoreRedis = {
  /**
   * 주어진 인자를 기반으로 유저의 최고 점수 정보 갱신을 시도합니다.
   * @param {uuid} uuid 유저의 uuid
   * @param {score} score 유저의 점수
   * @return boolean 배열 (0: 개인 최고 기록 갱신 여부, 1: 전체 최고 기록 갱신 여부), 혹은 에러 시 null 반환
   */
  createHighscoreData: async function (uuid, score) {
    try {
      const key = `${HIGHSCORE_PREFIX}all`;
      const highscoreData = await redisClient.sendCommand(['ZREVRANGE', key, '0', '-1', 'WITHSCORES']);
      if (!highscoreData || highscoreData.length === 0) {
        // 최고 점수 내역이 없음
        await redisClient.zAdd(key, [
          {
            score: score,
            value: `${uuid}`,
          },
        ]);
        return [true, true];
      }

      if (score > +highscoreData[1]) {
        // 전체 최고 점수 갱신
        await redisClient.zAdd(key, [
          {
            score: score,
            value: `${uuid}`,
          },
        ]);
        return [true, true];
      }

      const index = highscoreData.findIndex((data) => data === uuid);
      if (index === -1) {
        // 개인 최고 점수 기록이 없음
        await redisClient.zAdd(key, [
          {
            score: score,
            value: `${uuid}`,
          },
        ]);
        return [true, false];
      }

      if (score > highscoreData[index + 1]) {
        // 개인 최고 기록보다 높음
        await redisClient.zAdd(key, [
          {
            score: score,
            value: `${uuid}`,
          },
        ]);
        return [true, false];
      }

      return [false, false];
    } catch (err) {
      // console.error('Error creating highscore data: ', err);
      return null;
    }
  },
  /**
   * 최고 점수 유저의 점수 정보 조회
   * @returns 최고 점수 유저의 uuid와 score를 담은 객체 (예: {uuid:'waf2-2r01-...', score: 1600}), 혹은 에러 시 null 반환
   */
  getHighscoreData: async function () {
    try {
      const key = `${HIGHSCORE_PREFIX}all`;
      const data = await redisClient.sendCommand(['ZREVRANGE', key, '0', '-1', 'WITHSCORES']);

      if (!data || data.length === 0) {
        throw new Error('No highscore data exists');
      }
      return {
        uuid: data[0],
        [GAME_FIELD_SCORE]: +data[1],
      };
    } catch (err) {
      // console.error('Error getting highscore data: ', err);
      return null;
    }
  },
  /**
   * 특정 유저의 최고 점수 기록을 확인합니다.
   * @param {uuid} uuid 유저의 uuid
   * @returns 유저의 highscore 데이터를 담은 객체 (예: {uuid:'waf2-2r01-...', score: 1600}), 혹은 에러 시 null 반환
   */
  getUserHighscoreData: async function (uuid) {
    try {
      const key = `${HIGHSCORE_PREFIX}all`;
      const data = await redisClient.sendCommand(['ZREVRANGE', key, '0', '-1', 'WITHSCORES']);

      if (!data || data.length === 0) {
        throw new Error('No highscore data exists');
      }

      const index = data.findIndex((item) => item === `${uuid}`);
      if (index === -1) {
        throw new Error('No highscore data for the user.');
      }

      return {
        uuid: data[index],
        [GAME_FIELD_SCORE]: +data[index + 1],
      };
    } catch (err) {
      console.error('Error getting highscore data: ', err);
      return null;
    }
  },
};
