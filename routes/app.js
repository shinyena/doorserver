/*    파일명: app.js
      파일설명: 모바일 앱 서버로 모바일 앱에서의 요청을 처리함.
      개발자: 신예나
      개발일: 2020.12. */

const   http = require('http');                 // http 모듈 불러오기
const   fs = require('fs');                     // file system 모듈 불러오기
const   express = require('express');           // express 모듈 불러오기
const   ejs = require('ejs');                   // ejs 모듈 불러오기
const   url = require('url');                   // url 모듈 불러오기
const   mysql = require('mysql');               // mysql 모듈 불러오기
const   bodyParser = require('body-parser');    // bodyParser 모듈 불러오기
const   router = express.Router();              // express 라우팅
const   log = require("./applog");              // applog.js 불러오기
const   db_config = require('../config/db_config.json')
const   db = mysql.createConnection({
  host: db_config.host,           // DB서버 IP주소
  port: db_config.port,           // DB서버 Port주소
  user: db_config.user,           // DB접속 아이디
  password: db_config.password,   // DB암호
  database: db_config.database,   // DB이름
});

db.connect(); // DB연결

// -----------------------메인화면 출력 함수-----------------------
router.get('/main', (req, res) => {
    // connection 테이블에서 도어락 시리얼 넘버, 도어락 이름, 도어락 활성화 상태, 사용자 종류 조회
    db.query('select d.serialno, d.name, d.active, c.usertype from doorlock as d join connection as c on d.serialno = c.serialno where c.uid=? and c.del=0 and d.del=0 order by d.name',
    [global.uid], (error, result, field) => {
      if (error) {  // DB조회 실패
        log.print('error', global.uid, '메인화면 출력 중 장애발생', 'PrintMain()', 404, error); // error log 생성
      }
      else { // DB조회 성공
        log.print('info', global.uid, '메인화면 출력', 'PrintMain()', 200, result); // info log 생성
        return res.json(result); // 결과를 JSON 포맷으로 전송
      }
    });
});

// -----------------------주사용자 도어락 목록 출력 함수-----------------------
router.get('/admindoor', (req, res) => {
    // doorlock 테이블에서 도어락 시리얼 넘버, 도어락 이름, 도어락 활성화 상태 조회
    db.query('select serialno, name, active from doorlock where uid=? and del=0 order by name',
    [global.uid], (error, result, field) => {
      if (error) { // DB조회 실패
        log.print('error', global.uid, '주사용자 도어락 내역 출력 중 장애발생', 'PrintAdminDoor()', 404, error); // error log 생성
      }
      else { // DB조회 성공
        log.print('info', global.uid, '주사용자 도어락 내역 출력', 'PrintAdminDoor()', 200, result); // info log 생성
        return res.json(result); // 결과를 JSON 포맷으로 전송
      }
    });
});

// -----------------------도어락 사용자 목록 출력 함수 -----------------------
router.get('/adminuser', (req, res) => {
    // dusers 테이블에서 사용자 아이디, 사용자 이름, 사용자 종류 조회
    db.query('select u.uid, u.name, c.usertype from dusers as u join connection as c on u.uid = c.uid where c.serialno=? and c.del=0 and u.del=0 order by c.reg_date',
    [req.query.serialno], (error, result, field) => {
      if (error) { // DB조회 실패
        log.print('error', global.uid, '부사용자 내역 출력 중 장애발생', 'PrintAdminUser()', 404, error); // error log 생성
      }
      else { // DB조회 성공
        log.print('info', global.uid, '부사용자 내역 출력', 'PrintAdminUser()', 200, result); // info log 생성
        return res.json(result); // 결과를 JSON 포맷으로 전송
      }
    });
});

// -----------------------도어락 제어 내역 출력 함수-----------------------
router.get('/list', (req, res) => {
    // dusers 테이블에서 사용자 이름, control_log 테이블에서 제어내용, 제어일시 조회
    db.query('select u.name, l.details, l.use_date from dusers as u join control_log as l on u.uid = l.uid where l.serialno=? order by l.use_date desc',
    [req.query.serialno], (error, result, field) => {
      if (error) { // DB조회 실패
        log.print('error', global.uid, '도어락 제어 내역 출력 중 장애발생', 'PrintControl()', 404, error); // error log 생성
      }
      else {  // DB조회 성공
        log.print('info', global.uid, '도어락 제어 내역 출력', 'PrintControl()', 200, result); // info log 생성
        return res.json(result); // 결과를 JSON 포맷으로 전송
      }
    });
});

