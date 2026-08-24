const sequelize = require("./model/database");
const Generos = require("./model/Generos");
const Estadocivil = require("./model/Estadocivil");
const Classe = require("./model/Classe");
const TipoConta = require("./model/tipoconta");
const TipoMarcacao = require("./model/tipomarcacao");
const Utilizadorperfil = require("./model/Utilizadorperfil");
const Conta = require("./model/Conta");
const Consultas = require("./model/Consultas");
const Notificacao = require("./model/Notificacao");
const Comprovativo = require("./model/Comprovativo");
const bcrypt = require("bcryptjs");

async function initSeed() {
  try {
    // Adicionar colunas caso estejam em falta na tabela SQLite existente
    try { await sequelize.query("ALTER TABLE utilizadorprefil ADD COLUMN ficheirosanexos TEXT;"); } catch (e) {}
    try { await sequelize.query("ALTER TABLE consultas ADD COLUMN horaFim TEXT;"); } catch (e) {}

    // Forçar a criação de todas as tabelas em ordem
    await sequelize.sync({ force: false });

    // Check if Generos exists
    const countGeneros = await Generos.count();
    if (countGeneros === 0) {
      console.log("🌱 Semente de dados: A popular tabelas de domínio...");
      await Generos.bulkCreate([
        { idgenero: 1, designacao: "Masculino" },
        { idgenero: 2, designacao: "Feminino" },
        { idgenero: 3, designacao: "Outro" }
      ]);
    }

    const countEstadoCivil = await Estadocivil.count();
    if (countEstadoCivil === 0) {
      await Estadocivil.bulkCreate([
        { idestadocivil: 1, designacao: "Solteiro(a)" },
        { idestadocivil: 2, designacao: "Casado(a)" },
        { idestadocivil: 3, designacao: "Divorciado(a)" },
        { idestadocivil: 4, designacao: "Viúvo(a)" }
      ]);
    }

    const countClasse = await Classe.count();
    if (countClasse === 0) {
      await Classe.bulkCreate([
        { idclasse: 1, designacao: "Geral" },
        { idclasse: 2, designacao: "Prioritário" },
        { idclasse: 3, designacao: "VIP" },
        { idclasse: 4, designacao: "Seguradora" }
      ]);
    }

    const countTipoConta = await TipoConta.count();
    if (countTipoConta === 0) {
      await TipoConta.bulkCreate([
        { idtipoconta: 1, desling: "Administrador" },
        { idtipoconta: 2, desling: "Médico" },
        { idtipoconta: 3, desling: "Paciente" },
        { idtipoconta: 4, desling: "Rececionista" }
      ]);
    }

    const countTipoMarcacao = await TipoMarcacao.count();
    if (countTipoMarcacao === 0) {
      await TipoMarcacao.bulkCreate([
        { idtipomarcacao: 1, desling: "Check-up Geral", designacao: "Check-up Geral" },
        { idtipomarcacao: 2, desling: "Limpeza Dentária / Destartarização", designacao: "Limpeza Dentária / Destartarização" },
        { idtipomarcacao: 3, desling: "Tratamento de Canal (Endodontia)", designacao: "Tratamento de Canal (Endodontia)" },
        { idtipomarcacao: 4, desling: "Extração Dentária", designacao: "Extração Dentária" },
        { idtipomarcacao: 5, desling: "Ortodontia (Aparelho)", designacao: "Ortodontia (Aparelho)" },
        { idtipomarcacao: 6, desling: "Branqueamento Dentário", designacao: "Branqueamento Dentário" },
        { idtipomarcacao: 7, desling: "Implante Dentário", designacao: "Implante Dentário" }
      ]);
    }

    const countPerfis = await Utilizadorperfil.count();
    if (countPerfis === 0) {
      console.log("🌱 Semente de dados: A popular perfis de teste...");
      await Utilizadorperfil.bulkCreate([
        {
          idutilizadorprefil: 1,
          nome: "Dra. Maria Santos",
          datanascimento: "1985-04-12",
          genero: 2,
          endereco: "Rua Central, Viseu",
          contactoprincipal: "912345678",
          nif: "211223344",
          estadocivil: 2,
          profissao: "Médica Dentista",
          numeroutente: "100200300",
          gmail: "maria.santos@clinica.pt",
          classe: 3
        },
        {
          idutilizadorprefil: 2,
          nome: "João Pedro Silva",
          datanascimento: "1998-08-20",
          genero: 1,
          endereco: "Av. Europa, Viseu",
          contactoprincipal: "961234567",
          nif: "299887766",
          estadocivil: 1,
          profissao: "Engenheiro",
          numeroutente: "400500600",
          gmail: "joao.silva@email.com",
          classe: 1
        },
        {
          idutilizadorprefil: 3,
          nome: "Ana Sofia Martins",
          datanascimento: "2001-11-05",
          genero: 2,
          endereco: "Rua Direita, Porto",
          contactoprincipal: "933445566",
          nif: "255443322",
          estadocivil: 1,
          profissao: "Estudante",
          numeroutente: "700800900",
          gmail: "ana.martins@email.com",
          classe: 1
        }
      ]);
    }

    const countContas = await Conta.count();
    if (countContas === 0) {
      console.log("🌱 Semente de dados: A popular contas de teste...");
      const passHash = bcrypt.hashSync("123456", 10);
      await Conta.bulkCreate([
        { nome: "admin", password: passHash, idtipoconta: 1, idprefil: 1 },
        { nome: "dra.maria", password: passHash, idtipoconta: 2, idprefil: 1 },
        { nome: "joao.silva", password: passHash, idtipoconta: 3, idprefil: 2 },
        { nome: "ana.martins", password: passHash, idtipoconta: 3, idprefil: 3 }
      ]);
    }

    console.log("✅ Base de dados inicializada e pronta a usar!");
  } catch (error) {
    console.error("❌ Erro na semente de dados:", error);
  }
}

module.exports = initSeed;
