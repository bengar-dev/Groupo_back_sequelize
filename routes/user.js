const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user.js')

const auth = require('../middleware/auth.js')
const multer = require('../middleware/multer.js')

router.get('/', auth, userCtrl.getUsers);
router.get('/:id', auth, userCtrl.getUser);

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

router.put('/:id', auth, multer, userCtrl.editUser);

router.delete('/:id', auth, userCtrl.delUser)

module.exports = router;