// -----------------------도어락 정보 출력 함수-----------------------
router.get('/moddoor', (req, res) => {
    // doorlock 테이블에서 도어락 이름, 도어락 주사용자 아이디 조회
    db.query('select name, uid from doorlock where serialno=?',
    [req.query.serialno], (error, result, field) => {
      if (error) { // DB조회 실패
        log.print('error', global.uid, '도어락 정보 출력 중 장애발생', 'PrintModDoor()', 404, error); // error log 생성
      }
      else { // DB조회 성공
        log.print('info', global.uid, '도어락 정보 출력', 'PrintModDoor()', 200, result); // info log 생성
        return res.json(result[0]); // 결과를 JSON 포맷으로 전송
      }
    });
});

// -----------------------사용자 정보 출력 함수-----------------------
router.get('/moduser', (req, res) => {
    // dusers 테이블에서 사용자 아이디, 사용자 이름, 사용자 전화번호 조회
    db.query('select uid, name, phone from dusers where uid=?',
    [global.uid], (error, result, field) => {
        if (error) { // DB조회 실패
          log.print('error', global.uid, '사용자 정보 출력 중 장애발생', 'PrintModUser()', 404, error); // error log 생성
        }
        else { // DB조회 성공
          log.print('info', global.uid, '사용자 정보 출력', 'PrintModUser()', 200, result); // info log 생성
          return res.json(result[0]); // 결과를 JSON 포맷으로 전송
        }
    });
});

// -----------------------사용자 회원가입 수행 함수-----------------------
router.post('/reguser', (req, res) => {
  // dusers 테이블에 사용자 아이디, 사용자 패스워드, 사용자 이름, 사용자 전화번호 저장
  db.query('insert into dusers (uid, pass, name, phone) values (?,?,?,?)',
  [req.body.uid, req.body.pass, req.body.name, req.body.phone],
  (error, result, fields) => {
    if (error) { // DB저장 실패
      log.print('error', 'anonymous', '이미 존재하는 아이디', 'RegUser()', 460, error); // error log 생성
      res.status(460).end(); // 상태코드(404) 전송
    }
    else { // DB저장 성공
      log.print('info', 'anonymous', '회원가입 성공', 'RedUser()', 200, res.body); // info log 생성
      res.status(200).end(); // 상태코드(200) 전송
    }
  });
});

// -----------------------사용자 로그인 수행 함수-----------------------
router.post('/login', (req, res) => {
  // dusers 테이블에서 사용자 패스워드, 사용자 삭제여부 조회
  db.query('select pass, del from dusers where uid=?', [req.body.uid],
  (error, result, fields) => {
  if (error) { // DB조회 실패
    log.print('error', 'anonymous', '사용자 로그인 중 장애발생', 'Login()', 404, error); // error log 생성
  }
  else if (result.length == 0) { // 조회 내역 없는 경우
    log.print('error', 'anonymous', '사용자 로그인 중 장애발생', 'Login()', 461, req.body.uid + '는 존재하지 않는 아이디입니다.'); // error log 생성
    res.status(461).end(); // 상태코드(461) 전송
  }
  else if (result[0].del == 1) { // 삭제된 회원 여부 확안
    log.print('error', 'anonymous', '사용자 로그인 중 장애발생', 'Login()', 462, req.body.uid + '는 삭제된 회원입니다.'); // error log 생성
    res.status(462).end(); // 상태코드(462) 전송
  }
  else { // 패스워드 일치 여부 확인
    if (req.body.pass == result[0].pass) {
      global.uid = req.body.uid; // global 변수에 사용자 아이디를 저장
      log.print('info', 'anonymous', '사용자 로그인 성공', 'Login()', 200, req.body); // info log 생성
      res.status(200).end(); // 상태코드(200) 전송
    }
    else {
      log.print('error', 'anonymous', '사용자 로그인 중 장애발생', 'Login()', 463, req.body + ' 비밀번호가 일치하지 않습니다.'); // error log 생성
      res.status(463).end(); // 상태코드(463) 전송
    }
  }
  });
});

