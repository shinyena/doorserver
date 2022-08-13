/*    파일명: web.js
      파일설명: 관리자 웹페이지 서버로 웹페이지에서의 요청을 처리함.
      개발자: 신예나
      개발일: 2020.12. */

const   fs = require('fs');                           // file system 모듈 불러오기
const   express = require('express');                 // express 모듈 불러오기
const   ejs = require('ejs');                         // ejs 모듈 불러오기
const   url = require('url');                         // url 모듈 불러오기
const   mysql = require('mysql');                     // mysql 모듈 불러오기
const   bodyParser = require('body-parser');          // bodyParser 모듈 불러오기
const   session = require('express-session');         // session 모듈 불러오기
const   methodOverride = require('method-override');  // methodOverride 모듈 불러오기
const   router = express.Router();                    // express 라우팅
const   log = require('./weblog');                    // weblog.js 불러오기
const   LINES = 5; //한 페이지당 열람 개수 정의

const   db_config = require('../config/db_config.json')
const   db = mysql.createConnection({
  host: db_config.host,           // DB서버 IP주소
  port: db_config.port,           // DB서버 Port주소
  user: db_config.user,           // DB접속 아이디
  password: db_config.password,   // DB암호
  database: db_config.database,   // DB이름
});
db.connect(); // DB연결

// methodOverride 허용
router.use(bodyParser.urlencoded({ extended: false }));
router.use(methodOverride('_method'));

// --------------------------------로그인 화면 출력 함수--------------------------------
router.get('/login', (req, res) => {
  htmlstream = fs.readFileSync(__dirname + '/../views/header.ejs','utf8');               // header 불러오기
  htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/navbar.ejs','utf8');  // navbar 불러오기
  htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/login.ejs','utf8');   // 로그인 페이지 불러오기
  htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/footer.ejs','utf8');  // footer 불러오기

  res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});

  if (req.session.auth) { // 로그인 되어있는 경우
      res.end(ejs.render(htmlstream,  { 'title': '로그인',
                                        'regurl': '/web/mod',
                                        'reglabel': '관리자님',
                                        'logurl': '/web/logout',
                                        'loglabel': '로그아웃' }));
  }
  else { // 로그인 되어있지 않은 경우
    res.end(ejs.render(htmlstream,  { 'title': '로그인',
                                      'regurl': '',
                                      'reglabel': '',
                                      'logurl': '',
                                      'loglabel': '' }));
  }
  log.print('info', '로그인 화면 출력', 'PrintLogin()', 200, ''); // info log 생성
});

// --------------------------------로그인 수행 함수--------------------------------
router.post('/login', (req, res) => {
  // dusers 테이블에서 관리자 패스워드 조회
  db.query('select pass from dusers where uid="admin"',
  (error, results, fields) => {
    if (error) { // DB조회 실패
      log.print('error', '로그인 수행 중 장애발생', 'HandleLogin()', 404, error); // error log 생성
    }
    else if (req.body.uid == 'admin' && req.body.pass == results[0].pass) { // 패스워드 일치하는 경우
      req.session.auth = 1; // 로그인 여부
      log.print('info', '로그인 성공', 'HandleLogin()', 200, res.body); // info log 생성
      res.send('<script>alert("로그인에 성공하였습니다."); location.href="/web/adminuser"</script>'); //성공 메시지 전송
    }
    else { // 패스워드 일치하지 않는 경우
      log.print('error', '로그인 수행 중 장애발생', 'HandleLogin()', 463, '아이디나 패스워드가 일치하지 않습니다.'); // error log 생성
      res.send('<script>alert("아이디나 패스워드가 일치하지 않습니다."); location.href="/web/login"</script>');  //실패 메시지 전송
    }
  });
});

// --------------------------------로그아웃 수행 함수--------------------------------
router.get('/logout', (req, res) => {
  req.session.destroy(); // 세션 제거
  log.print('info', '로그아웃 수행', 'HandleLogout()', 200, '로그아웃 되었습니다.'); // info log 생성
  res.send('<script>alert("로그아웃 되었습니다."); location.href="/web/login"</script>'); //성공 메시지 전송
});

