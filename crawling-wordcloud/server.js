const express = require("express"); // 웹 프레임워크 - 서버를 만들고, 라우팅을 돕고, 미들웨어를 추가 가능하게 해줌
const mysql = require("mysql2"); // MySQL과 상호 작용하기 위한 모듈 / 기본적으로 promise 지원
const cors = require("cors"); // 서로 다른 출처 간의 데이터 공유 미들웨어(react와 연동)
const util = require("util"); // 유틸리티 함수 제공 내장 모듈, 콜백 기반의 함수를 프로미스 기반으로 변환
const { exec } = require("child_process"); // 외부 프로세스 생성 및 제어 / 다른 프로그램을 실행하거나 명령행 명령 실행 가능
const schedule = require("node-schedule"); // 스케줄 설정 모듈
const env = require("dotenv")
// concurrently : 여러 명령 동시 실행 가능(node 서버 실행시 파이썬 파일 실행) / package.json에 작성

const server = express();
const port = 8081;

server.use(cors());
server.use(express.json()); // JSON 파싱을 위한 미들웨어 추가

env.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env;

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,
});

const execPromise = util.promisify(exec); // exec함수를 Promise(비동기) 방식으로 변환

// // 주기적으로 파이썬 파일 실행
// setInterval(async () => {
//   try {
//     await execPromise("python NewsAPI.py");
//     console.log("파이썬 스크립트가 실행되었습니다.");
//   } catch (error) {
//     console.error(`오류: ${error.message}`);
//   }
// }, 24 * 60 * 60 * 1000); // 1일(1초: 1000, 1분: 60 * 1000)

// 매일 06:00에 파이썬 파일 실행 (초(0-59), 분(0-59), 시(0-23), 일(1-31), 월(1-12), 요일(0-7))
// * 로 표시한 경우 반복됨(e.g. * 0 6 * * * : 06시 00분 00초, 01초, 02초...59초)
schedule.scheduleJob('0 0 6 * * *', async () => {
  try {
    await execPromise("python NewsAPI.py");
    console.log("파이썬 스크립트가 실행되었습니다.");
  } catch (error) {
    console.error(`오류: ${error.message}`);
  }
});

// DB에 있는 뉴스 데이터 가져오기
server.get("/news", (req, res) => {
  db.query(
    "SELECT idx, image_url, title, url, views, isLiked, DATE_FORMAT(pubDate, '%Y-%m-%d %H:%i:%s') AS pubDate FROM news",
    (err, results) => {
      if (err) {
        console.error("MySQL에서 뉴스데이터 가져오기 중 오류:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.json(results);
    }
  );
});

// 조회수 데이터
server.post("/news/views", (req, res) => {
  const { idx, views } = req.body;
  db.query(
    "UPDATE news SET views = ? WHERE idx = ?",
    [views, idx],
    (err, results) => {
      if (err) {
        console.error("조회수 데이터 업데이트 중 오류:", err);
        res.status(500).send("Internal Server Error");
      }
    }
  );
});

// 좋아요 데이터
server.post("/news/likes", (req, res) => {
  const { idx, isLiked } = req.body;
  db.query(
    "UPDATE news SET isLiked = ? WHERE idx = ?",
    [isLiked, idx],
    (err, results) => {
      if (err) {
        console.error("좋아요 상태 업데이트 중 오류:", err);
        res.status(500).send("Internal Server Error");
      } else {
        res.json({ success: true });
      }
    }
  );
});

// 서버 포트 열기
server.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