// -----------------------도어락 기기등록 수행 함수-----------------------
router.post('/regdoor', (req, res) => {
  // dusers 테이블 조회
  db.query('select * from dusers where uid=? and del=0', [req.body.uid],
  (error, results, fields) => {
    if (results.length == 0) { // 사용자 아이디가 존재하지 않는 경우
      log.print('error', global.uid, '도어락 등록 중 장애발생', 'RegDoor()', 461, req.body.uid + '는 존재하지 않는 아이디입니다.'); // error log 생성
      res.status(461).end(); // 상태코드(461) 전송
    }
    else {
      // dusers 테이블에 사용자 아이디, 사용자 패스워드, 사용자 이름, 사용자 전화번호 저장
      db.query('insert into doorlock (serialno, uid, name) values (?,?,?)',
      [req.body.serialno, req.body.uid, req.body.name],
      (error, result, fields) => {
        if (error) { // DB등록 실패
          log.print('error', global.uid, '도어락 등록 중 장애발생', 'RegDoor()', 466, req.body.serialno + '는 이미 존재하는 도어락입니다.'); // error log 생성
          res.status(466).end(); // 상태코드(466) 전송
        }
        else { // DB등록 성공
          log.print('info', '도어락 등록 성공', 'RegDoor()', 200, req.body + ' 신규 도어락을 등록하였습니다.'); // info log 생성
          // connection 테이블에 도어락 시리얼 넘버, 사용자 아이디, 사용자 종류(주사용자) 저장
          db.query('insert into connection (serialno, uid, usertype) values (?,?,?)',
          [req.body.serialno, req.body.uid, 'main'],
          (error, result, fields) => {
            if (error) { // DB등록 실패
              log.print('error', global.uid, '도어락 등록 중 장애발생', 'RegDoor()', 404, error); // error log 생성
             }
            else { // DB등록 성공
              log.print('info', global.uid, '도어락 주사용자 등록 성공', 'RegDoor()', 200, req.body.uid + '를 도어락 주사용자로 등록하였습니다.'); // info log 생성
              res.status(200).end(); // 상태코드(200) 전송
            }
          });
        }
      });
    }
  });
});

// -----------------------도어락 관리(활성화) 수행 함수-----------------------
router.post('/admindoor', (req, res) => {
  // doorlock 테이블에 활성화 상태 수정
  db.query('update doorlock set active=? where serialno=?',
  [req.body.active, req.body.serialno], (error, result, fields) => {
    if (error) { // DB수정 실패
      log.print('error', global.uid, '도어락 관리(활성화/비활성화) 중 장애발생', 'AdminDoor()', 404, error); // error log 생성
    }
    else { // DB수정 성공
      log.print('info', global.uid, '도어락 관리(활성화/비활성화) 성공', 'AdminDoor()', 200, req.body); // info log 생성
    }
  });
});

// -----------------------도어락 관리(부사용자 추가) 수행 함수-----------------------
router.post('/adminuser', (req, res) => {
  // dusers 테이블 조회
  db.query('select * from dusers where uid=? and del=0',
  [req.body.uid], (error, results, fields) => {
      if (results.length == 0) { // 조회 내역 없는 경우
        log.print('error', global.uid, '사용자 관리(부사용자 추가) 중 장애발생', 'AddAdminUser()', 461, req.body.uid + '는 존재하지 않는 아이디입니다.'); // error log 생성
        res.status(461).end(); // 상태코드(461) 전송
      }
      else {
        // connection 테이블 조회
        db.query('select * from connection where serialno=? and uid=? and del=0',
        [req.body.serialno, req.body.uid], (error, results, fields) => {
          if (results.length != 0) { // 조회 내역 있는 경우
            log.print('error', global.uid, '사용자 관리(부사용자 추가) 중 장애발생', 'AddAdminUser()', 460, req.body.uid + '는 이미 존재하는 부사용자입니다.'); // info log 생성
            res.status(460).end(); // 상태코드(460) 전송
          }
          else { // 조회 내역 없는 경우
            // connection 테이블에 도어락 시리얼 넘버, 사용자 아이디, 사용자 종류(부사용자) 등록
            db.query('insert into connection (serialno, uid, usertype) values (?,?,?)',
            [req.body.serialno, req.body.uid, 'sub'],
            (error, result, fields) => {
              if (error) { // DB등록 실패
                log.print('error', global.uid, '사용자 관리(부사용자 추가) 중 장애발생', 'AddAdminUser()', 404, error); // error log 생성
              }
              else { // DB등록 성공
                log.print('info', global.uid, '사용자 관리(부사용자 추가) 성공', 'AddAdminUser()', 200, req.body); // info log 생성
                res.status(200).end(); // 상태코드(200) 전송
              }
            });
          } //else
        });
      } //else
  }); //db.query()
}); //router.post()

