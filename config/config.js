var config = module.exports = {};

// pwd salt
config.pwd_salt = "@!*em()ma_=";

// sms
config.captchaExpireTime = 1800;

// redis
config.redisOptions = {
    host: 'localhost',
    port: 6379,
    logErrors: true
};

// mysql
config.db = {
    database: 'art_carrier',
    username: 'chslab',
    password: 'Admin@chslab9',
    option: {
        dialect: 'mysql',
        host: '192.168.31.3',
        //host: 'localhost',
        port: 3306,
        pool: {
            max: 5,
            min: 0,
            idle: 20000,
            acquire: 40000
        },
        timezone: '+08:00',
        operatorsAliases: false, // 警告提示
        logging: console.log // 打印sql
    },
};
