// 서버 메모리에 유저의 세션(소켓ID)을 저장
// 이때 유저는 객체 형태로 저장
// { uuid: string; socketId: string };

const users = [];
const monsterSpawnList = {};
const userGoldData = {};

export const createUserGoldData = function (uuid, gold) {
  userGoldData[uuid] = gold;
};

export const addUserGoldData = function (uuid, goldToAdd) {
  userGoldData[uuid] = userGoldData[uuid] + goldToAdd;
};

export const getUserGoldData = function (uuid) {
  return userGoldData[uuid];
};

export const spawnList = {
  addSpawnList: (uuid, timestamp) => {
    if (!monsterSpawnList[uuid]) {
      monsterSpawnList[uuid] = [];
    }
    monsterSpawnList[uuid].push(timestamp);
  },

  popSpawnList: (uuid) => {
    if (monsterSpawnList[uuid] && monsterSpawnList[uuid].length > 0) {
      return monsterSpawnList[uuid].pop();
    }
    return null;
  },

  findSpawnList: (uuid) => {
    return monsterSpawnList[uuid] || null;
  },

  removeMonsterSpawnList: (uuid) => {
    delete monsterSpawnList[uuid];
  },
};

export const addUser = async (user) => {
  users.push(user);
};

// 유저 삭제
export const removeUser = async (uuid) => {
  const index = users.findIndex((user) => user.socketId === uuid);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// 유저 조회
export const findUser = async (uuid) => {
  const index = users.findIndex((user) => user.socketId === uuid);
  if (index != -1) {
    return users[index];
  }
};

// 전체 유저 조회
export const getUsers = async () => {
  return users;
};
