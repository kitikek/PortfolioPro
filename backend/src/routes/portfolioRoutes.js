const express = require('express');
const { createPortfolio, getUserPortfolios, publishPortfolio } = require('../controllers/portfolioController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createPortfolio);
router.get('/', protect, getUserPortfolios);
router.put('/:id/publish', protect, publishPortfolio);

module.exports = router;