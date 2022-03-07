const express = require('express');
const router = express.Router();

const postCtrl = require('../controllers/post.js')
const cmtCtrl = require('../controllers/cmt.js')

const auth = require('../middleware/auth.js')
const multer = require('../middleware/multer.js')

router.get('/', auth, postCtrl.getAll);
router.get('/:id', auth, postCtrl.getOne);
router.get('/cmt/all', auth, cmtCtrl.getAll);

router.post('/', auth, multer, postCtrl.postOne);
router.post('/:id/cmt', auth, cmtCtrl.postOne);

router.put('/:id', auth, multer, postCtrl.editOne)

router.delete('/:id', auth, postCtrl.deleteOne)
router.delete('/cmt/:id', auth, cmtCtrl.deleteOne)

module.exports = router;
