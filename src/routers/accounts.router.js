import express from 'express';
import redisClient from '../init/redis.js';
import bcrypt, { hash } from 'bcrypt';
import configs from '../utils/configs.js';
import jwt from 'jsonwebtoken';
import { userRedis } from '../utils/redis.utils.js';
import { v4 as uuidv4 } from 'uuid';
const USER_KEY_PREFIX = 'user:';
const accountRouter = express.Router();

const signUp = async (req, res, next) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id) {
      return res.status(400).json({ errorMessage: 'user_id 입력해주세요.' });
    }
    if (!password) {
      return res.status(400).json({ errorMessage: 'password를 입력해주세요.' });
    }

    const validatePassword = (password) => {
      //SQL 인젝션 방지용 최소한의 유효성 검사
      if (password == null || password === undefined) {
        return false;
      }
      const regex = /^(?=\S+$).{8,}$/;
      return regex.test(password);
    };
    if (!validatePassword(password)) {
      return res.status(400).json({ errorMessage: '비밀번호 유효성 검사에 실패했습니다' });
    }
    const isExistsUser = async (user_id) => {
      const key = USER_KEY_PREFIX + user_id;
      const user = await redisClient.hGet(key,'uuid');
      return user == null ? false : true;
    };

    const exists = await isExistsUser(user_id);
    //user_id 중복검사
    if (exists) {
      return res.status(409).json({ errorMessage: '이미 존재하는 아이디 입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    //해시처리
    console.log(hashedPassword);

    const UUID = uuidv4();
    await userRedis.createUserData(UUID, user_id, hashedPassword);

    return res.status(200).json({ message: '회원가입 완료' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ errorMessage: err.message });
  }
};
const signIn = async (req, res) => {
  try {
    const jwtSecret = configs.jwtSecret;
    const { user_id, password } = req.body;

    // Redis에서 사용자 정보 조회
    const key = USER_KEY_PREFIX + user_id;

    const hashedPassword = await redisClient.hGet(key, 'password');

    if (!hashedPassword) {
      return res.status(409).json({ errorMessage: '존재하지 않는 아이디 입니다.' });
    }
    const sanitizedPassword = hashedPassword.replace(/"/g, '');
    //hGet 메서드로 받아온 hashedPassword에서 ("",'')를 제거한 값을 저장
    const passwordMatch = await bcrypt.compare(password, sanitizedPassword);
    if (!passwordMatch) {
      return res.status(401).json({ errorMessage: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign({ user_id }, jwtSecret, {
      expiresIn: '24h',
    });
    res.status(200).json({ message: '로그인 성공 인증토큰 발행 완료', token: token });
  } catch (error) {
    console.log('에러', error);
    res.status(500).json({ errorMessage: error.message });
  }
};

accountRouter.post('/signIn', signIn);
accountRouter.post('/signUP', signUp);

export default accountRouter;
