const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = 3000;

const PASTA_IMAGENS = path.join(__dirname, "IMG PORTIFÓLIO");

if (!fs.existsSync(PASTA_IMAGENS)) {
    fs.mkdirSync(PASTA_IMAGENS, { recursive: true });
}

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, PASTA_IMAGENS);
        },
        filename: function (req, file, cb) {
            const limpo = file.originalname
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9._-]/g, "_");
            cb(null, Date.now() + "-" + limpo);
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }
});


app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static(__dirname));




const banco = mysql.createConnection({

    host: "127.0.0.1",
    user: "root",
    password: "12345",
    database: "portfo"

});


banco.connect(function (erro) {

    if (erro) {

        console.log("❌ ERRO AO CONECTAR AO MYSQL");
        console.log(erro.message);

        return;
    }

    console.log("=================================");
    console.log("✅ MYSQL CONECTADO!");
    console.log("=================================");

});




app.get("/teste", function (req, res) {

    console.log("✅ TESTE RECEBIDO");

    res.status(200).json({

        sucesso: true,

        mensagem: "Servidor funcionando!"

    });

});


app.post("/login", function (req, res) {

    console.log("");
    console.log("=================================");
    console.log("📥 LOGIN RECEBIDO PELO SERVIDOR");
    console.log("=================================");


    const usuario = req.body.usuario;
    const senha = req.body.senha;


    console.log("Usuário recebido:", usuario);


    if (!usuario || !senha) {

        console.log("❌ Usuário ou senha vazios");

        return res.status(400).json({

            sucesso: false,

            mensagem: "Preencha usuário e senha."

        });

    }


    const sql = `
        SELECT id, usuario, tipo
        FROM usuarios
        WHERE usuario = ?
        AND senha = ?
    `;


    banco.query(
        sql,
        [usuario, senha],
        function (erro, resultado) {

            if (erro) {

                console.log("❌ ERRO NO MYSQL");
                console.log(erro.message);

                return res.status(500).json({

                    sucesso: false,

                    mensagem: "Erro ao consultar o banco."

                });

            }


            console.log(
                "Quantidade de usuários encontrados:",
                resultado.length
            );


            if (resultado.length === 0) {

                console.log("❌ USUÁRIO OU SENHA INCORRETOS");

                return res.status(401).json({

                    sucesso: false,

                    mensagem: "Usuário ou senha incorretos."

                });

            }


            const dados = resultado[0];


            console.log("=================================");
            console.log("✅ LOGIN CORRETO!");
            console.log("Usuário:", dados.usuario);
            console.log("Tipo:", dados.tipo);
            console.log("=================================");


            return res.status(200).json({

                sucesso: true,

                mensagem: "Login realizado com sucesso!",

                id: dados.id,

                usuario: dados.usuario,

                tipo: dados.tipo

            });

        }
    );

});




app.get("/atividades", function (req, res) {

    console.log("📥 LISTA DE ATIVIDADES SOLICITADA");

    const sql = `
        SELECT id, eixo, numero_eixo, DATE_FORMAT(data, '%Y-%m-%d') AS data, nome, imagem
        FROM atividades
        ORDER BY data ASC, id ASC
    `;

    banco.query(sql, function (erro, resultado) {

        if (erro) {
            console.log("❌ ERRO AO BUSCAR ATIVIDADES");
            console.log(erro.message);

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao buscar as atividades."
            });
        }

        console.log("Atividades encontradas:", resultado.length);

        return res.status(200).json({
            sucesso: true,
            atividades: resultado
        });
    });
});


app.post("/atividades", upload.single("imagem"), function (req, res) {

    console.log("📥 CADASTRO DE ATIVIDADE RECEBIDO");

    const eixo = req.body.eixo;
    const numero_eixo = req.body.numero_eixo;
    const data = req.body.data;
    const nome = req.body.nome;
    const imagem = req.file ? req.file.filename : null;

    if (!eixo || !numero_eixo || !data || !nome) {
        console.log("❌ CAMPOS OBRIGATÓRIOS FALTANDO");

        return res.status(400).json({
            sucesso: false,
            mensagem: "Preencha todos os campos."
        });
    }

    if (!imagem) {
        console.log("❌ IMAGEM NÃO ENVIADA");

        return res.status(400).json({
            sucesso: false,
            mensagem: "Envie uma imagem para a atividade."
        });
    }

    const sql = `
        INSERT INTO atividades (eixo, numero_eixo, data, nome, imagem)
        VALUES (?, ?, ?, ?, ?)
    `;

    banco.query(
        sql,
        [eixo, numero_eixo, data, nome, imagem],
        function (erro, resultado) {

            if (erro) {
                console.log("❌ ERRO AO CADASTRAR ATIVIDADE");
                console.log(erro.message);

                return res.status(500).json({
                    sucesso: false,
                    mensagem: "Erro ao salvar a atividade no banco."
                });
            }

            console.log("=================================");
            console.log("✅ ATIVIDADE CADASTRADA!");
            console.log("ID:", resultado.insertId);
            console.log("Eixo:", eixo, "- Nº", numero_eixo);
            console.log("Nome:", nome);
            console.log("Imagem:", imagem);
            console.log("=================================");

            return res.status(201).json({
                sucesso: true,
                mensagem: "Atividade cadastrada com sucesso!",
                id: resultado.insertId
            });
        }
    );
});


app.listen(PORT, "127.0.0.1", function () {

    console.log("=================================");
    console.log("🚀 SERVIDOR RODANDO");
    console.log("=================================");
    console.log("http://127.0.0.1:3000");
    console.log("=================================");

});