module.exports = {
  sendSuccess: (res, data, status = 200, message = 'Success') => {
    res.status(status).json({
      success: true,
      message,
      data
    });
  },
  
  sendError: (res, message, status = 400) => {
    res.status(status).json({
      success: false,
      error: message
    });
  },

  success: (res, data, status = 200, message = 'Success') => {
    res.status(status).json({
      success: true,
      message,
      data
    });
  },
  
  error: (res, message, status = 400) => {
    res.status(status).json({
      success: false,
      error: message
    });
  }
};
