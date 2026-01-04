// src/repositories/students.repository.js
const prisma = require('../config/db');

exports.findByBatch = ({ itiId, tradeId, batch }) => {
    return prisma.students.findMany({
        where: {
            ITI_ID: itiId,
            Trade_ID: tradeId,
            Batch: batch,
        },
        orderBy: { Student_ID: 'asc' },
    });
};



exports.getAll = () => prisma.students.findMany({
  include: { iti: true, trade: true, teacher: true }
});

exports.getByITI = (itiId) => prisma.students.findMany({
  where: { ITI_ID: itiId },
  include: { iti: true, trade: true, teacher: true }
});
