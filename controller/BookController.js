const { validationResult } = require("express-validator");
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

// 전체 도서 조회, 카테고리 별 조회, 신간 조회
const allBooks = (req, res) => {
  let { category_id, newBooks, limit, currentPage } = req.query;

  let offset = limit * (currentPage - 1);

  let sql = `SELECT * FROM books`;
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
  let { id } = req.params;
  id = parseInt(id);

  let sql = `SELECT * FROM books LEFT JOIN category ON books.category_id = category.id WHERE books.id = ?`;

  conn.query(sql, id, (err, results) => {
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
