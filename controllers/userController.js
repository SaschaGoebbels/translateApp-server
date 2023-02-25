const Users = require('../models/userModel');

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
//BUG
exports.createUser = async (req, res) => {
  try {
    console.log('✅', req.body);
    const newUser = await Users.create(req.body);
    console.log(newUser);
    res.status(201).json({ status: 'success', data: { user: newUser } });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error
    });
  }
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
