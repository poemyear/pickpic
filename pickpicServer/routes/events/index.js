var express = require('express');
var router = express.Router();

const controller = require('./controller');
const multer = require("multer");
const path = require("path");
const gm = require('gm');

generateThumbnnail = (req, res, next) => {
    req.files.map(file => {
        const thumbnail = 'thumb_' + file.filename;
        const thumbnailPath = 'thumbnail/' + thumbnail;
        file.thumbnailPath = thumbnailPath; // thumb Callback 에서 넣어주는 방법!? 
        file.thumbnail = thumbnail;
        gm(file.path).thumb(100, 100, thumbnailPath, (err) => {
            if (err) console.error(err);
        })
    });
    next();
}

let storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "upload");
    },
    filename: (req, file, callback) => {
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        callback(null, basename + "-" + Date.now() + extension);
    }
})

let upload = multer({
    /* upload한 파일을 그대로 수정 없이 upload/ 에 저장 */
    //dest: "upload/"
    /* diskStroage 사용 */
    storage: storage
})

router.get('/', controller.index);
router.post('/', upload.array("userfile"), generateThumbnnail, controller.create);

router.get('/:eventId', controller.show);
router.get('/:eventId/status', controller.status);
router.post('/:eventId/:photoId', controller.vote);
router.get('/myEvents/:userId/:cnt',controller.showMyEvents);
router.get('/myPicks/:userId/:cnt',controller.showMyPicks);

/* Unused */
router.put('/', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