// --------------------------------관리자 정보 변경 화면 출력 함수--------------------------------
router.get('/mod', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    htmlstream = fs.readFileSync(__dirname + '/../views/header.ejs','utf8');               // header 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/navbar.ejs','utf8');  // navbar 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/mod.ejs','utf8');     // 관리자 정보 변경 화면 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/footer.ejs','utf8');  // footer 불러오기

    res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});

    res.end(ejs.render(htmlstream,  { 'title': '사용자 관리',
                                      'regurl': '/web/mod',
                                      'reglabel': '관리자님',
                                      'logurl': '/web/logout',
                                      'loglabel': '로그아웃' }));
    log.print('info', '관리자 정보 변경 화면 출력', 'PrintModUser()', 200, ''); // info log 생성
  }
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'PrintModUser()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  }
});

// --------------------------------관리자 정보 변경 함수--------------------------------
router.post('/mod', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    // dusers 테이블에서 관리자 패스워드 수정
    db.query('update dusers set pass=? where uid="admin"',
    [req.body.pass1], (error, results, fields) => {
      if (error) { // DB수정 실패
        log.print('error', '관리자 정보변경 중 장애발생', 'ModUser()', 404, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
      }
      else { // DB수정 성공
        log.print('info', '관리자 정보변경 성공', 'ModUser()', 200, req.body); // info log 생성
        res.send('<script>alert("패스워드가 변경되었습니다."); location.href="/web/adminuser"</script>'); //성공 메시지 전송 및 사용자 관리 화면(메인화면)으로 이동
      }
    });
  }
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'ModUser()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  }
});

// --------------------------------사용자 관리 화면 출력 함수--------------------------------
router.get('/adminuser', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    htmlstream = fs.readFileSync(__dirname + '/../views/header.ejs','utf8');                   // header 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/navbar.ejs','utf8');      // navbar 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/adminuser.ejs','utf8');   // 사용자 관리 화면 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/footer.ejs','utf8');      // footer 불러오기

    res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});

    let page = (req.query.page) ? req.query.page : '1'; // 현재 페이지를 받아옴 만약 없다면 1로 설정
    let nextrow = (page-1) * LINES;                     // 화면에 출력할 다음번째 레코드 번호를 계산

    db.query('select * from dusers where del=0 order by reg_date desc', (error, results, fields) => {
      totalPages = Math.ceil(results.length/LINES);     // 전체 페이지 수
    });

    // dusers 테이블에서 조회
    db.query('select * from dusers where del=0 order by reg_date desc limit ?,?',
    [nextrow, LINES], (error, results, fields) => {
      if (error) { // DB조회 실패
        log.print('error', '사용자 관리 화면 출력 중 장애발생', 'PrintAdminUser()', 404, error); // error log 생성
      }
      else { // DB조회 성공
        log.print('info', '사용자 관리 화면 출력', 'PrintAdminUser()', 200, results); // info log 생성
        res.end(ejs.render(htmlstream,  { 'title': '사용자 관리',
                                          'regurl': '/web/mod',
                                          'reglabel': '관리자님',
                                          'logurl': '/web/logout',
                                          'loglabel': '로그아웃',
                                          userdata : results,
                                          page: page,
                                          totalPages: totalPages }));
      }
    });

  }
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'PrintAdminUser()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  }
});

