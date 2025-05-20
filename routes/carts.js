const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCartItem,
  removeCartItem,
} = require("../controller/CartController");

router.use(express.json());

router.post("/", addToCart); // 장바구니 담기
router.get("/", getCartItem); // 장바구니 조회
router.delete("/:id", removeCartItem); // 장바구니 도서 삭제

module.exports = router;
