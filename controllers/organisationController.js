const Organisation = require('../models/organisation');
const User = require('../models/user');

const createOrganisation = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.userId;

  try {
    const organisation = await Organisation.create({
      orgId: require('crypto').randomBytes(16).toString('hex'),
      name,
      description
    });

    await organisation.addUser(userId);

    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

module.exports = { createOrganisation };