// -----------------------도어락 제어 내역 등록 함수-----------------------
router.post('/control', (req, res) => {
  // control_log 테이블에 도어락 시리얼 넘버, 사용자 아이디, 제어내용 등록
  db.query('insert into control_log (serialno, uid, details) values (?,?,?)',
  [req.body.serialno, global.uid, req.body.details],
  (error, result, fields) => {
    if (error) { // DB등록 실패
      log.print('error', global.uid, '도어락 제어내역 등록 중 장애발생', 'Control()', 404, error); // error log 생성
    }
    else { // DB등록 성공
      log.print('info', global.uid, '도어락 제어내역 등록 성공', 'Control()', 200, req.body); // info log 생성
    }
  });
});

// -----------------------도어락 관리(부사용자 삭제) 수행 함수-----------------------
router.put('/adminuser', (req, res) => {
  // connection 테이블에 도어락에 연결된 사용자 삭제 여부 수정
  db.query('update connection set del=1 where uid=? and serialno=?',
  [req.body.uid, req.body.serialno], (error, result, fields) => {
    if (error) { // db수정 실패
      log.print('error', global.uid, '사용자 관리(부사용자 삭제) 중 장애발생', 'DeleteAdminUser()', 404, error); // error log 생성
    }
    else { // db수정 성공
      log.print('info', global.uid, '사용자 관리(부사용자 삭제) 성공', 'DeleteAdminUser()', 200, req.body); // info log 생성
      res.status(200).end(); // 상태코드(200) 전송
    }
  });
});

// -----------------------사용자 정보변경 수행 함수-----------------------
router.put('/moduser', (req, res) => {
  // dusers 테이블에 사용자 패스워드, 사용자 이름, 사용자 전화번호 수정
  db.query('update dusers set pass=?, name=?, phone=? where uid=?',
  [req.body.pass, req.body.name, req.body.phone, req.body.uid],
  (error, result, fields) => {
  if (error) { // db수정 실패
    log.print('error', global.uid, '사용자 정보변경 중 장애발생', 'ModUser()', 404, error); // error log 생성
  }
  else { // db수정 성공
    log.print('info', global.uid, '사용자 정보변경 성공', 'ModUser()', 200, req.body); // info log 생성
    res.status(200).end(); // 상태코드(200) 전송
  }
  });
});

