const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const cors = require('cors');
const db = require('./models/db');
const checkOpenid = require('./middleware/check_openid');

// logger
global.logger = log4js.getLogger();
logger.level = 'info';

// trust proxy
app.set('trust proxy', true);
app.set('trust proxy', 'loopback');

// cors
app.use(cors());

// session
app.use(cookieParser('secretSign#chslab_cookie_^&*^%%'));
app.use(session({
    store: new RedisStore(config.redisOptions),
    secret: 'chslab_secret_#@%^^',
    saveUninitialized: false,
    resave: false,
    cookie: {
        httpOnly: false,
        maxAge: 7200000,
    } // (2小时)2 * 60 * 60 * 1000 毫秒
}));

// 解析body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// check wechat openid
app.use(checkOpenid);

// Ward 18-3-16, 加载路由
const readFile = rootPath => {
    const allFile = fs.readdirSync(rootPath);
    for (let file of allFile) {
        const path = `${rootPath}/${file}`;
        if (file.indexOf('.') !== -1) { // 不是文件夹
            app.use(require(path));
        } else { // 文件夹, 递归读取一次
            readFile(path);
        }
    }
};
readFile(`${__dirname}/routers`);

// 静态路由
app.use(express.static('./client/build'));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname,'./client/build/index.html'));
});

// 错误处理
app.use(function (err, req, res, next) {
    logger.error('error: ', err);
    var code = err.code || 500;
    res.send({
        result: 'err',
        message: err.message,
        code: code
    });
});

// 同步数据库
db.sequelize.sync({
    logging: false, // 打印sql语句
    alter: false, // 修改表中字段
}).then(() => {
    // 创建关联关系
    Object.keys(db).forEach(modelName => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });
    app.listen(3001, function () {
        console.log('server listening on port 3001')
    });
});
