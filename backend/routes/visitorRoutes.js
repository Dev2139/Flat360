const express = require('express');
const router = express.Router();
const { visitorEntry, requestExit, getVisitorStatus, visitorExit, getVisitorLogs } = require('../controllers/visitorController');
const { protect } = require('../middleware/authMiddleware');

router.post('/entry', visitorEntry);
router.put('/request-exit/:id', requestExit);
router.get('/status/:id', getVisitorStatus);
router.put('/exit/:id', protect, visitorExit);
router.get('/logs', protect, getVisitorLogs);

module.exports = router;