// --------------------------------사용자 관리 중 사용자 삭제 기능 수행 함수--------------------------------
router.delete('/adminuser', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    if (Array.isArray(req.body.delete)) { // delete 값이 여러개인 경우
      req.body.delete.forEach(function (item, index) {
        // doorlock 테이블에서 주사용자인 도어락 있는지 조회
        db.query('select * from doorlock where uid=?', [item],
        (error, results, fields) => {
          if (results.length != 0) { // 조회 내역 있는 경우
            log.print('error', '사용자 관리(삭제) 중 장애발생', 'DeleteUser()', 465, item + '는 관리중인 도어락이 있어 탈퇴할 수 없습니다.'); // error log 생성
          }
          else { // 조회 내역 없는 경우
            // dusers 테이블에서 사용자 삭제 여부 수정
            db.query('update dusers set del=1 where uid=?', [item],
            (error, results, fields) => {
              if (error) { // DB수정 실패
                log.print('error', '사용자 관리(삭제) 중 장애발생', 'DeleteAdminUser()', 404, error); // error log 생성
              }
              else { // DB수정 성공
                log.print('info', '사용자 관리(삭제) 성공', 'DeleteAdminUser()', 200, item + '가 삭제되었습니다.'); // info log 생성
              }
            });
          }
        });
      });
      res.send('<script>alert("사용자가 삭제되었습니다");location.href="/web/adminuser" </script>'); // 성공 메시지 전송 및 사용자 관리 화면으로 이동
    }
    else { // delete 값이 1개인 경우
      // doorlock 테이블에서 주사용자인 도어락 있는지 조회
      db.query('select * from doorlock where uid=? and del=0',
      [req.body.delete], (error, result, fields) => {
          if (result.length != 0) { // 조회 내역 있는 경우
            log.print('error', '사용자 관리(삭제) 중 장애발생', 'DeleteUser()', 465, '관리중인 도어락이 있어 탈퇴할 수 없습니다.'); // error log 생성
            res.send('<script>alert("관리중인 도어락이 있어 탈퇴할 수 없습니다.");location.href="/web/adminuser" </script>'); // 실패 메시지 전송 및 사용자 관리 화면으로 이동
          } //if (result.length != 0)
          else { // 조회 내역 없는 경우
            // dusers 테이블에서 사용자 삭제 여부 수정
            db.query('update dusers set del=1 where uid=?', [req.body.delete],
            (error, results, fields) => {
              if (error) { // DB수정 실패
                log.print('error', '사용자 관리(삭제) 중 장애발생', 'DeleteAdminUser()', 404, error); // error log 생성
                res.send('<script>alert("알 수 없는 오류가 발생하였습니다.");location.href="/web/adminuser" </script>'); // 실패 메시지 전송 및 사용자 관리 화면으로 이동
              } //if (error)
              else { // DB수정 성공
                log.print('info', '사용자 관리(삭제) 성공', 'DeleteAdminUser()', 200, req.body.delete + '가 삭제되었습니다.'); // info log 생성
                res.send('<script>alert("' + req.body.delete + '사용자가 삭제되었습니다");location.href="/web/adminuser" </script>'); // 성공 메시지 전송 및 사용자 관리 화면으로 이동
              } //else
            }); //db.query()
          } //else
      }); //db.query
    } //else
  } //if (req.session.auth)
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'DeleteAdminUser()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  } //else
}); //router.delete()

// --------------------------------도어락 관리 화면 출력 함수--------------------------------
router.get('/admindoor', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    htmlstream = fs.readFileSync(__dirname + '/../views/header.ejs','utf8');                   // header 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/navbar.ejs','utf8');      // navbar 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/admindoor.ejs','utf8');   // 도어락 관리 화면 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/footer.ejs','utf8');      // footer 불러오기

    res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});

    let page = (req.query.page) ? req.query.page : '1'; // 현재 페이지를 받아옴 만약 없다면 1로 설정
    let nextrow = (page-1) * LINES;                     // 화면에 출력할 다음번째 레코드 번호를 계산

    db.query('select * from doorlock where del=0 order by reg_date desc',
    (error, results, fields) => {
      totalPages = Math.ceil(results.length/LINES);     // 전체 페이지 수
    });

    // doorlock 테이블에서 조회
    db.query('select * from doorlock where del=0 order by reg_date desc limit ?,?',
    [nextrow, LINES], (error, results, fields) => {
      if (error) { // DB조회 실패
        log.print('error', '도어락 관리 화면 출력 중 장애발생', 'PrintAdminDoor()', 404, error); // error log 생성
      }
      else { // DB조회 성공
        log.print('info', '도어락 관리 화면 출력', 'PrintAdminDoor()', 200, results); // info log 생성
        res.end(ejs.render(htmlstream,  { 'title': '도어락 관리',
                                          'regurl': '/web/mod',
                                          'reglabel': '관리자님',
                                          'logurl': '/web/logout',
                                          'loglabel': '로그아웃',
                                          doordata : results,
                                          page: page,
                                          totalPages: totalPages }));
      }
    });
  }
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'PrintAdminDoor()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  }
});

