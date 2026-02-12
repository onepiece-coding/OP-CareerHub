const router = require('express').Router();
const { chatBotCtrl } = require('../controllers/chatbotController.js');

// POST /api/v1/chatbot
router.post('/', chatBotCtrl); // currently available for public usage

module.exports = router;
