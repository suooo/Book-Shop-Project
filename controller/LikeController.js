const conn = require("../mariadb");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const dotenv = require("dotenv");
dotenv.config();

const addLike = (req, res) => {
  const { book_id } = req.params;

  let authorization = ensureAuthorization(req);

  let sql = `INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?);`;
  let values = [authorization.id, book_id];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json(results);
  });
};

const removeLike = (req, res) => {
  const { book_id } = req.params;

  let authorization = ensureAuthorization(req);

  let sql = `DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?;`;
  let values = [authorization.id, book_id];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json(results);
  });
};

function ensureAuthorization(req) {
  let receivedJwt = req.headers["authorization"];
  let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
  return decodedJwt;
}

module.exports = { addLike, removeLike };