// --------------------------------도어락 관리 중 도어락 삭제 기능 수행 함수--------------------------------
router.delete('/admindoor', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    if (Array.isArray(req.body.delete)) { // delete 값이 여러개인 경우
      for (i=0; i<req.body.delete.length; i++) {
        // doorlock 테이블에서 사용자 삭제 여부 수정
        db.query('update doorlock set del=1 where serialno=?', [req.body.delete[i]],
        (error, results, fields) => {
          if (error) { // DB수정 실패
            log.print('error', '도어락 관리(삭제) 중 장애발생', 'DeleteAdminDoor()', 404, error); // error log 생성
          }
        });
      }
    }
    else { // delete 값이 1개인 경우
      // doorlock 테이블에서 사용자 삭제 여부 수정
      db.query('update doorlock set del=1 where serialno=?', [req.body.delete],
      (error, results, fields) => {
        if (error) { // DB수정 실패
          log.print('error', '도어락 관리(삭제) 중 장애발생', 'DeleteAdminDoor()', 404, error); // error log 생성
        }
      });
    }
    log.print('info', '도어락 관리(삭제) 성공', 'DeleteAdminDoor()', 200, req.body); // info log 생성
    res.send('<script>alert("도어락이 삭제되었습니다");location.href="/web/admindoor" </script>'); // 성공 메시지 전송 및 도어락 관리 화면으로 이동
  }
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'DeleteAdminDoor()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  }
});

// --------------------------------도어락 관리 중 도어락 활성화 기능 수행 함수--------------------------------
router.get('/activedoor', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    // doorlock 테이블에서 활성화 값 1로 수정
    db.query('update doorlock set active=1 where serialno=?',
    [req.query.serialno], (error, results, fields) => {
      if (error) { // DB수정 실패
        log.print('error', '도어락 관리(활성화) 중 장애발생', 'HadnleActiveDoor()', 404, error); // error log 생성
      }
      else { // DB수정 성공
        log.print('info', '도어락 관리(활성화) 성공', 'HadnleActiveDoor()', 200, req.query); // info log 생성
        res.send('<script>alert("활성화 상태로 변경되었습니다."); location.href="/web/admindoor"</script>'); // 성공 메시지 전송 및 도어락 관리 화면으로 이동
      }
    });
  }
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'HadnleActiveDoor()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  }
});

// --------------------------------도어락 관리 중 도어락 비활성화 기능 수행 함수--------------------------------
router.get('/inactivedoor', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    // doorlock 테이블에서 활성화 값 0으로 수정
    db.query('update doorlock set active=0 where serialno=?',
    [req.query.serialno], (error, results, fields) => {
      if (error) { // DB수정 실패
        log.print('error', '도어락 관리(비활성화) 중 장애발생', 'HadnleInactiveDoor()', 404, error); // error log 생성
      }
      else { // DB수정 성공
        log.print('info', '도어락 관리(비활성화) 성공', 'HadnleInactiveDoor()', 200, req.query); // info log 생성
        res.send('<script>alert("비활성화 상태로 변경되었습니다."); location.href="/web/admindoor"</script>'); // 성공 메시지 전송 및 도어락 관리 화면으로 이동
      }
    });
  }
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'HadnleInactiveDoor()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  }
});

// --------------------------------도어락 사용자 화면 출력 함수--------------------------------
router.get('/dooruser', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    htmlstream = fs.readFileSync(__dirname + '/../views/header.ejs','utf8');                 // header 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/navbar.ejs','utf8');    // navbar 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/dooruser.ejs','utf8');  // 도어락 사용자 화면 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/footer.ejs','utf8');    // footer 불러오기

    res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});

    let page = (req.query.page) ? req.query.page : '1'; // 현재 페이지를 받아옴 만약 없다면 1로 설정
    let nextrow = (page-1) * LINES;                     // 화면에 출력할 다음번째 레코드 번호를 계산

    db.query('select * from connection where serialno=? and del=0 order by reg_date desc',
    [req.query.serialno], (error, results, fields) => {
      totalPages = Math.ceil(results.length/LINES);     // 전체 페이지 수
    });

    // dusers 테이블에서 사용자 아이디, 사용자 이름, connection 테이블에서 사용자 종류, 도어락 사용자 등록일시 조회
    db.query('select u.uid, u.name, c.usertype, c.reg_date from dusers as u join connection as c on u.uid = c.uid where c.serialno=? and c.del=0 order by c.reg_date limit ?,?',
    [req.query.serialno, nextrow, LINES], (error, results, fields) => {
      if (error) { // DB조회 실패
        log.print('error', '도어락 사용자 화면 출력 중 장애발생', 'PrintDoorUser()', 404, error); // error log 생성
      }
      else { // DB조회 성공
        log.print('info', '도어락 사용자 화면 출력', 'PrintDoorUser()', 200, results); // info log 생성
        res.end(ejs.render(htmlstream,  { 'title': '도어락 사용자 관리',
                                          'regurl': '/web/mod',
                                          'reglabel': '관리자님',
                                          'logurl': '/web/logout',
                                          'loglabel': '로그아웃',
                                          userdata : results,
                                          page: page,
                                          totalPages: totalPages,
                                          serialno: req.query.serialno}));
      }
    });
  }
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'PrintDoorUser()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  }
});

