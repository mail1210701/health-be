const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/disease', require('./disease'));
router.use('/fruit', require('./fruit'));
router.use('/drink', require('./drink'));
router.use('/user', require('./user'));
router.use('/role', require('./role'));
router.use('/predict', require('./predict'));

module.exports = router;