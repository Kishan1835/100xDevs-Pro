const auctionsRepo = require('../repositories/auctions.repository');
const { success, error } = require('../utils/response');

// GET /api/auctions - Get all auctions
exports.getAllAuctions = async (req, res, next) => {
  try {
    const auctions = await auctionsRepo.getAllAuctions();
    
    // Transform data for frontend
    const transformedAuctions = auctions.map(auction => ({
      itemId: auction.Item_ID,
      itiId: auction.ITI_ID,
      itiName: auction.iti?.Name || 'N/A',
      itiCity: auction.iti?.City || '',
      itiState: auction.iti?.State || '',
      itemName: auction.Item_Name,
      quantity: auction.Quantity,
      basePrice: parseFloat(auction.Base_Price),
      bids: auction.Bids,
      lastUpdated: auction.Last_Updated
    }));

    success(res, transformedAuctions);
  } catch (err) {
    next(err);
  }
};

// GET /api/auctions/:itemId - Get single auction
exports.getAuctionById = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const auction = await auctionsRepo.getAuctionById(itemId);

    if (!auction) {
      return error(res, 'Auction not found', 404);
    }

    const transformedAuction = {
      itemId: auction.Item_ID,
      itiId: auction.ITI_ID,
      itiName: auction.iti?.Name || 'N/A',
      itemName: auction.Item_Name,
      quantity: auction.Quantity,
      basePrice: parseFloat(auction.Base_Price),
      bids: auction.Bids,
      lastUpdated: auction.Last_Updated
    };

    success(res, transformedAuction);
  } catch (err) {
    next(err);
  }
};

// POST /api/auctions - Create new auction
exports.createAuction = async (req, res, next) => {
  try {
    const { itemId, itiId, itemName, quantity, basePrice } = req.body;

    // Validation
    if (!itemId || !itemName || !quantity || !basePrice) {
      return error(res, 'Missing required fields: itemId, itemName, quantity, basePrice', 400);
    }

    if (quantity <= 0) {
      return error(res, 'Quantity must be greater than 0', 400);
    }

    if (basePrice <= 0) {
      return error(res, 'Base price must be greater than 0', 400);
    }

    const auction = await auctionsRepo.createAuction({
      itemId,
      itiId,
      itemName,
      quantity,
      basePrice
    });

    const transformedAuction = {
      itemId: auction.Item_ID,
      itiId: auction.ITI_ID,
      itiName: auction.iti?.Name || 'N/A',
      itemName: auction.Item_Name,
      quantity: auction.Quantity,
      basePrice: parseFloat(auction.Base_Price),
      bids: auction.Bids,
      lastUpdated: auction.Last_Updated
    };

    success(res, transformedAuction, 201, 'Auction created successfully');
  } catch (err) {
    if (err.code === 'P2002') {
      return error(res, 'An auction with this Item ID already exists', 409);
    }
    if (err.code === 'P2003') {
      return error(res, 'Invalid Item ID or ITI ID - related record not found', 400);
    }
    next(err);
  }
};

// PUT /api/auctions/:itemId - Update auction
exports.updateAuction = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { itiId, itemName, quantity, basePrice, bids } = req.body;

    // Check if auction exists
    const existingAuction = await auctionsRepo.getAuctionById(itemId);
    if (!existingAuction) {
      return error(res, 'Auction not found', 404);
    }

    // Validation
    if (quantity !== undefined && quantity <= 0) {
      return error(res, 'Quantity must be greater than 0', 400);
    }

    if (basePrice !== undefined && basePrice <= 0) {
      return error(res, 'Base price must be greater than 0', 400);
    }

    const auction = await auctionsRepo.updateAuction(itemId, {
      itiId,
      itemName,
      quantity,
      basePrice,
      bids
    });

    const transformedAuction = {
      itemId: auction.Item_ID,
      itiId: auction.ITI_ID,
      itiName: auction.iti?.Name || 'N/A',
      itemName: auction.Item_Name,
      quantity: auction.Quantity,
      basePrice: parseFloat(auction.Base_Price),
      bids: auction.Bids,
      lastUpdated: auction.Last_Updated
    };

    success(res, transformedAuction, 200, 'Auction updated successfully');
  } catch (err) {
    if (err.code === 'P2003') {
      return error(res, 'Invalid ITI ID - ITI not found', 400);
    }
    next(err);
  }
};

// DELETE /api/auctions/:itemId - Delete auction
exports.deleteAuction = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    // Check if auction exists
    const existingAuction = await auctionsRepo.getAuctionById(itemId);
    if (!existingAuction) {
      return error(res, 'Auction not found', 404);
    }

    await auctionsRepo.deleteAuction(itemId);

    success(res, { itemId: parseInt(itemId) }, 200, 'Auction deleted successfully');
  } catch (err) {
    next(err);
  }
};

// POST /api/auctions/:itemId/bid - Increment bid count
exports.incrementBids = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const auction = await auctionsRepo.incrementBids(itemId);

    const transformedAuction = {
      itemId: auction.Item_ID,
      bids: auction.Bids,
      lastUpdated: auction.Last_Updated
    };

    success(res, transformedAuction, 200, 'Bid placed successfully');
  } catch (err) {
    if (err.code === 'P2025') {
      return error(res, 'Auction not found', 404);
    }
    next(err);
  }
};

