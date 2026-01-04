const prisma = require('../config/db');

/**
 * Dashboard Repository
 * Handles all database queries for the NCVET dashboard
 */

/**
 * Get dashboard statistics counts
 */
exports.getStats = async () => {
  const [branches, students, machines, maintenanceWorkers, itiStaff] = await Promise.all([
    prisma.iTI.count(),
    prisma.students.count(),
    prisma.machines.count(),
    prisma.maintenance_Workers.count(),
    prisma.iTI_Workers.count()
  ]);

  return {
    branches,
    students,
    machines,
    maintenanceWorkers,
    itiStaff
  };
};

/**
 * Get all ITI locations for map display
 */
exports.getLocations = async () => {
  const itis = await prisma.iTI.findMany({
    select: {
      ITI_ID: true,
      Name: true,
      Address: true,
      City: true,
      State: true
    }
  });

  return itis.map(iti => ({
    itiId: iti.ITI_ID,
    name: iti.Name,
    address: iti.Address,
    city: iti.City,
    state: iti.State
  }));
};

/**
 * Calculate and return ITI scores
 * 
 * Score Formula:
 * Score = A × (students passed) + B × (students placed) + 
 *         C × (healthy machines) + D × (failed students) + 
 *         E × (alert/critical machines)
 * 
 * Constants (weights):
 * A = 0.3 (passed students - positive impact)
 * B = 0.4 (placed students - highest positive impact)
 * C = 0.2 (healthy machines - positive impact)
 * D = -0.25 (failed students - negative impact)
 * E = -0.15 (unhealthy machines - negative impact)
 */
exports.calculateITIScores = async () => {
  // Weights for score calculation
  const WEIGHTS = {
    PASSED: 0.3,
    PLACED: 0.4,
    HEALTHY_MACHINES: 0.2,
    FAILED: -0.25,
    UNHEALTHY_MACHINES: -0.15
  };

  // Get all ITIs with their related data
  const itis = await prisma.iTI.findMany({
    include: {
      students: {
        select: {
          Placed: true,
          Year: true
        }
      },
      machines: {
        select: {
          Status: true
        }
      }
    }
  });

  // Calculate scores for each ITI
  const scores = itis.map(iti => {
    const totalStudents = iti.students.length;
    const placedStudents = iti.students.filter(s => s.Placed).length;
    
    // Assume students in Year 4 who are not placed have failed
    // Adjust this logic based on your actual business rules
    const finalYearStudents = iti.students.filter(s => s.Year >= 3).length;
    const passedStudents = finalYearStudents > 0 ? placedStudents : Math.floor(totalStudents * 0.7); // Assume 70% pass rate
    const failedStudents = finalYearStudents > 0 ? finalYearStudents - placedStudents : Math.floor(totalStudents * 0.3);

    const healthyMachines = iti.machines.filter(m => m.Status === 'HEALTHY').length;
    const unhealthyMachines = iti.machines.filter(m => m.Status === 'ALERT' || m.Status === 'CRITICAL').length;

    // Calculate raw score
    const rawScore = 
      (WEIGHTS.PASSED * passedStudents) +
      (WEIGHTS.PLACED * placedStudents) +
      (WEIGHTS.HEALTHY_MACHINES * healthyMachines) +
      (WEIGHTS.FAILED * failedStudents) +
      (WEIGHTS.UNHEALTHY_MACHINES * unhealthyMachines);

    return {
      itiId: iti.ITI_ID,
      name: iti.Name,
      rawScore,
      passedStudents,
      placedStudents,
      failedStudents,
      healthyMachines,
      unhealthyMachines
    };
  });

  // Find min and max for normalization
  const rawScores = scores.map(s => s.rawScore);
  const minScore = Math.min(...rawScores);
  const maxScore = Math.max(...rawScores);

  // Normalize scores to 0-100 scale
  const normalizedScores = scores.map(s => {
    let normalizedScore;
    
    if (maxScore === minScore) {
      // All scores are the same
      normalizedScore = 50;
    } else {
      // Min-Max normalization to 0-100
      normalizedScore = ((s.rawScore - minScore) / (maxScore - minScore)) * 100;
    }

    return {
      itiId: s.itiId,
      name: s.name,
      score: Math.round(normalizedScore * 10) / 10, // Round to 1 decimal place
      rawScore: s.rawScore
    };
  });

  // Update ITI_score in database
  await Promise.all(
    normalizedScores.map(s =>
      prisma.iTI.update({
        where: { ITI_ID: s.itiId },
        data: { ITI_score: Math.round(s.score) }
      })
    )
  );

  // Return sorted by score descending
  return normalizedScores.sort((a, b) => b.score - a.score);
};

/**
 * Get pre-calculated ITI scores from database
 */
exports.getITIScores = async () => {
  const itis = await prisma.iTI.findMany({
    select: {
      ITI_ID: true,
      Name: true,
      ITI_score: true
    },
    orderBy: {
      ITI_score: 'desc'
    }
  });

  return itis.map(iti => ({
    itiId: iti.ITI_ID,
    name: iti.Name,
    score: iti.ITI_score
  }));
};
