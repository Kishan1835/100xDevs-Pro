const prisma = require('../config/db');

/**
 * Search ITIs by name, city, or state
 */
const searchITIs = async (query) => {
  if (!query || query.trim() === '') {
    return await prisma.iTI.findMany({
      select: {
        ITI_ID: true,
        Name: true,
        City: true,
        State: true,
        Address: true
      }
    });
  }

  const searchTerm = query.trim();
  
  return await prisma.iTI.findMany({
    where: {
      OR: [
        { Name: { contains: searchTerm, mode: 'insensitive' } },
        { City: { contains: searchTerm, mode: 'insensitive' } },
        { State: { contains: searchTerm, mode: 'insensitive' } }
      ]
    },
    select: {
      ITI_ID: true,
      Name: true,
      City: true,
      State: true,
      Address: true
    }
  });
};

/**
 * Filter ITIs by city and/or state
 */
const filterITIs = async (city, state) => {
  const whereConditions = {};

  if (city && city.trim() !== '' && city !== 'all') {
    whereConditions.City = { equals: city, mode: 'insensitive' };
  }

  if (state && state.trim() !== '' && state !== 'all') {
    whereConditions.State = { equals: state, mode: 'insensitive' };
  }

  return await prisma.iTI.findMany({
    where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    select: {
      ITI_ID: true,
      Name: true,
      City: true,
      State: true,
      Address: true
    }
  });
};

/**
 * Get all ITI locations
 */
const getAllLocations = async () => {
  return await prisma.iTI.findMany({
    select: {
      ITI_ID: true,
      Name: true,
      City: true,
      State: true,
      Address: true
    }
  });
};

/**
 * Get maintenance statistics from Maintenance_Log table
 */
const getStats = async () => {
  const [totalIssues, opened, inProgress, closed] = await Promise.all([
    // Total issues
    prisma.maintenance_Log.count(),
    
    // Reported (Status = "Opened")
    prisma.maintenance_Log.count({
      where: { Status: 'Opened' }
    }),
    
    // In Progress
    prisma.maintenance_Log.count({
      where: { Status: 'In progress' }
    }),
    
    // Resolved (Status = "Closed")
    prisma.maintenance_Log.count({
      where: { Status: 'Closed' }
    })
  ]);

  return {
    totalIssues,
    opened,
    inProgress,
    closed
  };
};

/**
 * Get unique cities from ITI table
 */
const getUniqueCities = async () => {
  const cities = await prisma.iTI.findMany({
    select: {
      City: true
    },
    distinct: ['City'],
    orderBy: {
      City: 'asc'
    }
  });

  return cities.map(c => c.City).filter(Boolean);
};

/**
 * Get unique states from ITI table
 */
const getUniqueStates = async () => {
  const states = await prisma.iTI.findMany({
    select: {
      State: true
    },
    distinct: ['State'],
    orderBy: {
      State: 'asc'
    }
  });

  return states.map(s => s.State).filter(Boolean);
};

module.exports = {
  searchITIs,
  filterITIs,
  getAllLocations,
  getStats,
  getUniqueCities,
  getUniqueStates
};
