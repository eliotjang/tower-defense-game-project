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
   * @param {userId} uuid 유저의 UUID
   * @param {number} gold 유저 보유 gold
   * @param {number} stageId 현재 스테이지 ID
   * @param {number} score 유저 점수
   * @param {number} numOfInitialTowers 초기 타워 개수
   * @param {number} baseHp 기지의 HP
   */
  createGameData: async function (uuid, gold, stageId, score, numOfInitialTowers, baseHp) {
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
   * @returns 유저의 게임 데이터가 담긴 객체, 혹은 에러 시 null
   */
  getGameData: async function (uuid) {
    try {
      const key = `${GAME_DATA_PREFIX}${uuid}`;
      const data = await redisClient.hGetAll(key);
      if (Object.keys(data).length === 0) {
        throw new Error('No data exists for the user.');
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
  patchGameDataEx: async function (uuid, data) {
    try {
      const key = `${GAME_DATA_PREFIX}${uuid}`;
      const properties = Object.keys(data);
      for (let i = 0; i < properties.length; i++) {
        const exists = await redisClient.hExists(key, `${properties[i]}`);
        if (exists) {
          await redisClient.hSet(key, `${properties[i]}`, JSON.stringify(data[properties[i]]));
        }
      }
    } catch (err) {
      console.error('Error patching game data: ', err);
    }
  },
  /* ----- 제대로 동작하는 타워 함수들 ------- */
  patchGameDataTower: async function (uuid, towerData, index) {
    try {
      const key = `${TOWERS_PREFIX}${uuid}${index}`;
      await redisClient.set(key, JSON.stringify(towerData));
    } catch (err) {
      console.error('Error patching game data (tower test): ', err);
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
      console.error('Error patching game data (tower test): ', err);
    }
  },
  /* ------------ */

  /* (보류) rpush 사용할 시 변경될 함수 */
  patchGameDataTowerEx: async function (uuid, towerData) {
    try {
      const key = `${GAME_DATA_PREFIX}${uuid}`;
      while (true) {
        await redisClient.watch(key);

        const gameData = await this.getGameData(uuid);
        if (!gameData) {
          throw new Error("User's game data not found.");
        }

        const towers = gameData[GAME_FIELD_TOWER];
        towers.push(towerData);
        const transaction = redisClient.multi();
        transaction.hSet(key, GAME_FIELD_TOWER, JSON.stringify(towers));
        // while (true) {
        const result = await transaction.exec();
        if (result) {
          console.log('Patch game data (towers Ex) successful.');
          break;
        }
        // }
      }

      // const transaction = redisClient.multi().hVals(key);
      // const gameData = await transaction.hVals(key);
      // if (!gameData) {
      //   throw new Error('temp');
      // }
      // const towerArr = gameData[GAME_FIELD_TOWER];
      // console.log('타워 목록: ', towerArr);
      // towerArr.push(towerData);

      // transaction.hSet(key, GAME_FIELD_TOWER, JSON.stringify(towerArr));

      // await transaction.exec();
    } catch (err) {
      console.error('Error patching game data (towerEx): ', err);
    } finally {
      await redisClient.unwatch();
    }
  },
  patchGameDataGold: async function (uuid, newGold) {
    try {
      const key = `${GAME_DATA_PREFIX}${uuid}`;
      const exists = await redisClient.hExists(key, `${GAME_FIELD_GOLD}`);
      if (exists) {
        await redisClient.hSet(key, `${GAME_FIELD_GOLD}`, JSON.stringify(newGold));
      }
    } catch (err) {
      console.error('Error patching game data: ', err);
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
      await redisClient.del(`${USER_PREFIX}${uuid}`);
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
      console.error('Error creating highscore data: ', err);
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
      console.error('Error getting highscore data: ', err);
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
