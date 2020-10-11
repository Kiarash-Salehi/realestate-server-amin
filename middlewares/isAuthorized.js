const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (verified) {
      req.userId = verified.id;
      next();
    }
    else throw new Error('You are not logged in to your account');
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};