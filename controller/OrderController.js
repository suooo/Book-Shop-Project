// const conn = require("../mariadb");
const mariadb = require("mysql2/promise");
const { StatusCodes } = require("http-status-codes");

const order = async (req, res) => {
  const conn = await mariadb.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "Bookshop",
    dateStrings: true,
  });

  const { items, delivery, totalQuantity, totalPrice, userId, firstBookTitle } =
    req.body;

  // delivery 테이블 삽입
  let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?);`;
  let values = [delivery.address, delivery.receiver, delivery.contact];

  let [results] = await conn.execute(sql, values);
  let delivery_id = results.insertId;

  // orders 테이블 삽입
  sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id) VALUES (?, ?, ?, ?, ?);`;
  values = [firstBookTitle, totalQuantity, totalPrice, userId, delivery_id];

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
};

const deleteCartItems = async (conn, items) => {
  let sql = `DELETE FROM cartItems WHERE id IN (?); `;
  let result = await conn.query(sql, [items]);
  return result;
};

const getOrderList = (req, res) => {
  res.json("주문 목록 조회");
};

const getOrderDetail = (req, res) => {
  res.json("상세정보 조회");
};

module.exports = {
  order,
  getOrderList,
  getOrderDetail,
};
