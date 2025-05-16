const express = require("express");
const router = express.Router();
const { allCategory } = require("../controller/CategoryController");

router.use(express.json());

router.get("/", allCategory); // 전체 카테고리 목록 조회

module.exports = router;
