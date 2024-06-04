const { jwtDecode } = require('jwt-decode')
const { user } = require('../models')

const responseFormatter = require('./responseFormatter')

const getUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const payload = jwtDecode(token);
    const result = await user.findOne({
      attributes: {
        exclude: ["password"]
      },
      where: {
        user_id: payload.user_id
      }
    });

    return result;
  } catch (error) {
    res.status(500).json(responseFormatter.error(null, error.message, res.statusCode))
  }
}

module.exports = getUser