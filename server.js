const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

const PORT = 3000;


app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));




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




app.listen(PORT, "127.0.0.1", function () {

    console.log("=================================");
    console.log("🚀 SERVIDOR RODANDO");
    console.log("=================================");
    console.log("http://127.0.0.1:3000");
    console.log("=================================");

});