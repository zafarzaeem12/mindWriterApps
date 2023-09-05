const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  if (!req.headers['authorization']) {
    return res.status(401).send({ status: 0, message: 'Unauthorized' });
  }

  try {
    // Get token from header
    const token = req.headers['authorization'].split(' ')[1];

    if (!token) {
      return res.status(401).send({ status: 0, message: 'Token missing' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Get user from the token
    const userId = decoded.userId;
    console.log("req.userId", userId);

    // Check if the user exists
    const user = await User.findOne({ _id: userId }).select('-password');

    if (!user) {
      return res.status(401).send({ status: 0, message: 'User not found' });
    } else if (user.user_authentication !== token) {
      return res.status(401).send({ status: 0, message: 'Token mismatch' });
    } else {
      // User is authenticated, you can store user data in the request object if needed
      req.user = user;
      next();
    }
  } catch (error) {
    console.error(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({ status: 0, message: 'Invalid token' });
    }

    // Handle other errors
    return res.status(500).send({ status: 0, message: 'Internal Server Error' });
  }
};

module.exports = { verifyToken };
