const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

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
  const { email, password } = req.body;

  let sql = `SELECT * FROM users WHERE email = ?`;

  conn.query(sql, email, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    var loginUser = results[0];
    if (loginUser && loginUser.password == password) {
      const token = jwt.sign(
        {
          email: loginUser.email,
        },
        process.env.PRIVATE_KEY,
        {
          expiresIn: "5m",
          issuer: "Suyeon",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
      });

      console.log(token);

      res.status(StatusCodes.OK).json({
        message: `로그인 되었습니다.`,
      });
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "이메일 또는 비밀번호가 틀립니다.",
      });
    }
  });
};

const passwordResetRequest = (req, res) => {
  const { email } = req.body;

  let sql = `SELECT * FROM users WHERE email = ?`;

  conn.query(sql, email, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    const user = results[0];
    if (user) {
      return res.status(StatusCodes.OK).json({
        email: email,
      });
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
  });
};

const passwordReset = (req, res) => {
  const { email, password } = req.body;

  let sql = `UPDATE users SET password = ? WHERE email = ?`;
  let values = [password, email];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results.affectedRows == 0) {
      return res.status(StatusCodes.BAD_REQUEST).end();
    } else {
      return res.status(StatusCodes.OK).json(results);
    }
  });
};

module.exports = { join, login, passwordResetRequest, passwordReset };
