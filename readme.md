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

### 몬스터
- 몬스터는 총 5종류가 있으며 스테이지가 올라갈 때마다 강해진다.
- 랜덤하게 보물고블린이 출현하는데, 보물고블린은 일반 몬스터보다 높은 체력을 가지고 있지만, 처치 시 1000골드를 준다.

#### 게임 오버 이후
- 최고 기록을 갱신하게 되면 서버에 최고 기록이 저장된다.
- 새로고침을 통해 게임을 다시 시작할 수 있다.
