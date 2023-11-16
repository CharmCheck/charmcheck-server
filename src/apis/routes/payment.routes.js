const { Router } = require('express');

const {
	paymentCheckoutController,
} = require('../controllers/payment.controllers');

const router = Router();

router.post('/checkout', paymentCheckoutController);

module.exports = router;
