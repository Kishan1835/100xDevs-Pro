const prisma = require('../config/db');

module.exports = {
  getAll: () => prisma.inventory.findMany({ include: { worker: true } }),

  getAllAuctions: () => prisma.auctions.findMany({
    include: { item: true, iti: true }
  })
};
