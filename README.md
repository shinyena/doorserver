# 출입관제 서버
- [출입관제 모바일 앱](https://github.com/shinyena/doorapp) 서버: [app.js](routes/app.js)
- [관리자 모니터링 웹](views) 서버: [web.js](routes/web.js)

## api 목록
- 출입관제 모바일 앱 api

|Method|api|Description|
|---|---|---|
|GET|app/main|도어락 목록 출력|
| |app/list|도어락 제어 내역 출력|
| |app/moduser|사용자 정보 출력|
| |app/moddoor|도어락 정보 출력|
| |app/admindoor|관리 도어락 목록 출력|
| |app/adminuser|관리 도어락 사용자 목록 출력|
|POST|app/login|사용자 로그인 수행|
| |app/reguser|사용자 가입 수행|
| |app/regdoor|도어락 등록 수행|
| |app/control|도어락 제어 수행|
| |app/admindoor|도어락 관리 수행|
| |app/adminuser|도어락 사용자 관리 수행|
|PUT|app/moduser|사용자 정보 변경|
| |app/moddoor|도어락 정보 변경|
| |app/adminuser|도어락 사용자 삭제|
| |app/deleteuser|사용자 탈퇴|
| |app/deletedoor|도어락 삭제|


- 관리자 모니터링 웹 api

|Method|api|Description|
|---|---|---|
|GET|web/login|로그인 화면 출력|
| |web/logout|로그아웃 수행|
| |web/mod|관리자 정보변경 화면 출력|
| |web/adminuser|사용자 관리 화면 출력|
| |web/admindoor|도어락 관리 화면 출력|
| |web/activedoor|도어락 활성화 수행|
| |web/inactivedoor|도어락 비활성화 수행|
| |web/dooruser|도어락 사용자 화면 출력|
| |web/controllog|도어락 제어내역 열람 화면 출력|
| |web/errorapp|모바일 앱 장애내역 열람 화면 출력|
|POST|web/login|로그인 수행|
| |web/mod|관리자 정보변경 수행|
| |web/dooruser|도어락 사용자 추가 수행|
|DELETE|web/adminuser|사용자 삭제 수행|
| |web/admindoor|도어락 삭제 수행|
| |web/dooruser|도어락 사용자 삭제 수행|

## 상태 코드
|Code|Description|
|:---:|---|
|200|성공|
|404|DB 조회 실패|
|460|사용자 등록 실패(이미 존재하는 회원)|
|461|사용자 조회 실패(존재하지 않는 회원)|
|462|사용자 조회 실패(삭제된 회원)|
|463|로그인 실패(패스워드 불일치)|
|464|권한없는 접근|
|465|사용자 탈퇴 실패(관리중인 도어락 존재)|
|466|도어락 등록 실패(이미 존재하는 도어락)|

