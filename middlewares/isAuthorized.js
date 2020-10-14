const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization) throw new Error('لطفا وارد حساب کاربری خود شوید.');
    const token = req.headers.authorization.split(' ')[1];
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (verified) {
      req.userId = verified.id;
      next();
    }
    else throw new Error('لطفا وارد حساب کاربری خود شوید.');
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};