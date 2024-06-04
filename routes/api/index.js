const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/disease', require('./disease'));
router.use('/fruit', require('./fruit'));
router.use('/drink', require('./drink'));
router.use('/user', require('./user'));

module.exports = router;