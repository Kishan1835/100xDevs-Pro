const studentsRepo = require('../repositories/students.repository');
const { success, error } = require('../utils/response');

exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await studentsRepo.getAll();
    success(res, students);
  } catch (err) {
    next(err);
  }
};

exports.getStudentsByITI = async (req, res, next) => {
  try {
    const students = await studentsRepo.getByITI(parseInt(req.params.itiId));
    success(res, students);
  } catch (err) {
    next(err);
  }
};
