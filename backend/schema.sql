-- ============================================================
-- SCRIPT DE CRIAÇÃO DA BASE DE DADOS SQL (POSTGRESQL) - PI4 G5
-- Sistema da Clínica Dentária
-- ============================================================

-- 1. LIMPEZA PREVENTIVA DE TABELAS (se existirem)
DROP TABLE IF EXISTS comprovativo CASCADE;
DROP TABLE IF EXISTS notificacao CASCADE;
DROP TABLE IF EXISTS consultas CASCADE;
DROP TABLE IF EXISTS conta CASCADE;
DROP TABLE IF EXISTS utilizadorprefil CASCADE;
DROP TABLE IF EXISTS tipomarcacao CASCADE;
DROP TABLE IF EXISTS tipoconta CASCADE;
DROP TABLE IF EXISTS classe CASCADE;
DROP TABLE IF EXISTS estadocivil CASCADE;
DROP TABLE IF EXISTS generos CASCADE;

-- 2. TABELAS DE DOMÍNIO / LOOKUP
CREATE TABLE generos (
    idgenero SERIAL PRIMARY KEY,
    designacao VARCHAR(50) NOT NULL
);

CREATE TABLE estadocivil (
    idestadocivil SERIAL PRIMARY KEY,
    designacao VARCHAR(50) NOT NULL
);

CREATE TABLE classe (
    idclasse SERIAL PRIMARY KEY,
    designacao VARCHAR(100) NOT NULL
);

CREATE TABLE tipoconta (
    idtipoconta SERIAL PRIMARY KEY,
    desling VARCHAR(50) NOT NULL
);

CREATE TABLE tipomarcacao (
    idtipomarcacao SERIAL PRIMARY KEY,
    desling VARCHAR(100) NOT NULL
);

