import dotenv from 'dotenv';
dotenv.config();
export default {
  origin: 'https://zgloszenia.jpbserwis-dev.pl',
  accessTokenExpiresIn: 15,
  refreshTokenExpiresIn: 60,
  redisCacheExpiresIn: 60,
  emailFrom: 'contact@codevoweb.com',
};