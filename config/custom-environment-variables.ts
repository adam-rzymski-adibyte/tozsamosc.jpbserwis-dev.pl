export default {
  port: 'PORT',
  sessionSecret: 'SESSION_SECRET',
  clientSecret: 'CLIENT_SECRET',

  MySQLConfig: {
    host: 'DB_HOST',
    port: 'DB_PORT',
    username: 'DB_USER',
    password: 'DB_PASSWORD',
    database: 'DB_DATABASE',
  },

  TokenConfig: {
    accessTokenPrivateKey: 'private_key',
    accessTokenPublicKey: 'public_key',
    refreshTokenPrivateKey: 'refresh_private_key',
    refreshTokenPublicKey: 'refresh_public_key',
  },

  smtp: {
    host: 'EMAIL_HOST',
    pass: 'EMAIL_PASS',
    port: 'EMAIL_PORT',
    user: 'EMAIL_USER',
  },
};