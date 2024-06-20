## 프로젝트명:타워 디펜스 게임 프로젝트
![image](https://github.com/eliotjang/tower-defense-game-project/assets/49065386/12c5333d-ee4c-4f55-996f-002b881694e5)

- ### 프로젝트 제작 기간 : 2024.6.17.(월) ~ 2024.6.20.(목)
- ### 프로젝트 발표 대본 :
- ### 프로젝트 포트폴리오 :
- ### 프로젝트 시연 영상 :
    🎥 [YouTube](https://youtu.be/qURxWc9FWu0)

## 와이어프레임

![Untitled](https://github.com/eliotjang/tower-defense-game-project/assets/49065386/0928c553-00c7-495e-acfd-2a497ee5b80d)

## 프로젝트 회의록/ GitHub Rules / 코드 컨벤션 


📄 [타워 디펜스 게임 프로젝트 기획 및 설계](https://eliotjang.notion.site/2ac80fb1c240424fad064ddc8e101f53)

:octocat: [Github Rules](https://teamsparta.notion.site/Github-Rules-8d16ade1fe354cf0b5152b1f60e916b6?pvs=25)

📁 [Code Convention](https://teamsparta.notion.site/Code-Convention-43e5b060f8dd4a4590a083768393ff21?pvs=25)

## 패킷 구조 설계
⚙️ [타워 디펜스 게임 프로젝트 패킷 구조 설계](https://eliotjang.notion.site/212e9e10bfdb41bfbfe93662bb5ff3c8?pvs=25)
## Redis 데이터 & 데이터 테이블
📊 [Redis 데이터 & 데이터 테이블](https://eliotjang.notion.site/Redis-acfa00b6d8b1466ea124f76bc33ec525)
## 게임 진행 및 검증
☑️ [Tower Defense Game Project 상세 문서](https://docs.google.com/document/d/1Kfs5g0g0XMkyDwW2GVRBIsG0SxAwl0vEWPsYPVKqRkc/edit?usp=sharing)

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


