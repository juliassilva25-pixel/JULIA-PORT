
CREATE DATABASE portfo;

USE portfo;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('aluna', 'professores') NOT NULL
);

INSERT INTO usuarios (usuario, senha, tipo)VALUES
('jusantos', '123', 'aluna'),
('prof@gmail.com', '1234', 'professores');

SELECT * FROM usuarios;

CREATE TABLE atividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eixo VARCHAR(50) NOT NULL,
    numero_eixo INT NOT NULL,
    data DATE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    imagem VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM atividades;