// --------------------------------도어락 사용자 추가 기능 수행 함수--------------------------------
router.post('/dooruser', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    // dusers 테이블에서 사용자 아이디 조회
    db.query('select * from dusers where uid=? and del=0',
    [req.body.uid], (error, result, fields) => {
      if (result.length == 0) { // 조회 내역 없는 경우
        log.print('error', '도어락 사용자 추가 중 장애발생', 'AddDoorUser()', 460, req.body.uid + '는 존재하지 않는 사용자입니다.'); // error log 생성
        res.send('<script>alert("존재하지 않는 사용자입니다."); location.href="/web/dooruser/?serialno=' + req.body.serialno + '"</script>'); // 실패 메시지 전송 및 도어락 사용자 화면으로 이동
      }
      else { // 조회 내역 있는 경우
        // connection 테이블에서 도어락 사용자 조회
        db.query('select * from connection where serialno=? and uid=? and del=0',
        [req.body.serialno, req.body.uid], (error, results, fields) => {
          if (results.length != 0) { // 조회 내역 있는 경우
            log.print('error', '도어락 사용자 추가 중 장애발생', 'AddDoorUser()', 460, req.body.uid + '는 이미 존재하는 사용자입니다.'); // error log 생성
            res.send('<script>alert("이미 존재하는 사용자 입니다."); location.href="/web/dooruser/?serialno=' + req.body.serialno + '"</script>'); // 실패 메시지 전송 및 도어락 사용자 화면으로 이동
          }
          else { // 조회 내역 없는 경우
            // connection 테이블에 도어락 시리얼 넘버, 사용자 아이디, 사용자 종류 등록
            db.query('insert into connection (serialno, uid, usertype) values (?,?,?)',
            [req.body.serialno, req.body.uid, 'sub'], (error, results, fields) => {
              if (error) { // DB등록 실패
                log.print('error', '도어락 사용자 추가 중 장애발생', 'AddDoorUser()', 404, error); // error log 생성
                res.send('<script>alert("알 수 없는 오류가 발생하였습니다."); location.href="/web/dooruser/?serialno=' + req.body.serialno + '"</script>'); // 실패 메시지 전송 및 도어락 사용자 화면으로 이동
              }
              else { // DB등록 성공
                log.print('info', '도어락 사용자 추가 성공', 'AddDoorUser()', 200, req.body); // info log 생성
                res.send('<script>alert("등록이 완료되었습니다."); location.href="/web/dooruser/?serialno=' + req.body.serialno + '"</script>'); // 성공 메시지 전송 및 도어락 사용자 화면으로 이동
              }
            });
          }
        });
      }
    });
  }
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'AddDoorUser()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  }
});

// --------------------------------도어락 사용자 삭제 기능 수행 함수--------------------------------
router.delete('/dooruser', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    if (Array.isArray(req.body.delete)) { // delete 값이 여러개인 경우
      for (i=0; i<req.body.delete.length; i++) {
        // connection 테이블에서 도어락 사용자 삭제 여부 수정
        db.query('update connection set del=1 where uid=?', [req.body.delete[i]],
        (error, results, fields) => {
          if (error) { // DB수정 실패
            log.print('error', '도어락 사용자 삭제 중 장애발생', 'DeleteDoorUser()', 404, error); // error log 생성
          }
        });
      }
    }
    else { // delete 값이 1개인 경우
      db.query('update connection set del=1 where uid=?', [req.body.delete],
      (error, results, fields) => {
        if (error) { // DB수정 실패
          log.print('error', '도어락 사용자 삭제 중 장애발생', 'DeleteDoorUser()', 404, error); // error log 생성
        }
      });
    }
    log.print('info', '도어락 사용자 삭제 성공', 'DeleteDoorUser()', 200, req.body); // info log 생성
    res.send('<script>alert("도어락 사용자가 삭제되었습니다."); location.href="/web/dooruser/?serialno=' + req.body.serialno + '"</script>'); // 성공 메시지 전송 및 도어락 사용자 화면으로 이동
  }
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'DeleteDoorUser()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  }
});

