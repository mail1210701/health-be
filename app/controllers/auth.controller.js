require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const responseFormatter = require("../helpers/responseFormatter");
const sendMail = require("../helpers/email");
const { user, role } = require("../models");

class AuthController {
  static register = async (req, res) => {
    try {
      const {
        name,
        email,
        password
      } = req.body;
      const clearEmail = email.toLowerCase();

      const emailExist = await user.findOne({ where: { email: email } });

      if (emailExist) {
        return res
          .status(409)
          .json(
            responseFormatter.error(null, "Email sudah terdaftar", res.statusCode)
          );
      }

      const salt = process.env.SALT;
      const encryptedPassword = await bcrypt.hash(password + salt, 10);

      const userResponse = await user.create({
        name: name,
        email: clearEmail,
        password: encryptedPassword,
        is_active: false,
        role_id: 2,
      });

      const userData = {
        id: userResponse.dataValues.user_id,
        name: userResponse.dataValues.name,
        email: userResponse.dataValues.email
      };

      const mailOptions = {
        from: "Akbar Rizki <lalanajunior84@gmail.com>",
        to: clearEmail,
        subject: "Aktivasi Akun",
        html: `<a href='https://sehat-scan.netlify.app/auth/verify-email?token=${btoa(
          JSON.stringify(userData)
        )}'>Tekan tautan berikut untuk melakukan aktivasi akun anda</a>`,
      };

      sendMail(mailOptions);

      return res
        .status(201)
        .json(
          responseFormatter.success(
            userData,
            "Berhasil membuat pengguna",
            res.statusCode
          )
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const clearEmail = email.toLowerCase();
      const salt = process.env.SALT;
      
      const userIsExist = await user.findOne(
      { 
        where: { email: clearEmail } ,
        attributes: {
          exclude: ["createdAt", "updatedAt"]
        },
        include: [
          {
            model: role,
            attributes: ["role_id", "role_name"],
          }
        ],
      }
      );
      
      if (!userIsExist) {
        return res.status(404).json(responseFormatter.error(null, "Pengguna tidak ditemukan", res.statusCode));
      }
      
      const isMatch = await bcrypt.compare(password + salt, userIsExist.password);
      if (!isMatch) {
        return res.status(401).json(responseFormatter.error(null, "Email atau password salah", res.statusCode));
      }

      if(!userIsExist.is_active) {
        return res.status(401).json(responseFormatter.error(null, "Akun anda belum aktif, silahkan cek email untuk melakukan aktivasi akun", res.statusCode));
      }

      const token = jwt.sign({
        user_id: userIsExist.user_id,
        name: userIsExist.name,
        email: userIsExist.email,
        role: userIsExist.role
      }, process.env.JWT_SIGNATURE_KEY);

      return res.status(200).json(responseFormatter.success(
        { 
          token, 
          user : {
            id: userIsExist.user_id,
            name: userIsExist.name,
            email: userIsExist.email,
            role: userIsExist.role
          }
        }, "Berhasil masuk", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static activation = async (req, res) => {
    try {
      const { token } = req.body;
      const userId = JSON.parse(atob(token)).id

      const userIsExist = await user.findByPk(userId);

      if (!userIsExist) {
        return res.status(404).json(responseFormatter.error(userIsExist, "Pengguna tidak ditemukan", res.statusCode));
      }

      const retrivied = await user.update({
        is_active: true
      }, {
        where: {
          user_id: userId
        }
      });

      return res.status(200).json(responseFormatter.success(retrivied, "Akun anda berhasil di aktivasi", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static async requestForgotPassword(req, res) {
    try {
      const { email } = req.body;
      const clearEmail = email.toLowerCase();

      const userIsExist = await user.findOne({ 
        where: { email: clearEmail },
        attributes: {
          exclude: ["is_active", "password", "createdAt", "updatedAt"]
        }
      });

      if (!userIsExist) {
        return res.status(404).json(responseFormatter.error(userIsExist, "Email tidak terdaftar", res.statusCode));
      } 

      const mailOptions = {
        from: "Akbar Rizki <lalanajunior84@gmail.com>",
        to: email,
        subject: "Perubahan Kata Sandi",
        html: `<p>Tekan tautan berikut untuk melakukan perubahan kata sandi <a href="http://localhost:5173/reset-password?token=${btoa(JSON.stringify(userIsExist))}">Ubah Kata Sandi</a></p>`
      };

      sendMail(mailOptions);

      return res.status(200).json(responseFormatter.success(userIsExist, "Tautan untuk melakukan perubahan password telah di kirim ke email", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      const userId = JSON.parse(atob(token)).user_id;

      const userIsExist = await user.findByPk(userId, {
        attributes: {
          exclude: ["is_active", "password", "createdAt", "updatedAt"]
        }
      });

      if (!userIsExist) {
        return res.status(404).json(responseFormatter.error(userIsExist, "Pengguna tidak ditemukan", res.statusCode));
      }

      const salt = process.env.SALT;
      const encryptedPassword = await bcrypt.hash(password + salt, 10);

      await user.update({
        password: encryptedPassword,
      }, {
        where: {
          user_id: userId
        }
      });

      return res.status(200).json(responseFormatter.success(employee, "Password anda berhasil diperbaharui", res.statusCode));
    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}

module.exports = AuthController;