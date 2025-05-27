const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCartItem,
  removeCartItem,
} = require("../controller/CartController");

router.use(express.json());

router.post("/", addToCart); // 장바구니 담기
router.get("/", getCartItem); // 장바구니 조회 & 장바구니에서 선택한 상품 목록 조회
router.delete("/:cart_item_id", removeCartItem); // 장바구니 도서 삭제

module.exports = router;
