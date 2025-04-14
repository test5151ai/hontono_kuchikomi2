const createResponse = {
    success: (data, message = '') => ({
        success: true,
        data,
        message
    }),

    error: (message, status = 400) => ({
        success: false,
        message,
        status
    })
};

module.exports = createResponse; 