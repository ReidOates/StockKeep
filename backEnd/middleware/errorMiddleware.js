module.exports = (err, req, res, next) => {
    console.error("--- ERROR STACK TRACE ---");
    console.error(err.stack || err);
    console.error("-------------------------");

    // Duplicate key error (MongoDB)
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: "Duplicate field value entered"
        });
    }

    // Validation error mongoose
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });

    if (process.env.NODE_ENV === "production") {
        delete err.stack;
    }
};