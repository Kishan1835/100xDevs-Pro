const inventoryRepo = require('../repositories/inventory.repository');
const { success, error } = require('../utils/response');

exports.getAllInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryRepo.getAll();
    success(res, inventory);
  } catch (err) {
    next(err);
  }
};

exports.getAllAuctions = async (req, res, next) => {
  try {
    const auctions = await inventoryRepo.getAllAuctions();
    success(res, auctions);
  } catch (err) {
    next(err);
  }
};
