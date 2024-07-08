const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Organisation = require('../models/organisation');
require('dotenv').config();

const register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    // Validate fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(422).json({
        errors: [{ field: 'all', message: 'All fields are required' }]
      });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(422).json({
        errors: [{ field: 'email', message: 'Email already exists' }]
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      userId: require('crypto').randomBytes(16).toString('hex'),
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone
    });

    // Create organisation
    const organisation = await Organisation.create({
      orgId: require('crypto').randomBytes(16).toString('hex'),
      name: `${firstName}'s Organisation`,
      description: ''
    });

    // Generate JWT
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401
      });
    }

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

module.exports = { register, login };
