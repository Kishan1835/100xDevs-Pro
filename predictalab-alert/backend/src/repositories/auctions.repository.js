const prisma = require('../config/db');

module.exports = {
  // Get all auctions with ITI and item details
  getAllAuctions: () => {
    return prisma.auctions.findMany({
      include: {
        iti: {
          select: {
            ITI_ID: true,
            Name: true,
            City: true,
            State: true
          }
        },
        item: {
          select: {
            Item_ID: true,
            Item_Name: true
          }
        }
      },
      orderBy: {
        Last_Updated: 'desc'
      }
    });
  },

  // Get auction by Item_ID
  getAuctionById: (itemId) => {
    return prisma.auctions.findUnique({
      where: { Item_ID: parseInt(itemId) },
      include: {
        iti: {
          select: {
            ITI_ID: true,
            Name: true,
            City: true,
            State: true
          }
        },
        item: {
          select: {
            Item_ID: true,
            Item_Name: true
          }
        }
      }
    });
  },

  // Create new auction
  createAuction: (data) => {
    return prisma.auctions.create({
      data: {
        Item_ID: parseInt(data.itemId),
        ITI_ID: data.itiId ? parseInt(data.itiId) : null,
        Item_Name: data.itemName,
        Quantity: parseInt(data.quantity),
        Base_Price: parseFloat(data.basePrice),
        Bids: 0,
        Last_Updated: new Date()
      },
      include: {
        iti: {
          select: {
            ITI_ID: true,
            Name: true
          }
        }
      }
    });
  },

  // Update auction
  updateAuction: (itemId, data) => {
    const updateData = {};
    
    if (data.itiId !== undefined) updateData.ITI_ID = data.itiId ? parseInt(data.itiId) : null;
    if (data.itemName !== undefined) updateData.Item_Name = data.itemName;
    if (data.quantity !== undefined) updateData.Quantity = parseInt(data.quantity);
    if (data.basePrice !== undefined) updateData.Base_Price = parseFloat(data.basePrice);
    if (data.bids !== undefined) updateData.Bids = parseInt(data.bids);
    
    updateData.Last_Updated = new Date();

    return prisma.auctions.update({
      where: { Item_ID: parseInt(itemId) },
      data: updateData,
      include: {
        iti: {
          select: {
            ITI_ID: true,
            Name: true
          }
        }
      }
    });
  },

  // Delete auction
  deleteAuction: (itemId) => {
    return prisma.auctions.delete({
      where: { Item_ID: parseInt(itemId) }
    });
  },

  // Increment bid count
  incrementBids: (itemId) => {
    return prisma.auctions.update({
      where: { Item_ID: parseInt(itemId) },
      data: {
        Bids: { increment: 1 },
        Last_Updated: new Date()
      }
    });
  },

  // Get auctions by approval status
  getAuctionsByStatus: (approved) => {
    return prisma.auctions.findMany({
      where: { Approved: approved },
      include: {
        iti: {
          select: {
            ITI_ID: true,
            Name: true,
            City: true,
            State: true
          }
        },
        item: {
          select: {
            Item_ID: true,
            Item_Name: true
          }
        }
      },
      orderBy: {
        Last_Updated: 'desc'
      }
    });
  },

  // Approve auction
  approveAuction: (itemId) => {
    return prisma.auctions.update({
      where: { Item_ID: parseInt(itemId) },
      data: {
        Approved: true,
        Last_Updated: new Date()
      },
      include: {
        iti: {
          select: {
            ITI_ID: true,
            Name: true
          }
        }
      }
    });
  },

  // Get approved but unpublished auctions
  getApprovedUnpublishedAuctions: () => {
    return prisma.auctions.findMany({
      where: {
        Approved: true,
        Published: false
      },
      include: {
        iti: {
          select: {
            ITI_ID: true,
            Name: true,
            City: true,
            State: true
          }
        },
        item: {
          select: {
            Item_ID: true,
            Item_Name: true
          }
        }
      },
      orderBy: {
        Last_Updated: 'desc'
      }
    });
  },

  // Get published auctions
  getPublishedAuctions: () => {
    return prisma.auctions.findMany({
      where: { Published: true },
      include: {
        iti: {
          select: {
            ITI_ID: true,
            Name: true,
            City: true,
            State: true
          }
        },
        item: {
          select: {
            Item_ID: true,
            Item_Name: true
          }
        }
      },
      orderBy: {
        Last_Updated: 'desc'
      }
    });
  },

  // Publish auction
  publishAuction: (itemId) => {
    return prisma.auctions.update({
      where: { Item_ID: parseInt(itemId) },
      data: {
        Published: true,
        Last_Updated: new Date()
      },
      include: {
        iti: {
          select: {
            ITI_ID: true,
            Name: true
          }
        }
      }
    });
  },

  // Unpublish auction
  unpublishAuction: (itemId) => {
    return prisma.auctions.update({
      where: { Item_ID: parseInt(itemId) },
      data: {
        Published: false,
        Last_Updated: new Date()
      },
      include: {
        iti: {
          select: {
            ITI_ID: true,
            Name: true
          }
        }
      }
    });
  }
};
