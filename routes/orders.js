const express = require("express");
const router = express.Router();
const {
  order,
  getOrderList,
  getOrderDetail,
} = require("../controller/OrderController");

router.use(express.json());

router.post("/", order); // 결제하기
router.get("/", getOrderList); // 주문 목록 조회
router.put("/:id", getOrderDetail); // 상세정보 조회

module.exports = router;
