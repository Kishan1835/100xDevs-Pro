const prisma = require('../config/db');

exports.getAll = () => prisma.iTI.findMany({
  include: { machines: true, students: true, trades: true }
});

exports.getById = (id) => prisma.iTI.findUnique({
  where: { ITI_ID: id },
  include: { 
    machines: true, 
    students: true, 
    trades: true, 
    workers: true 
  }
});
