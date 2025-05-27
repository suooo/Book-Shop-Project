const express = require("express");
const router = express.Router();
const { addLike, removeLike } = require("../controller/LikeController");

router.use(express.json());

router.post("/:book_id", addLike); // 좋아요 추가
router.delete("/:book_id", removeLike); // 좋아요 취소

module.exports = router;
