const responseFormatter = require("../helpers/responseFormatter");
const getUser = require("../helpers/getUser");
const { user, role, history_disease, disease, allergy, fruit } =  require("../models");

class UserController {
  static getProfile = async (req, res) => {
    try {
      const userJWT = await getUser(req, res)

      const userData = await user.findOne({
        include: [
          {
            model: role,
            attributes:{
              exclude: ["createdAt", "updatedAt"]
            },
          },
          {
            model: history_disease,
            attributes:{
              exclude: ["createdAt", "updatedAt", "disease_id", "user_id"]
            },
            include: [
              {
                model: disease,
                attributes:{
                  exclude: ["createdAt", "updatedAt"]
                },
              }
            ]
          },
          {
            model: allergy,
            attributes: {
              exclude: ["createdAt", "updatedAt", "user_id", "fruit_id"]
            },
            include: [
              {
                model: fruit,
                attributes:{
                  exclude: ["createdAt", "updatedAt", "user_id"]
                },
              }
            ]
          }
        ],
        attributes: {
          exclude: ["password", "is_active", "role_id"]
        },
        where: {
          user_id: userJWT.user_id
        }
      })

      return res
        .status(200)
        .json(
          responseFormatter.success(
            userData,
            "Data riwayat penyakit berhasil ditambahkan",
            res.statusCode
          )
        );
    } catch (error) {
      
    }
  }

  static diseaseUser = async (req, res) => {
    try {
      const { diseases } = req.body;
      const userData = await getUser(req, res)

      const diseaseUserIsExist = await history_disease.findAll({
        where: {
          user_id: userData.user_id
        },
        attributes: ['disease_id']
      })
      const requestedDiseases = diseases.map(({ disease_id }) => disease_id);
      const existingDiseases = diseaseUserIsExist.map(({ disease_id }) => disease_id)

      for (const requestedDisease of requestedDiseases) {
        if (existingDiseases.includes(requestedDisease)) {
          return res
          .status(409)
          .json(
            responseFormatter.error(null, "Data riwayat penyakit sudah terdaftar, silahkan cek kembali data masukan", res.statusCode)
          );
        }
      }
      
      const mapDiseaseUser = diseases.map(
        ({ disease_id }) => ({
          disease_id,
          user_id: userData.user_id,
        })
      );

      const retriviedDiseaseHistory = await history_disease.bulkCreate(mapDiseaseUser);
      
      if(retriviedDiseaseHistory) {
        return res
          .status(200)
          .json(
            responseFormatter.success(
              retriviedDiseaseHistory,
              "Data riwayat penyakit berhasil ditambahkan",
              res.statusCode
            )
          );
      }

      throw new Error();

    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static allergyUser = async (req, res) => {
    try {
      const { allergies } = req.body;
      const userData = await getUser(req, res)
      
      const allergyUserIsExist = await allergy.findAll({
        where: {
          user_id: userData.user_id
        },
        attributes: ['fruit_id']
      })
      const requestedAllergies = allergies.map(({ fruit_id }) => fruit_id);
      const existingAllergies = allergyUserIsExist.map(({ fruit_id }) => fruit_id)

      for (const requestedAllergy of requestedAllergies) {
        if (existingAllergies.includes(requestedAllergy)) {
          return res
            .status(409)
            .json(
              responseFormatter.error(null, "Data alergi sudah terdaftar, silahkan cek kembali data masukan", res.statusCode)
            );
        }
      }

      const mapAllergyUser = allergies.map(
        ({ fruit_id }) => ({
          fruit_id,
          user_id: userData.user_id,
        })
      );

      const retriviedDiseaseHistory = await allergy.bulkCreate(mapAllergyUser);

      return res
        .status(200)
        .json(
          responseFormatter.success(
            retriviedDiseaseHistory,
            "Data alergi berhasil ditambahkan",
            res.statusCode
          )
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}
module.exports = UserController