// -----------------------도어락 정보변경 수행 함수-----------------------
router.put('/moddoor', (req, res) => {
  // dusers 테이블 조회
  db.query('select * from dusers where uid=? and del=0', [req.body.uid],
  (error, result, field) => {
    if (result.length == 0) { // 조회 내역 없는 경우
      log.print('error', global.uid, '도어락 정보변경 중 장애발생', 'ModDoor()', 461, req.body.uid + '는 존재하지 않는 아이디입니다.'); // error log 생성
      res.status(461).end(); // 상태코드(461) 전송
    }
    else { // 조회 내역 있는 경우
      // doorlock 테이블에 도어락 이름, 도어락 주사용자 수정
      db.query('update doorlock set name=?, uid=? where serialno=?',
      [req.body.name, req.body.uid, req.body.serialno], (error, result, fields) => {
        if (error) { // db수정 실패
          log.print('error', global.uid, '도어락 정보변경 중 장애발생', 'ModDoor()', 460, error); // error log 생성
        }
        else { // db수정 성공
          log.print('info', global.uid, '도어락 정보를 변경 성공', 'ModDoor()', 200, '{' + req.body.serialno + ',' + req.body.name + ',' + req.body.uid + '}'); // info log 생성
          // connection 테이블에 사용자 종류(부사용자) 수정
          db.query('update connection set usertype="sub" where serialno=? and uid=?',
          [req.body.serialno, req.body.lastuid], (error, result, fields) => {
            if (error) { // db수정 실패
              log.print('error', global.uid, '도어락 정보변경 중 장애발생', 'ModDoor()', 460, error); // error log 생성
            }
            else { // db수정 성공
              log.print('info', global.uid, '도어락 부사용자 변경 성공', 'ModDoor()', 200, req.body.lastuid + '를 부사용자로 변경하였습니다.'); // info log 생성
              // connection 테이블 조회
              db.query('select * from connection where serialno=? and uid=? and del=0',
              [req.body.serialno, req.body.uid], (error, result, fields) => {
                if (result.length == 0) { // 조회 내역 없는 경우
                  // connection 테이블에 도어락 시리얼 넘버, 사용자 아이디, 사용자 종류(주사용자) 등록
                  db.query('insert into connection (serialno, uid, usertype) values (?,?,?)',
                  [req.body.serialno, req.body.uid, 'main'], (error, result, fields) => {
                    if (error) { // db등록 실패
                      log.print('error', global.uid, '도어락 정보변경 중 장애발생', 'ModDoor()', 460, error); // error log 생성
                    }
                    else { // db등록 성공
                      log.print('info', global.uid, '도어락 주사용자 등록 성공', 'ModDoor()', 200, req.body.uid + '를 주사용자로 등록하였습니다.');  // info log 생성
                      res.status(200).end(); // 상태코드(200) 전송
                    }
                  });
                }
                else { // 조회 내역 있는 경우
                  // connection 테이블에 사용자 종류(주사용자) 수정
                  db.query('update connection set usertype="main" where serialno=? and uid=?',
                  [req.body.serialno, req.body.uid], (error, result, fields) => {
                    if (error) { // db수정 실패
                      log.print('error', global.uid, '도어락 정보변경 중 장애발생', 'ModDoor()', 460, error); // error log 생성
                    }
                    else { // db수정 성공
                      log.print('info', global.uid, '도어락 주사용자 변경 성공', 'ModDoor()', 200, req.body.uid + '를 주사용자로 변경하였습니다.');  // info log 생성
                      res.status(200).end(); // 상태코드(200) 전송
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

// -----------------------사용자 탈퇴 수행 함수-----------------------
router.put('/deleteuser', (req, res) => {
  // doorlock 태이블 조회
  db.query('select * from doorlock where uid=? and del=0',
  [req.body.uid], (error, result, fields) => {
    if (result.length != 0) { // 조회 내역 있는 경우
      log.print('error', global.uid, '사용자 탈퇴 중 장애발생', 'DeleteUser()', 465, '관리중인 도어락이 있어 탈퇴할 수 없습니다.'); // error log 생성
      res.status(465).end();  // 상태코드(465) 전송
    }
    else { // 조회 내역 없는 경우
      // dusers 테이블에서 사용자 삭제 여부 수정
      db.query('update dusers set del=1 where uid=?',
      [req.body.uid],(error, result, fields) => {
        if (error) { // DB수정 실패
          log.print('error', global.uid, '사용자 탈퇴 중 장애발생', 'DeleteUser()', 404, error); // error log 생성
        }
        else { // DB수정 성공
          log.print('info', global.uid, '사용자 탈퇴 성공', 'DeleteUser()', 200, req.body); // info log 생성
          res.status(200).end(); // 상태코드(200) 전송
        }
      });
    }
  });
});

// -----------------------도어락 삭제 수행 함수-----------------------
router.put('/deletedoor', (req, res) => {
  // doorlock 테이블에서 사용자 삭제 여부 수정
  db.query('update doorlock set del=1 where serialno=?',
  [req.body.serialno],(error, result, fields) => {
    if (error) { // DB수정 실패
      log.print('error', global.uid, '도어락 삭제 중 장애발생', 'DeleteDoor()', 404, error); // error log 생성
    }
    else { // DB수정 성공
      log.print('info', global.uid, '도어락 삭제 성공', 'DeleteDoor()', 200, req.body); // info log 생성
      res.status(200).end(); // 상태코드(200) 전송
    }
  });
});

module.exports = router; // 모듈 추출
