const express = require("express");
const router = express.Router();

router.use(express.json());

// 결제하기
router.post("/", (req, res) => {
  res.json("결제하기");
});

// 주문 목록 조회
router.get("/", (req, res) => {
  res.json("주문 목록 조회");
});

// 상세정보 조회
router.put("/:id", (req, res) => {
  res.json("상세정보 조회");
});

module.exports = router;
