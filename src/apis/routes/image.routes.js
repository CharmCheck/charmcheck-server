const { Router } = require('express');

const { uploadImageController } = require('../controllers/image.controllers');

const router = Router();

router.post('/upload', uploadImageController);

module.exports = router;
