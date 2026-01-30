var Utilizadorperfil = require("../model/Utilizadorperfil");
var TipoMarcacao = require("../model/tipomarcacao");
var Consultas = require("../model/Consultas");
var sequelize = require("../model/database");
const controllers = {};

controllers.list = async (req, res) => {
  try {
    const data = await Consultas.findAll({
      include: [
        { model: TipoMarcacao, as: 'TipoMarcacaoData' },
        { model: Utilizadorperfil, as: 'UtilizadorData' }
      ]
    });
    res.json({success: true, data: data});
  } catch (error) {
    console.error("Erro durante a listagem:", error);
    res.status(500).json({ error: error.message });
  }
};

controllers.listPaciente = async (req, res) => {
  try {
    const {id} = req.params;
    const data = await Consultas.findAll({
      where: {idutilizadorprefil: id},
      include: [
        { model: TipoMarcacao, as: 'TipoMarcacaoData' },
        { model: Utilizadorperfil, as: 'UtilizadorData' }
      ]
    });
    res.json({success: true, data: data});
  } catch (error) {
    console.error("Erro durante a listagem:", error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = controllers;
