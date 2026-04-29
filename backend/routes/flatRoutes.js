const express = require('express');
const router = express.Router();
const { getFlats, createFlat, updateFlat, deleteFlat, getFlatByQrCode } = require('../controllers/flatController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getFlats)
  .post(protect, createFlat);

router.route('/qr/:qrCodeId')
  .get(getFlatByQrCode);

router.route('/:id')
  .put(protect, updateFlat)
  .delete(protect, deleteFlat);

module.exports = router;
