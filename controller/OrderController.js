const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const order = (req, res) => {
  const { items, delivery, totalQuantity, totalPrice, userId, firstBookTitle } =
    req.body;

  let delivery_id;
  let order_id;

  let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?);`;
  let values = [delivery.address, delivery.receiver, delivery.contact];
  delivery_id = results.insertId;

  sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id) VALUES (?, ?, ?, ?, ?);`;
  values = [firstBookTitle, totalQuantity, totalPrice, userId, delivery_id];
  order_id = results.insertId;

  sql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?;`;
  values = [];
  items.forEach((item) => {
    values.push([order_id, items.book_id, items.quantity]);
  });

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json(results);
  });
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
