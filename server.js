// npm install express
// npm install cookie-parser
// npm install express-session
// npm install ejs
// npm install winston
// npm install method-override

const   http = require('http');
const   express = require('express');
const   cookieParser = require('cookie-parser');
const   session = require('express-session');
const   bodyParser = require('body-parser');
const   createError = require('http-errors');
const   path = require('path');
const   app = express();
//const   FileStore = require('session-file-store')(session);

const   PORT = 8080;

const   appserver = require('./routes/app');
const   webserver = require('./routes/web');
const   applog    = require('./routes/applog');
const   weblog    = require('./routes/weblog');

app.use(express.static(path.join(__dirname, 'public')));   // public설정
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({ key: 'sid',
                  secret: 'secret key',     // 세션id 암호화할때 사용
                  resave: false,            // 접속할때마다 id부여금지
                  saveUninitialized: true,  // 세션id사용전에는 발급금지
                  //store: new FileStore()
                }));

app.use('/app', appserver);
app.use('/web', webserver);

app.listen(PORT, function () {
  console.log('서버실행');
});
