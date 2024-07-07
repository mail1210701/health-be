const sequelize = require("sequelize");
const responseFormatter = require("../helpers/responseFormatter");
const { disease, disease_restriction, history_disease, drink, nutrition, drink_detail, fruit} = require("../models");

class DiseaseController {
  static countDisease = async (req, res) => {
    try {
      const totalDisease = await disease.count();

      return res
        .status(200)
        .json(
          responseFormatter.error(totalDisease, "Informasi jumlah data penyakit ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static getListDisease = async (req, res) => {
    try {
      const diseases = await disease.findAll({
        include: [
          {
            model: disease_restriction,
            attributes: ["disease_restriction_id"],
            include: [
              {
                model: nutrition,
                attributes: {
                  exclude: ["createdAt", "updatedAt"]
                },
              }
            ]
          }
        ]
      });

      return res
        .status(200)
        .json(
          responseFormatter.success(diseases, "Data penyakit ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static findDisease = async (req, res) => {
    try {
      const { id } = req.params
      const diseaseIsExist = await disease.findByPk(id, {
        include: [
          {
            model: disease_restriction,
            attributes: ["disease_restriction_id"],
            include: [
              {
                model: nutrition,
                attributes: {
                  exclude: ["createdAt", "updatedAt"]
                },
              }
            ]
          }
        ]
      })

      if(!diseaseIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data penyakit tidak ditemukan", res.statusCode)
          );
      }

      return res
        .status(200)
        .json(
          responseFormatter.success(diseaseIsExist, "data penyakit ditemukan", res.statusCode)
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
        const mapDiseaseRestriction = disease_restrictions.map(({ nutrition_id }) => ({
          nutrition_id,
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
              model: nutrition,
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
          createdAt: disease.createdAt,
          updatedAt: disease.updatedAt,
          disease_restrictions: disease.disease_restrictions.map(disease_restriction => ({
            disease_restriction_id: disease_restriction.disease_restriction_id,
            nutritions: {
              nutrition_id: disease_restriction?.nutrition_id,
              nutrition_name: disease_restriction?.drink?.nutrition_name
            }
          }))
        }))

        return res
          .status(200)
          .json(
            responseFormatter.success(...response, "Data penyakit berhasil ditambahkan", res.statusCode)
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
        const existingRestrictions = await disease_restriction.findAll({
          where: { disease_id: id }
        });

        const existingRestrictionIds = existingRestrictions.map(restriction => restriction.disease_restriction_id);
        const incomingRestrictionIds = disease_restrictions.map(({ disease_restriction_id }) => disease_restriction_id).filter(Boolean);

        // Delete restrictions not included in the request
        const restrictionsToDelete = existingRestrictionIds.filter(id => !incomingRestrictionIds.includes(id));
        await disease_restriction.destroy({ where: { disease_restriction_id: restrictionsToDelete } });

        retriviedDiseaseRestriction = await Promise.all(disease_restrictions.map(async (restriction) => {
          if (restriction.disease_restriction_id) {
            // Update existing restriction
            await disease_restriction.update(
              {
                nutrition_id: restriction.nutrition_id,
                disease_id: id 
              }, { 
                where: { 
                  disease_restriction_id: restriction.disease_restriction_id
                } 
              });
          } else {
            // Create new restriction
            await disease_restriction.create({
              nutrition_id: restriction.nutrition_id,
              disease_id: id 
            });
          }
        }))
      }

      if(retriviedDiseaseRestriction) {
        const retrivied = await disease.findByPk(id, {
          include: {
            model: disease_restriction,
            attributes: ["disease_restriction_id"],
            include: [
              {
                model: nutrition,
                attributes: {
                  exclude: ["createdAt", "updatedAt"]
                }
              }
            ]
          },
        });

        return res
          .status(200)
          .json(
            responseFormatter.success(retrivied, "Data penyakit berhasil diperbaharui", res.statusCode)
          );
      }

      throw new Error

    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static deleteDisease = async (req, res) => {
    try {
      const { id } = req.params
      const diseaseIsExist = await disease.findByPk(id, {
        include: [
          {
            model: disease_restriction,
            attributes: ["disease_restriction_id"],
            include: [
              {
                model: nutrition,
                attributes: {
                  exclude: ["createdAt", "updatedAt"]
                }
              }
            ]
          }
        ]
      })

      if(!diseaseIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data penyakit tidak ditemukan", res.statusCode)
          );
      }

      const diseaseIsUsed = await history_disease.findOne({
        where: {
          disease_id: id
        }
      })

      if (diseaseIsUsed) {
        return res
          .status(400)
          .json(
            responseFormatter.error(null, "Data penyakit tidak dapat dihapus karena sudah terdaftar pada beberapa pengguna", res.statusCode)
          );
      }

      await disease.destroy({
        where: {
          disease_id: id
        }
      })

      await disease_restriction.destroy({
        where: {
          disease_id: id
        }
      })

      return res
        .status(200)
        .json(
          responseFormatter.success(diseaseIsExist, "Data penyakit berhasil dihapus", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}

module.exports = DiseaseController;