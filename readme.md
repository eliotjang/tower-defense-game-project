# WebSocket Real-Time Game Server

### 타워 디펜스 게임 배포 링크

### 패킷 구조 설계

### 데이터 테이블

### 구현 내용

### 스킬 스택

![bcrypt](https://img.shields.io/badge/bcrypt-5.1.1-blue?logo=npm)
![cors](https://img.shields.io/badge/cors-2.8.5-blue?logo=npm)
![dotenv](https://img.shields.io/badge/dotenv-16.4.5-blue?logo=npm)
![express](https://img.shields.io/badge/express-4.19.2-blue?logo=express)
![jsonwebtoken](https://img.shields.io/badge/jsonwebtoken-9.0.2-blue?logo=npm)
![redis](https://img.shields.io/badge/redis-4.6.14-blue?logo=redis)
![socket.io](https://img.shields.io/badge/socket.io-4.7.5-blue?logo=socketdotio)
![uuid](https://img.shields.io/badge/uuid-10.0.0-blue?logo=npm)
![nodemon](https://img.shields.io/badge/nodemon-3.1.3-blue?logo=nodemon)
![prettier](https://img.shields.io/badge/prettier-3.3.2-blue?logo=prettier)

### 폴더 구조

```plaintext
tower-defense-game-project
│
├── node_modules/
│
├── .env
├── .gitignore
├── .prettierrc
├── package-lock.json
├── package.json
├── readme.md
│
├── assets/
│   ├── game.json
│   ├── monster.json
│   ├── monster_unlock.json
│   ├── stage.json
│   └── tower.json
│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   │
│   ├── assets/
│   │   ├── game.json
│   │   ├── monster.json
│   │   ├── monster_unlock.json
│   │   ├── stage.json
│   │   └── tower.json
│   │
│   ├── images/
│   │   ├── base.png
│   │   ├── bg.webp
│   │   ├── favicon.ico
│   │   ├── monster1.png
│   │   ├── monster2.png
│   │   ├── monster3.png
│   │   ├── monster4.png
│   │   ├── monster5.png
│   │   ├── monster6.png
│   │   ├── path.png
│   │   ├── tower.png
│   │   ├── tower1.png
│   │   ├── tower2.png
│   │   ├── tower3.png
│   │   ├── tower4.png
│   │   └── tower5.png
│   │
│   └── src/
│       ├── base.js
│       ├── Constants.js
│       ├── game.js
│       ├── monster.js
│       └── tower.js
│
└── src/
    ├── app.js
    ├── constants.js
    │
    ├── handlers/
    │   ├── error.handler.js
    │   ├── game.handler.js
    │   ├── handlerMapping.js
    │   ├── helper.js
    │   ├── monster.handler.js
    │   ├── register.handler.js
    │   ├── stage.handler.js
    │   └── tower.handler.js
    │
    ├── init/
    │   ├── assets.js
    │   ├── redis.js
    │   └── socket.js
    │
    ├── models/
    │   └── user.model.js
    │
    ├── routers/
    │   └── accounts.router.js
    │
    └── utils/
        ├── configs.js
        ├── redis.utils.js
        │
        └── errors/
            └── classes/
                └── custom.error.js
```

### 게임 진행

#### 회원가입 및 로그인
- 회원가입 후 로그인을 한다.
- 로그인 후 JWT 토큰을 발급받아 게임 시작 버튼을 누르면 게임이 즉시 시작된다.

### 규칙

#### 몬스터 출현 및 기지 방어
- 왼쪽에서 몬스터가 정해진 시간마다 출현하며, 오른쪽에 있는 기지에 도달하여 기지의 체력이 0이 되면 게임오버가 된다.
- 기지의 체력은 기지의 상단에 숫자로 표기되어 있으며 초기 체력은 200이다.

#### 점수 및 스테이지 변화
- 몬스터 1마리를 잡을 시 100점이 추가된다.
- 누적 점수를 2000점 달성할 때마다 스테이지가 변경된다.
- 스테이지는 총 7개가 존재한다.
- 스테이지가 올라갈수록 몬스터의 체력, 속도, 기지에 주는 피해가 증가한다.
- 스테이지가 올라가면 1000원을 받는다.

#### 초기 설정
- 처음 시작 시 기본 소지금은 3000원이다.

### 타워

#### 타워 생성
- 게임을 시작하면 3개의 타워가 랜덤 위치에서 생성된다.

#### 타워의 역할
- 타워는 몬스터가 가까이 오면 자동으로 공격한다.

#### 타워 구매
- 보유한 골드를 소비해 새로운 타워를 구매할 수 있다.
- 타워는 총 5개의 단계를 가지며 높은 단계의 타워일수록 강한 공격력을 가진다.
- 타워 구매 시 원하는 단계의 타워를 선택해 구매할 수 있다.
- 타워의 구매 가격은 원하는 타워의 단계 * 1000원이 든다.

#### 타워 업그레이드
- 우측 상단의 타워 업그레이드 버튼을 누르고 업그레이드를 원하는 타워를 누르면 1000원 차감 후 타워가 업그레이드된다.

#### 타워 환불 및 이동
- 게임 인터페이스 오른쪽 상단에 있는 버튼을 통해 타워 구매, 타워 환불, 타워 이동을 할 수 있다.

### 몬스터 및 타워의 상세 정보

#### 몬스터
- 몬스터는 총 5종류가 있으며 스테이지가 올라갈 때마다 강해진다.
- 랜덤하게 보물고블린이 출현하는데, 보물고블린은 일반 몬스터보다 높은 체력을 가지고 있지만, 처치 시 1000골드를 준다.

### 소켓 연결 및 JWT 검증

#### 소켓 연결 시 JWT 검증
- 소켓 연결 시 JWT 토큰을 검증한다.
- 검증에 실패하면 검증 실패 메시지와 함께 이전 페이지로 이동한다.

### 몬스터 처치 및 검증

#### 몬스터 처치 검증
- 몬스터를 잡으면 서버로 몬스터의 ID를 보낸다.
- 서버는 `assets/stage_unlock` 테이블을 참고해 해당 몬스터가 현재 출현 가능한지 여부를 검증한다.
- 검증을 통과한 경우 유저의 점수를 데이터베이스에 저장한다.
- 유효하지 않은 몬스터 ID일 경우 오류를 반환한다.
- 동일한 몬스터 ID의 중복 전송 시 오류를 반환한다.

### 게임 종료 검증

#### 플레이타임 계산 및 검증
- 게임이 끝나면 서버 기준 게임 시작 시간과 끝난 시간을 사용해 플레이타임을 계산한다.
- 플레이타임 / 몬스터 스폰 주기 = 최대 몬스터 스폰 개수.
- 만약 최대 몬스터 스폰 개수보다 유저가 처치한 몬스터가 더 많다면 검증 실패를 반환한다.

### 이벤트 검증

#### 공통 패킷 검증
- 모든 이벤트에는 공통 패킷을 통해 요청 패킷의 클라이언트 버전이 일치하지 않거나, 서버에 정의되지 않은 이벤트 핸들러를 사용하면 오류가 발생한다.

### 몬스터 스폰 검증

#### 몬스터 스폰 시간 검증
- 보물고블린 및 일반 몬스터가 스폰될 때 클라이언트에서 스폰 시간과 이벤트를 서버로 전달한다.
- 서버는 몬스터 스폰 시간 사이의 시간을 측정하여, 몬스터 스폰 주기보다 1초 이상 짧을 경우 올바르지 않은 생성으로 판단해 오류를 반환한다.

### 스테이지 이동 검증

#### 스테이지 이동 요청 및 검증
- 클라이언트의 점수 기준으로 다음 스테이지로 이동할 수 있는 점수를 얻었을 때, 서버로 스테이지 이동 요청을 보낸다.
- 서버는 데이터베이스의 유저 점수를 기반으로 스테이지 이동이 가능한지 검증한다.
- 검증에 성공하면 클라이언트로 다음 스테이지의 ID와 다음 목표 점수를 반환한다.

### 타워 관련 검증

#### 타워 구매 검증
- 클라이언트가 타워 구매 버튼을 누르면 서버로 이벤트를 전송한다.
- 서버는 유저 데이터베이스에서 소지금이 충분한지 검증한다.

#### 타워 업그레이드 검증
- 클라이언트가 타워 업그레이드 버튼을 누르면 서버로 이벤트를 전송한다.
- 서버는 유저 데이터베이스에서 소지금이 충분한지 검증한다.

#### 타워 환불 검증
- 클라이언트가 타워 환불 버튼을 누르면 서버로 이벤트를 전송한다.
- 서버는 유저 데이터베이스에서 타워의 개수가 1개 이상인지 검증한다.

