const express = require('express');
const {
  getAllAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  deleteAuction,
  incrementBids,
  getPendingAuctions,
  getApprovedAuctions,
  approveAuction,
  getApprovedUnpublishedAuctions,
  getPublishedAuctions,
  publishAuction,
  unpublishAuction
} = require('../controllers/auctions.controller');

const router = express.Router();

// GET /api/auctions/pending - Get pending auctions (must be before /:itemId)
router.get('/pending', getPendingAuctions);

// GET /api/auctions/approved - Get approved auctions (must be before /:itemId)
router.get('/approved', getApprovedAuctions);

// GET /api/auctions/approved-unpublished - Get approved but not published auctions
router.get('/approved-unpublished', getApprovedUnpublishedAuctions);

// GET /api/auctions/published - Get published auctions
router.get('/published', getPublishedAuctions);

// GET /api/auctions - Get all auctions
router.get('/', getAllAuctions);

// GET /api/auctions/:itemId - Get single auction
router.get('/:itemId', getAuctionById);

// POST /api/auctions - Create new auction
router.post('/', createAuction);

// PUT /api/auctions/:itemId - Update auction
router.put('/:itemId', updateAuction);

// PATCH /api/auctions/:itemId/approve - Approve auction
router.patch('/:itemId/approve', approveAuction);

// PATCH /api/auctions/:itemId/publish - Publish auction
router.patch('/:itemId/publish', publishAuction);

// PATCH /api/auctions/:itemId/unpublish - Unpublish auction
router.patch('/:itemId/unpublish', unpublishAuction);

// DELETE /api/auctions/:itemId - Delete auction
router.delete('/:itemId', deleteAuction);

// POST /api/auctions/:itemId/bid - Increment bid count
router.post('/:itemId/bid', incrementBids);

module.exports = router;
