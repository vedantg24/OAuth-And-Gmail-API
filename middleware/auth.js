exports.auth = (req, res, next) => {
    if (req.user) {
        next();
    }
    else {
        res.status(401);
    }
}