
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