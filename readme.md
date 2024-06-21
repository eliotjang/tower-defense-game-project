## 타워 디펜스 게임 프로젝트

![image](https://github.com/eliotjang/tower-defense-game-project/blob/dev/public/images/gamePage.png)

프로젝트 제작 기간 : 2024.6.17.(월) ~ 2024.6.20.(목)

### 타워 디펜스 게임 프로젝트 기획 및 설계

- 📄 [프로젝트 기획 및 설계 회의록](https://eliotjang.notion.site/2ac80fb1c240424fad064ddc8e101f53)
- :octocat: [깃허브 규칙](https://teamsparta.notion.site/Github-Rules-8d16ade1fe354cf0b5152b1f60e916b6?pvs=25)
- 📁 [코드 컨벤션](https://teamsparta.notion.site/Code-Convention-43e5b060f8dd4a4590a083768393ff21?pvs=25)
- [프로젝트 포트폴리오](https://docs.google.com/presentation/d/16CnsQqkdcBKKpK8ztdzdH4NmM0T4rZ3PMLtDoXfXEaU/edit#slide=id.g2e3233e2a6e_0_78)
- [프로젝트 시연영상](https://youtu.be/4jTNeelL2GY?si=tcemE0CcomDpFtTT)

### 프로젝트 패킷 명세서

![Untitled (1)](https://github.com/eliotjang/tower-defense-game-project/assets/49065386/042f0ea0-5f09-4da6-97f1-f18c95ffa2cb)

- 📝 [프로젝트 패킷 명세서 링크](https://www.notion.so/2fed892d7d3a4fde9e6423cd13afd820)

### Redis 데이터 & 데이터 테이블

- 📊 [Redis 데이터 & 데이터 테이블 링크](https://eliotjang.notion.site/Redis-acfa00b6d8b1466ea124f76bc33ec525)

### 게임 진행 및 검증

- ☑️ [게임 진행 및 검증 문서 링크](https://docs.google.com/document/d/1Kfs5g0g0XMkyDwW2GVRBIsG0SxAwl0vEWPsYPVKqRkc/edit?usp=sharing)

### 와이어프레임

![Untitled](https://github.com/eliotjang/tower-defense-game-project/assets/49065386/0928c553-00c7-495e-acfd-2a497ee5b80d)

- [Figma 와이어프레임 링크](https://www.figma.com/design/0AaF6o6BYZ0O7Kf2Gti03h/%ED%83%80%EC%9B%8C-%EB%94%94%ED%8E%9C%EC%8A%A4-%EA%B2%8C%EC%9E%84-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EC%99%80%EC%9D%B4%EC%96%B4%ED%94%84%EB%A0%88%EC%9E%84?node-id=0-1&t=stKLOtPYeCqIhrWz-0)

### 에셋 스프라이트

![](https://github.com/eliotjang/tower-defense-game-project/blob/dev/public/images/images.png)

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

### 프로젝트 제작 인원

- [장성원](https://github.com/eliotjang/), [안홍걸](https://github.com/4cozm/), [김동균](https://github.com/donkim1212/)
