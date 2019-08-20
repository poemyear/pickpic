var express = require('express');
var router = express.Router();
const controller = require('./controller');

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);

/* Unused */
router.put('/', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
