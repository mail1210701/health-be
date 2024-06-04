const responseFormatter = require("../helpers/responseFormatter");
const getUser = require("../helpers/getUser");
const { history_disease, disease, allergy } =  require("../models");

class UserController {
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
        attributes: ['allergy_name']
      })
      const requestedAllergies = allergies.map(({ allergy_name }) => allergy_name);
      const existingAllergies = allergyUserIsExist.map(({ allergy_name }) => allergy_name)

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
        ({ allergy_name }) => ({
          allergy_name,
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
