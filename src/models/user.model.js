// 서버 메모리에 유저의 세션(소켓ID)을 저장
// 이때 유저는 객체 형태로 저장
// { uuid: string; socketId: string };

const users = [];

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

// 킬로그를 기반으로 검증하는 코드는 아직 사용하지 않는 관계로 주석처리 함
// const userData = [];
// const getUser = (socketId) => {
//   return userData.find((user) => user.socketId === socketId);
// };

// const initializeUser = (socketId) => {
//   //킬로그를 저장하는 인메모리 저장공간
//   let user = getUser(socketId);
//   if (!user) {
//     user = {
//       socketId: socketId,
//       killLog: [],
//     };
//     userData.push(user);
//     console.log(`유저 정보가 생성되었습니다 socketId: ${socketId}`);
//   }
//   return user;
// };