// --------------------------------도어락 제어내역 열람 화면 출력 함수--------------------------------
router.get('/controllog', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    let LINES = 10; //한 페이지당 열람 개수 정의

    htmlstream = fs.readFileSync(__dirname + '/../views/header.ejs','utf8');                   // header 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/navbar.ejs','utf8');      // navbar 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/controllog.ejs','utf8');  // 도어락 제어내역 열람 화면 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/footer.ejs','utf8');      // footer 불러오기

    res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});

    let page = (req.query.page) ? req.query.page : '1'; // 현재 페이지를 받아옴 만약 없다면 1로 설정
    let nextrow = (page-1) * LINES;                     // 화면에 출력할 다음번째 레코드 번호를 계산

    db.query('select * from control_log order by use_date desc',
    (error, results, fields) => {
      totalPages = Math.ceil(results.length/LINES);     // 전체 페이지 수
    });

    // control_log 테이블 조회
    db.query('select * from control_log order by use_date desc limit ?,?',
    [nextrow, LINES], (error, results, fields) => {
      if (error) { // DB조회 실패
        log.print('error', '도어락 제어내역 열람 화면 출력 중 장애발생', 'PrintControlLog()', 404, error); // error log 생성
      }
      else { // DB조회 성공
        log.print('info', '도어락 제어내역 열람 화면 출력', 'PrintControlLog()', 200, results); // info log 생성
        res.end(ejs.render(htmlstream,  { 'title': '제어 모니터링',
                                          'regurl': '/web/mod',
                                          'reglabel': '관리자님',
                                          'logurl': '/web/logout',
                                          'loglabel': '로그아웃',
                                          logdata : results,
                                          page: page,
                                          totalPages: totalPages }));
      }
    });
  }
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'PrintControlLog()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  }
});

// --------------------------------모바일 앱 장애내역 열람 화면 출력 함수--------------------------------
router.get('/errorapp', (req, res) => {
  if (req.session.auth) { // 로그인 되어있는 경우
    let LINES = 10; //한 페이지당 열람 개수 정의

    htmlstream = fs.readFileSync(__dirname + '/../views/header.ejs','utf8');                 // header 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/navbar.ejs','utf8');    // navbar 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/errorapp.ejs','utf8');  // 장애내역 열람 화면 불러오기
    htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/footer.ejs','utf8');    // footer 불러오기

    res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});

    let page = (req.query.page) ? req.query.page : '1'; // 현재 페이지를 받아옴 만약 없다면 1로 설정
    let nextrow = (page-1) * LINES;                     // 화면에 출력할 다음번째 레코드 번호를 계산

    db.query('select * from errorapp_log order by error_date desc',
    (error, results, fields) => {
      totalPages = Math.ceil(results.length/LINES);     // 전체 페이지 수
    });

    // errorapp_log 테이블 조회
    db.query('select * from errorapp_log order by error_date desc limit ?,?',
    [nextrow, LINES], (error, results, fields) => {
      if (error) { // DB조회 실패
        log.print('error', '모바일 앱 장애 내역 출력 중 장애발생', 'PrintErrorAppLog()', 404, error); // error log 생성
      }
      else { // DB조회 성공
        log.print('info', '모바일 앱 장애 내역 출력 ', 'PrintErrorAppLog()', 200, results); // info log 생성
        res.end(ejs.render(htmlstream,  { 'title': '제어 모니터링',
                                          'regurl': '/web/mod',
                                          'reglabel': '관리자님',
                                          'logurl': '/web/logout',
                                          'loglabel': '로그아웃',
                                          logdata : results,
                                          page: page,
                                          totalPages: totalPages }));
      }
    });
  }
  else { // 로그인 되어있지 않은 경우
    log.print('error', '권한없는 접근', 'PrintErrorAppLog()', 464, '로그인을 하지 않아 해당기능을 이용할 수 없습니다.'); // error log 생성
    res.send('<script>alert("로그인 후에 접근이 가능합니다."); location.href="/web/login"</script>'); // 실패 메시지 전송 및 로그인 화면으로 이동
  }
});

module.exports = router; // 모듈 추출
