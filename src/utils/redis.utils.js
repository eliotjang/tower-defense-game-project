import redisClient from '../init/redis.js';

const USER_PREFIX = 'user:';
const USER_FIELD_USER_ID = 'user_id';
const USER_FIELD_PASSWORD = 'password';
const GAME_DATA_PREFIX = 'game:';
const GAME_FIELD_GOLD = 'user_gold';
const GAME_FIELD_STAGE = 'stage_id';
const GAME_FIELD_SCORE = 'score';
const GAME_FIELD_TOWER = 'tower_coordinates';
const GAME_FIELD_INITIAL_TOWER = 'initial_tower';
const GAME_FIELD_BASE_HP = 'base_hp';
const HIGHSCORE_PREFIX = 'highscore:';

export const userRedis = {
  /**
   * 유저 데이터 생성
   * @param {uuid} userId 유저의 UUID
   * @param {string} hashedPassword bcrypt로 해시 처리 된 비밀번호 문자열
   */
  createUserData: async function (userId, hashedPassword) {
    try {
      const key = `${USER_PREFIX}${userId}`;
      const data = await redisClient.hVals(key);
      if (data && data.length > 0) {
        throw new Error('User data with the given userId already exists.');
      }
      await redisClient.hSet(key, `${USER_FIELD_PASSWORD}`, JSON.stringify(hashedPassword));
    } catch (err) {
      console.error('Error creating user data: ', err);
    }
  },
  /**
   * 유저 ID를 이용하여 해당 유저의 데이터를 조회
   * @param {uuid} userId 유저의 UUID
   * @returns 유저 데이터의 field 이름들을 key로 가지는 key-value가 담긴 객체, 혹은 에러 시 null
   */
  getUserData: async function (userId) {
    try {
      const key = `${USER_PREFIX}${userId}`;
      console.log('KEY: ', key);
      const data = await redisClient.hVals(key);
      console.log('DATA: ', data);
      if (!data || data.length === 0) {
        throw new Error(`User data doesn't exists.`);
      }
      return { [USER_FIELD_USER_ID]: userId, [USER_FIELD_PASSWORD]: data[0] };
    } catch (err) {
      console.error('Error getting user data: ', err);
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
          [USER_FIELD_USER_ID]: key,
          [USER_FIELD_PASSWORD]: data[0],
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
   * @param {uuid} userId 유저의 UUID
   * @param {number} gold 유저 보유 gold
   * @param {number} stageId 현재 스테이지 ID
   * @param {number} score 유저 점수
   * @param {Array<{x:number, y:number, tower_id:number}>} towerCoordinates 타워 좌표, {x:x좌표, y:y좌표, tower_id:타워ID} 형식의 객체들을 담은 배열
   * @param {number} numOfInitialTowers 초기 타워 개수
   * @param {number} baseHp 기지의 HP
   */
  createGameData: async function (userId, gold, stageId, score, towerCoordinates, numOfInitialTowers, baseHp) {
    try {
      const key = `${GAME_DATA_PREFIX}${userId}`;
      const data = await redisClient.hVals(key);
      if (!data || data.length === 0) {
        await redisClient.hSet(key, `${GAME_FIELD_GOLD}`, `${gold}`);
        await redisClient.hSet(key, `${GAME_FIELD_STAGE}`, `${stageId}`);
        await redisClient.hSet(key, `${GAME_FIELD_SCORE}`, `${score}`);
        await redisClient.hSet(key, `${GAME_FIELD_TOWER}`, JSON.stringify(towerCoordinates));
        await redisClient.hSet(key, `${GAME_FIELD_INITIAL_TOWER}`, `${numOfInitialTowers}`);
        await redisClient.hSet(key, `${GAME_FIELD_BASE_HP}`, `${baseHp}`);
      }
    } catch (err) {
      console.error('Error creating game data: ', err);
    }
  },
  /**
   * 유저의 게임 정보 조회
   * @param {uuid} userId 유저의 UUID
   * @returns 유저의 게임 데이터가 담긴 객체, 혹은 에러 시 null
   */
  getGameData: async function (userId) {
    try {
      const key = `${GAME_DATA_PREFIX}${userId}`;
      const data = await redisClient.hVals(key);
      console.log('GameData: ', data);
      if (data && data.length > 0) {
        return {
          [USER_FIELD_USER_ID]: userId,
          [GAME_FIELD_GOLD]: +data[0],
          [GAME_FIELD_STAGE]: JSON.parse(data[1]),
          [GAME_FIELD_SCORE]: +data[2],
          [GAME_FIELD_TOWER]: JSON.parse(data[3]),
          [GAME_FIELD_INITIAL_TOWER]: +data[4],
          [GAME_FIELD_BASE_HP]: +data[5],
        };
      }
    } catch (err) {
      console.error('Error getting game data: ', err);
      return null;
    }
  },
  /**
   * 범용 함수, Redis 데이터 테이블에 정의된 field 이름과 value 타입에 맞춰서 사용
   * @param {uuid} userId 유저의 UUID
   * @param {string} fieldName Redis 데이터 테이블에 정의한 필드 이름 (예: "initial_tower")
   * @param {*} value Redis 데이터 테이블에 정의한 value (예: 3)
   */
  patchGameData: async function (userId, fieldName, value) {
    try {
      const key = `${GAME_DATA_PREFIX}${userId}`;
      const exists = await redisClient.hExists(key, `${fieldName}`);
      if (exists) {
        await redisClient.hSet(key, `${fieldName}`, JSON.stringify(value));
      }
    } catch (err) {
      console.error('Error patching game data: ', err);
    }
  },
  patchGameDataGold: async function (userId, newGold) {
    try {
      const key = `${GAME_DATA_PREFIX}${userId}`;
      const exists = await redisClient.hExists(key, `${GAME_FIELD_GOLD}`);
      if (exists) {
        await redisClient.hSet(key, `${fieldName}`, JSON.stringify(newGold));
      }
    } catch (err) {
      console.error('Error patching game data: ', err);
    }
  },
  patchGameDataStage: async function (userId, newStage) {
    try {
      const key = `${GAME_DATA_PREFIX}${userId}`;
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
   * @param {uuid} userId 유저의 UUID
   */
  removeGameData: async function (userId) {
    try {
      const key = `${GAME_DATA_PREFIX}${userId}`;
      await redisClient.del(`${USER_PREFIX}${userId}`);
    } catch (err) {
      console.error('Error removing game data: ', err);
    }
  },
};