// GET /api/auctions/pending - Get pending auctions (not approved)
exports.getPendingAuctions = async (req, res, next) => {
  try {
    const auctions = await auctionsRepo.getAuctionsByStatus(false);
    
    const transformedAuctions = auctions.map(auction => ({
      itemId: auction.Item_ID,
      itiId: auction.ITI_ID,
      itiName: auction.iti?.Name || 'N/A',
      itiCity: auction.iti?.City || '',
      itiState: auction.iti?.State || '',
      itemName: auction.Item_Name,
      quantity: auction.Quantity,
      basePrice: parseFloat(auction.Base_Price),
      bids: auction.Bids,
      lastUpdated: auction.Last_Updated,
      approved: auction.Approved
    }));

    success(res, transformedAuctions);
  } catch (err) {
    next(err);
  }
};

// GET /api/auctions/approved - Get approved auctions
exports.getApprovedAuctions = async (req, res, next) => {
  try {
    const auctions = await auctionsRepo.getAuctionsByStatus(true);
    
    const transformedAuctions = auctions.map(auction => ({
      itemId: auction.Item_ID,
      itiId: auction.ITI_ID,
      itiName: auction.iti?.Name || 'N/A',
      itiCity: auction.iti?.City || '',
      itiState: auction.iti?.State || '',
      itemName: auction.Item_Name,
      quantity: auction.Quantity,
      basePrice: parseFloat(auction.Base_Price),
      bids: auction.Bids,
      lastUpdated: auction.Last_Updated,
      approved: auction.Approved
    }));

    success(res, transformedAuctions);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auctions/:itemId/approve - Approve an auction
exports.approveAuction = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    // Check if auction exists
    const existingAuction = await auctionsRepo.getAuctionById(itemId);
    if (!existingAuction) {
      return error(res, 'Auction not found', 404);
    }

    if (existingAuction.Approved) {
      return error(res, 'Auction is already approved', 400);
    }

    const auction = await auctionsRepo.approveAuction(itemId);

    const transformedAuction = {
      itemId: auction.Item_ID,
      itiId: auction.ITI_ID,
      itiName: auction.iti?.Name || 'N/A',
      itemName: auction.Item_Name,
      quantity: auction.Quantity,
      basePrice: parseFloat(auction.Base_Price),
      bids: auction.Bids,
      lastUpdated: auction.Last_Updated,
      approved: auction.Approved
    };

    success(res, transformedAuction, 200, 'Auction approved successfully');
  } catch (err) {
    next(err);
  }
};

// GET /api/auctions/approved-unpublished - Get approved but not published auctions
exports.getApprovedUnpublishedAuctions = async (req, res, next) => {
  try {
    const auctions = await auctionsRepo.getApprovedUnpublishedAuctions();
    
    const transformedAuctions = auctions.map(auction => ({
      itemId: auction.Item_ID,
      itiId: auction.ITI_ID,
      itiName: auction.iti?.Name || 'N/A',
      itiCity: auction.iti?.City || '',
      itiState: auction.iti?.State || '',
      itemName: auction.Item_Name,
      quantity: auction.Quantity,
      basePrice: parseFloat(auction.Base_Price),
      bids: auction.Bids,
      lastUpdated: auction.Last_Updated,
      approved: auction.Approved,
      published: auction.Published
    }));

    success(res, transformedAuctions);
  } catch (err) {
    next(err);
  }
};

// GET /api/auctions/published - Get published auctions
exports.getPublishedAuctions = async (req, res, next) => {
  try {
    const auctions = await auctionsRepo.getPublishedAuctions();
    
    const transformedAuctions = auctions.map(auction => ({
      itemId: auction.Item_ID,
      itiId: auction.ITI_ID,
      itiName: auction.iti?.Name || 'N/A',
      itiCity: auction.iti?.City || '',
      itiState: auction.iti?.State || '',
      itemName: auction.Item_Name,
      quantity: auction.Quantity,
      basePrice: parseFloat(auction.Base_Price),
      bids: auction.Bids,
      lastUpdated: auction.Last_Updated,
      approved: auction.Approved,
      published: auction.Published
    }));

    success(res, transformedAuctions);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auctions/:itemId/publish - Publish an auction
exports.publishAuction = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const existingAuction = await auctionsRepo.getAuctionById(itemId);
    if (!existingAuction) {
      return error(res, 'Auction not found', 404);
    }

    if (!existingAuction.Approved) {
      return error(res, 'Auction must be approved before publishing', 400);
    }

    if (existingAuction.Published) {
      return error(res, 'Auction is already published', 400);
    }

    const auction = await auctionsRepo.publishAuction(itemId);

    const transformedAuction = {
      itemId: auction.Item_ID,
      itiId: auction.ITI_ID,
      itiName: auction.iti?.Name || 'N/A',
      itemName: auction.Item_Name,
      quantity: auction.Quantity,
      basePrice: parseFloat(auction.Base_Price),
      bids: auction.Bids,
      lastUpdated: auction.Last_Updated,
      approved: auction.Approved,
      published: auction.Published
    };

    success(res, transformedAuction, 200, 'Auction published successfully');
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auctions/:itemId/unpublish - Unpublish an auction
exports.unpublishAuction = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const existingAuction = await auctionsRepo.getAuctionById(itemId);
    if (!existingAuction) {
      return error(res, 'Auction not found', 404);
    }

    if (!existingAuction.Published) {
      return error(res, 'Auction is not published', 400);
    }

    const auction = await auctionsRepo.unpublishAuction(itemId);

    const transformedAuction = {
      itemId: auction.Item_ID,
      itiId: auction.ITI_ID,
      itiName: auction.iti?.Name || 'N/A',
      itemName: auction.Item_Name,
      quantity: auction.Quantity,
      basePrice: parseFloat(auction.Base_Price),
      bids: auction.Bids,
      lastUpdated: auction.Last_Updated,
      approved: auction.Approved,
      published: auction.Published
    };

    success(res, transformedAuction, 200, 'Auction unpublished successfully');
  } catch (err) {
    next(err);
  }
};