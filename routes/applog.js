/*    파일명: applog.js
      파일설명: 모바일 앱 서버 실행 중 로그 내역을 저장하도록 처리함.
      개발자: 신예나
      개발일: 2020.12. */

const { createLogger, format, transports, config} = require('winston');  // winston 모듈 불러오기
const { combine, timestamp, label, prettyPrint } = format;
const   mysql = require('mysql');                                 // mysql 모듈 불러오기

var now = (new Date()).toLocaleString(); // 현재 시간

const logger = createLogger({
  level: 'info',
  format: combine(label({label:'출입관제 앱서버'}), prettyPrint() ),
  transports: [
    new transports.Console(),
    new transports.File({filename: 'log/appserver.log' }) // log 저장 위치
  ]
});

const   db_config = require('../config/db_config.json')
const   db = mysql.createConnection({
    host: db_config.host,           // DB서버 IP주소
    port: db_config.port,           // DB서버 Port주소
    user: db_config.user,           // DB접속 아이디
    password: db_config.password,   // DB암호
    database: db_config.database,   // DB이름
});
db.connect(); // DB연결

exports.print = (level, who, title, modulename, code, message) => {
	    logger.log(level, {now, who, modulename, code, title, message});
      if (level == "error") { //error log일 경우 error_app 테이블에 저장
        db.query('insert into errorapp_log (error_date, uid, module, code, title, message) values (?,?,?,?,?,?)',
        [now, who, modulename, code, title, message], (error, result, fields) => {
          if (error) { // DB등록 실패
            console.log(error); }
        });
      }
}