-- 3. PERFIS DE UTILIZADOR
CREATE TABLE utilizadorprefil (
    idutilizadorprefil SERIAL PRIMARY KEY,
    posidutilizador INT REFERENCES utilizadorprefil(idutilizadorprefil) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    datanascimento DATE,
    genero INT REFERENCES generos(idgenero) ON DELETE SET NULL,
    endereco VARCHAR(255),
    contactoprincipal VARCHAR(20),
    contactosecundario VARCHAR(20),
    nif VARCHAR(20),
    estadocivil INT REFERENCES estadocivil(idestadocivil) ON DELETE SET NULL,
    profissao VARCHAR(100),
    numeroutente VARCHAR(50),
    subsistemassaude VARCHAR(100),
    gmail VARCHAR(255),
    classe INT REFERENCES classe(idclasse) ON DELETE SET NULL,
    alergias VARCHAR(255),
    medicamentos VARCHAR(255),
    condicaosaude VARCHAR(255),
    motivoconsultainicial VARCHAR(255),
    experienciaanastesia BOOLEAN DEFAULT FALSE,
    condicoesdentarias VARCHAR(255),
    habitoigieneoral VARCHAR(255),
    consumosubstancia VARCHAR(255),
    historicotratamentosdentariospassados TEXT,
    historicodor BOOLEAN DEFAULT FALSE,
    atividadesdesportivas VARCHAR(255),
    bruxismo VARCHAR(50),
    gravida BOOLEAN DEFAULT FALSE,
    infoadicional TEXT,
    resultadosanteriores TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CONTAS DE UTILIZADOR (LOGIN & SEGURANÇA)
CREATE TABLE conta (
    idconta SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Guardado de forma encriptada (bcrypt)
    idtipoconta INT REFERENCES tipoconta(idtipoconta) ON DELETE SET NULL,
    idprefil INT REFERENCES utilizadorprefil(idutilizadorprefil) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. AGENDA E CONSULTAS
CREATE TABLE consultas (
    idconsulta SERIAL PRIMARY KEY,
    medico VARCHAR(255) NOT NULL,
    hora TIME NOT NULL,
    data DATE NOT NULL,
    falta BOOLEAN DEFAULT FALSE,
    estadimarcacao BOOLEAN DEFAULT TRUE,
    numerotelemovel VARCHAR(20),
    tipomarcacao INT REFERENCES tipomarcacao(idtipomarcacao) ON DELETE SET NULL,
    detalhes TEXT,
    guia_tratamento TEXT,
    idutilizadorprefil INT REFERENCES utilizadorprefil(idutilizadorprefil) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. NOTIFICAÇÕES
CREATE TABLE notificacao (
    idnotificacao SERIAL PRIMARY KEY,
    prefil INT REFERENCES utilizadorprefil(idutilizadorprefil) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    visto BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. COMPROVATIVOS E DOCUMENTOS DESCARREGÁVEIS PELOS CLIENTES
CREATE TABLE comprovativo (
    idcomprovativo SERIAL PRIMARY KEY,
    idconsulta INT REFERENCES consultas(idconsulta) ON DELETE SET NULL,
    idutilizadorprefil INT REFERENCES utilizadorprefil(idutilizadorprefil) ON DELETE CASCADE,
    tipo_documento VARCHAR(100) NOT NULL, -- 'Comprovativo de Presença', 'Fatura/Recibo', 'Receita Médica', 'Relatório'
    titulo VARCHAR(255) NOT NULL,
    ficheiro_path VARCHAR(500),
    valor DECIMAL(10, 2) DEFAULT 0.00,
    data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ÍNDICES PARA DESEMPENHO E PESQUISAS RÁPIDAS
-- ============================================================
CREATE INDEX idx_conta_nome ON conta(nome);
CREATE INDEX idx_utilizador_nif ON utilizadorprefil(nif);
CREATE INDEX idx_consultas_paciente ON consultas(idutilizadorprefil);
CREATE INDEX idx_consultas_data ON consultas(data);
CREATE INDEX idx_notificacao_prefil ON notificacao(prefil);
CREATE INDEX idx_comprovativo_paciente ON comprovativo(idutilizadorprefil);

-- ============================================================
-- DADOS INICIAIS (SEED DATA DE TESTE E CONFIGURAÇÃO)
-- ============================================================

-- Géneros
INSERT INTO generos (designacao) VALUES ('Masculino'), ('Feminino'), ('Outro');

-- Estado Civil
INSERT INTO estadocivil (designacao) VALUES ('Solteiro(a)'), ('Casado(a)'), ('Divorciado(a)'), ('Viúvo(a)');

-- Classe
INSERT INTO classe (designacao) VALUES ('Geral'), ('Prioritário'), ('VIP'), ('Seguradora');

-- Tipos de Conta
INSERT INTO tipoconta (desling) VALUES ('Administrador'), ('Médico'), ('Paciente'), ('Rececionista');

-- Tipos de Marcação / Consulta
INSERT INTO tipomarcacao (desling) VALUES 
('Check-up Geral'), 
('Limpeza Dentária / Destartarização'), 
('Tratamento de Canal (Endodontia)'), 
('Extração Dentária'), 
('Ortodontia (Aparelho)'),
('Branqueamento Dentário'),
('Implante Dentário');

-- Perfis Exemplo
INSERT INTO utilizadorprefil (
    nome, datanascimento, genero, endereco, contactoprincipal, contactosecundario, nif, estadocivil, profissao, numeroutente, subsistemassaude, gmail, classe,
    alergias, medicamentos, condicaosaude, motivoconsultainicial, experienciaanastesia, condicoesdentarias, habitoigieneoral, consumosubstancia, historicotratamentosdentariospassados, historicodor, atividadesdesportivas, bruxismo, gravida, infoadicional, resultadosanteriores
) 
VALUES 
('Dra. Maria Santos', '1985-04-12', 2, 'Rua Central, Viseu', '912345678', '912345679', '211223344', 2, 'Médica Dentista', '100200300', 'SNS', 'maria.santos@clinica.pt', 3,
 'Nenhuma', 'Nenhum', 'Saudável', 'Check-up de rotina profissional', true, 'Nenhuma', 'Escovagem 3x ao dia + Fio Dentário', 'Não', 'Destartarização anual', false, 'Corrida', 'Não tem', false, 'Médica responsável pela clínica', 'Sem lesões detetadas'),

('João Pedro Silva', '1998-08-20', 1, 'Av. Europa, Viseu', '961234567', '961234568', '299887766', 1, 'Engenheiro', '400500600', 'Multicare', 'joao.silva@email.com', 1,
 'Penicilina', 'Ibuprofeno 600mg', 'Sensibilidade dentária em bebidas frias', 'Check-up anual e limpeza', true, 'Restauração antiga no molar superior esquerdo', 'Escovagem 2x ao dia', 'Não', 'Restauração de dente 26 há 2 anos', true, 'Natação', 'Ligeiro bruxismo noturno', false, 'Requer anestesia sem vasoconritor se houver cirurgia', 'Bons resultados em restaurações anteriores'),

('Ana Sofia Martins', '2001-11-05', 2, 'Rua Direita, Porto', '933445566', '933445567', '255443322', 1, 'Estudante', '700800900', 'SNS', 'ana.martins@email.com', 1,
 'Látex', 'Nenhum', 'Nenhuma', 'Ortodontia e colocação de aparelho', false, 'Dentes ligeiramente apinhados', 'Escovagem 2x ao dia', 'Não', 'Extração de sisos inferiores', false, 'Ginásio', 'Não tem', false, 'Em tratamento ortodôntico ativo', 'Evolução positiva da arcada dentária'),

('Carlos Manuel Oliveira', '1990-03-15', 1, 'Rua das Flores, Coimbra', '919876543', '919876540', '234567890', 2, 'Arquiteto', '500600700', 'AdvanceCare', 'carlos.oliveira@email.com', 1,
 'Nenhuma', 'Paracetamol pontual', 'Hipertensão ligeira controlada', 'Dor intensa no dente siso inferior', true, 'Cárie no 3º molar', 'Escovagem 2x ao dia', 'Fumador ocasional', 'Branqueamento dentário há 1 ano', true, 'Futebol', 'Tem bruxismo noturno', false, 'Necessita de goteira de relaxamento', 'Tratamentos anteriores bem sucedidos');

-- Contas Exemplo (passwords de demonstração: 123456)
-- Nota: no backend serão tratadas com hash bcrypt
INSERT INTO conta (nome, password, idtipoconta, idprefil) VALUES 
('admin', '123456', 1, 1),
('dra.maria', '123456', 2, 1),
('joao.silva', '123456', 3, 2),
('ana.martins', '123456', 3, 3);

-- Consultas Exemplo
INSERT INTO consultas (medico, hora, data, falta, estadimarcacao, numerotelemovel, tipomarcacao, detalhes, guia_tratamento, idutilizadorprefil) VALUES 
('Dra. Maria Santos', '10:00:00', CURRENT_DATE + INTERVAL '2 days', FALSE, TRUE, '961234567', 1, 'Check-up anual preventivo', 'Nenhum tratamento urgente necessário.', 2),
('Dra. Maria Santos', '15:30:00', CURRENT_DATE - INTERVAL '5 days', FALSE, TRUE, '933445566', 2, 'Destartarização e polimento', 'Recomendada escovagem com pasta dessensibilizante.', 3);

-- Notificações Exemplo
INSERT INTO notificacao (prefil, titulo, descricao, visto) VALUES 
(2, 'Lembrete de Consulta', 'A sua consulta de Check-up está agendada para daqui a 2 dias às 10:00.', FALSE),
(3, 'Consulta Concluída', 'Obrigado por visitar a nossa clínica. O seu comprovativo de presença já se encontra disponível.', TRUE);

-- Comprovativos Exemplo
INSERT INTO comprovativo (idconsulta, idutilizadorprefil, tipo_documento, titulo, ficheiro_path, valor) VALUES 
(2, 3, 'Comprovativo de Presença', 'Comprovativo de Consulta - 20/07/2026', '/uploads/comprovativo_consulta_2.pdf', 0.00),
(2, 3, 'Fatura / Recibo', 'Fatura Nº FT2026/001', '/uploads/fatura_FT2026_001.pdf', 45.00);
