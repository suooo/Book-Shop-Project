const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const join = (req, res) => {
  const { email, password } = req.body;
  let sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
  let values = [email, password];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    res.status(StatusCodes.CREATED).json(results);
  });
};

const login = (req, res) => {
  res.json("로그인");
};

const passwordResetRequest = (req, res) => {
  res.json("비번 초기화 요청");
};

const passwordReset = (req, res) => {
  res.json("비번 초기화");
};

module.exports = { join, join, passwordResetRequest, passwordReset };
