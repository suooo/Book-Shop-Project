const { validationResult } = require("express-validator");
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

// 전체 도서 조회, 카테고리 별 조회, 신간 조회
const allBooks = (req, res) => {
  let { category_id, newBooks, limit, currentPage } = req.query;

  let offset = limit * (currentPage - 1);

  let sql = `SELECT *, (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes FROM books`;
  let values = [];

  //now() -> '2023-12-32'
  if (category_id && newBooks) {
    sql += ` WHERE category_id = ? AND pub_date BETWEEN DATE_SUB('2023-12-31', INTERVAL 1 MONTH) AND '2023-12-31'`;
    values = [category_id];
  } else if (category_id) {
    sql += ` WHERE category_id = ?`;
    values = [category_id];
  } else if (newBooks) {
    sql += ` WHERE pub_date BETWEEN DATE_SUB('2023-12-31', INTERVAL 1 MONTH) AND '2023-12-31'`;
  }

  sql += ` LIMIT ?, ?`;
  values.push(offset, parseInt(limit));

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results.length) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

const bookDetail = (req, res) => {
  let { user_id } = req.body;
  let book_id = req.params.id;

  let sql = `SELECT *, 
    (SELECT EXISTS (SELECT * FROM likes WHERE user_id=? AND liked_book_id=?)) AS liked,
    (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes
    FROM books 
    LEFT JOIN category 
    ON books.category_id = category.category_id
    WHERE books.id=?;`;
  let values = [user_id, book_id, book_id];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results[0]) {
      return res.status(StatusCodes.OK).json(results[0]);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

const booksByCategory = (req, res) => {
  let { category_id } = req.query;
  category_id = parseInt(category_id);

  let sql = `SELECT * FROM books WHERE category_id = ?`;

  conn.query(sql, category_id, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results.length > 0) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

module.exports = {
  allBooks,
  bookDetail,
  booksByCategory,
};
