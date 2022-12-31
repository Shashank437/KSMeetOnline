const express = require('express');
const uploadController = require('../controllers/upload.controller');
const router = express.Router();

router
  .route('/profile')
  .post(uploadController.uploadImage);

module.exports = router;
