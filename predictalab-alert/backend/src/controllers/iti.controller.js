const itiRepo = require('../repositories/iti.repository');
const { success, error } = require('../utils/response');

exports.getAllITIs = async (req, res, next) => {
  try {
    const itis = await itiRepo.getAll();
    success(res, itis);
  } catch (err) {
    next(err);
  }
};

exports.getITIById = async (req, res, next) => {
  try {
    const iti = await itiRepo.getById(parseInt(req.params.id));
    if (!iti) return error(res, 'ITI not found', 404);
    success(res, iti);
  } catch (err) {
    next(err);
  }
};
