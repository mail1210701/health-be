const sequelize = require("sequelize");
const responseFormatter = require("../helpers/responseFormatter");
const { disease, disease_restriction, fruit} = require("../models");

class DiseaseController {
  static getListDisease = async (req, res) => {
    try {
      const diseases = await disease.findAll({
        include: [
          {
            model: disease_restriction,
            attributes: {
              exclude: ["createdAt", "updatedAt"]
            },
            include: [
              {
                model: fruit,
                attributes: {
                  exclude: ["createdAt", "updatedAt"]
                },
              }
            ]
          }
        ]
      });

      const response = diseases.map(disease => ({
        disease_id: disease.disease_id,
        disease_name: disease.disease_name,
        description: disease.description,
        disease_restrictions: disease.disease_restrictions.map(disease_restriction => ({
          disease_restriction_id: disease_restriction.disease_restriction_id,
          fruit: {
            fruit_id: disease_restriction.fruit_id,
            fruit_name: disease_restriction?.fruit?.fruit_name
          }
        }))
      }))

      return res
        .status(200)
        .json(
          responseFormatter.success(response, "Data penyakit ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static createDisease = async (req, res) => {
    try {
      const {
        disease_name,
        description,
        disease_restrictions
      } = req.body;

      const diseaseIsExist = await disease.findOne({
        where: sequelize.where(
          sequelize.fn("lower", sequelize.col("disease_name")),
          sequelize.fn('lower', disease_name)
        )
      })

      if(diseaseIsExist){
        return res
          .status(409)
          .json(
            responseFormatter.error(null, "Data penyakit sudah terdaftar", res.statusCode)
          );
      }

      const retriviedDisease = await disease.create({
        disease_name,
        description
      });

      let retriviedDiseaseRestriction
      if(retriviedDisease) {
        const mapDiseaseRestriction = disease_restrictions.map(({ fruit_id }) => ({
          fruit_id,
          disease_id: retriviedDisease.disease_id
        }));

        retriviedDiseaseRestriction = await disease_restriction.bulkCreate(mapDiseaseRestriction)
      }

      if(retriviedDiseaseRestriction) {
        const retrivied = await disease.findAll({
          include: {
            model: disease_restriction,
            attributes:{
              exclude: ["createdAt", "updatedAt"]
            },
            include: {
              model: fruit,
              attributes: {
                exclude: ["createdAt", "updatedAt"]
              }
            }
          },
          where: {
            disease_id: retriviedDisease.disease_id
          }
        });
  
        const response = retrivied.map(disease => ({
          disease_id: disease.disease_id,
          disease_name: disease.disease_name,
          description: disease.description,
          disease_restrictions: disease.disease_restrictions.map(disease_restriction => ({
            disease_restriction_id: disease_restriction.disease_restriction_id,
            fruit: {
              fruit_id: disease_restriction?.fruit_id,
              fruit_name: disease_restriction?.fruit?.fruit_name
            }
          }))
        }))

        return res
          .status(200)
          .json(
            responseFormatter.success(response, "Data penyakit berhasil ditambahkan", res.statusCode)
          );
      }

      throw new Error

    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static updateDisease = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        disease_name,
        description,
        disease_restrictions
      } = req.body;

      const diseaseIsExist = await disease.findByPk(id)
      if (!diseaseIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data penyakit tidak detemukan", res.statusCode)
          );
      }

      const diseaseAlreadyRegistered = await disease.findOne({
        where: sequelize.where(
          sequelize.fn("lower", sequelize.col("disease_name")),
          sequelize.fn('lower', disease_name)
        )
      })

      if(diseaseAlreadyRegistered && diseaseAlreadyRegistered.disease_id !== Number(id)){
        return res
          .status(409)
          .json(
            responseFormatter.error(null, "Data penyakit sudah terdaftar", res.statusCode)
          );
      }

      const retriviedDisease = await disease.update({
        disease_name,
        description
      }, {
        where: {
          disease_id: id
        }
      });

      let retriviedDiseaseRestriction
      if(retriviedDisease) {
        const mapDiseaseRestriction = disease_restrictions.map(({ disease_restriction_id, fruit_id }) => ({
          disease_restriction_id,
          fruit_id,
          disease_id: id
        }));

        retriviedDiseaseRestriction = await Promise.all(mapDiseaseRestriction.map(async (restriction) => {
          console.log(restriction.disease_restriction_id);
          await disease_restriction.update(
            {
              fruit_id: restriction.fruit_id,
              disease_id: restriction.disease_id 
            }, { 
              where: { 
                disease_restriction_id: restriction.disease_restriction_id
              } 
            });
        }));
      }

      if(retriviedDiseaseRestriction) {
        const retrivied = await disease.findAll({
          include: {
            model: disease_restriction,
            attributes:{
              exclude: ["createdAt", "updatedAt"]
            },
            include: {
              model: fruit,
              attributes: {
                exclude: ["createdAt", "updatedAt"]
              }
            }
          },
          where: {
            disease_id: id
          }
        });
  
        const response = retrivied.map(disease => ({
          disease_id: disease.disease_id,
          disease_name: disease.disease_name,
          description: disease.description,
          disease_restrictions: disease.disease_restrictions.map(restriction => ({
            disease_restriction_id: restriction.disease_restriction_id,
            fruit: {
              fruit_id: restriction.fruit_id,
              fruit_name: restriction.fruit.fruit_name
            }
          }))
        }))

        return res
          .status(200)
          .json(
            responseFormatter.success(response, "Data penyakit berhasil diperbaharui", res.statusCode)
          );
      }

      throw new Error

    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };
}

module.exports = DiseaseController;