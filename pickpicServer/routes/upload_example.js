const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");

let storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "upload_example/")
    },
    filename: (req, file, callback) => {
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        callback(null, basename + "-" + Date.now() + extension)
    }
})

let upload_example = multer({
    /* upload한 파일을 그대로 수정 없이 upload_example/ 에 저장 */
    // dest: "upload_example/"
    /* diskStroage 사용 */
    storage:storage
})

// 뷰 페이지 경로
router.get('/show', (req, res, next) => {
    res.render("board")
});

// 2. 파일 업로드 처리
router.post('/create', upload_example.array("userfile"), (req, res, next) => {
    // 3. 파일 객체
    console.log(req.files);
    console.log(req.body);

    res.json(req.files);
});

module.exports = router;