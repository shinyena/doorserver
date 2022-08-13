/*    파일명: weblog.js
      파일설명: 관리자 웹 서버 실행 중 로그 내역을 저장하도록 처리함.
      개발자: 신예나
      개발일: 2020.12. */

const { createLogger, format, transports } = require('winston');   // winston 모듈 불러오기
const { combine, timestamp, label, prettyPrint } = format;

var now = (new Date()).toLocaleString(); // 현재 시간

const logger = createLogger({
  level: 'info',
  format: combine(label({label:'출입관제 웹서버'}), prettyPrint() ),
  transports: [
    new transports.Console(),
    new transports.File({filename: 'log/webserver.log' }) // log 저장 위치
  ]
});

exports.print = (level, modulename, who, code, message) => {
	    logger.log(level, {now, who, modulename, code, message});
}
