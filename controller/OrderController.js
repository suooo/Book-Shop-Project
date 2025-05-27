const conn = require("../mariadb");
const mariadb = require("mysql2/promise");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const ensureAuthorization = require("../auth");

const order = async (req, res) => {
  const conn = await mariadb.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "Bookshop",
    dateStrings: true,
  });

  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "로그인 세션이 만료되었습니다. 다시 로그인 필요.",
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "잘못된 토큰입니다.",
    });
  } else {
    const { items, delivery, totalQuantity, totalPrice, firstBookTitle } =
      req.body;

    // delivery 테이블 삽입
    let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?);`;
    let values = [delivery.address, delivery.receiver, delivery.contact];

    let [results] = await conn.execute(sql, values);
    let delivery_id = results.insertId;

    // orders 테이블 삽입
    sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id) VALUES (?, ?, ?, ?, ?);`;
    values = [
      firstBookTitle,
      totalQuantity,
      totalPrice,
      authorization.id,
      delivery_id,
    ];

    [results] = await conn.execute(sql, values);
    let order_id = results.insertId;

    // 장바구니에서 book_id와 quantity 조회
    sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?);`;
    let [orderItems, fields] = await conn.query(sql, [items]);

    // orderedBook 테이블 삽입
    sql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?;`;
    values = [];
    orderItems.forEach((item) => {
      values.push([order_id, item.book_id, item.quantity]);
    });

    [results] = await conn.query(sql, [values]);

    // 장바구니에서 삭제
    results = await deleteCartItems(conn, items);

    return res.status(StatusCodes.OK).json(results);
  }
};

const deleteCartItems = async (conn, items) => {
  let sql = `DELETE FROM cartItems WHERE id IN (?); `;
  let result = await conn.query(sql, [items]);
  return result;
};

const getOrderList = (req, res) => {
  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "로그인 세션이 만료되었습니다. 다시 로그인 필요.",
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "잘못된 토큰입니다.",
    });
  } else {
    let sql = `SELECT orders.id, created_at, address, receiver, contact, book_title, total_quantity, total_price
      FROM orders LEFT JOIN delivery
      ON orders.delivery_id = delivery.id;`;

    conn.query(sql, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }

      return res.status(StatusCodes.OK).json(results);
    });
  }
};

const getOrderDetail = (req, res) => {
  const { order_id } = req.params;
  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "로그인 세션이 만료되었습니다. 다시 로그인 필요.",
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "잘못된 토큰입니다.",
    });
  } else {
    let sql = `SELECT book_id, title, author, price, quantity
      FROM orderedBook LEFT JOIN books
      ON orderedBook.book_id = books.id
      WHERE order_id = ?;`;

    conn.query(sql, order_id, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }

      return res.status(StatusCodes.OK).json(results);
    });
  }
};

module.exports = {
  order,
  getOrderList,
  getOrderDetail,
};
