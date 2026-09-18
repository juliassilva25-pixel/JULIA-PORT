console.log("CADASTRAR-ATIVIDADE.JS FOI CARREGADO!");

const ARQUIVOS = {
    "Linguagens": "linguagens.html",
    "Humanas": "humanas.html",
    "Matemática": "matematica.html",
    "Natureza": "natureza.html",
    "SENAI": "SENAI.html"
};

const formulario = document.getElementById("formAtividade");
const mensagem = document.getElementById("mensagem");
const imagemInput = document.getElementById("imagem");
const preview = document.getElementById("preview");
const previewImg = document.getElementById("previewImg");

imagemInput.addEventListener("change", function () {

    const arquivo = imagemInput.files[0];

    if (!arquivo) {
        preview.hidden = true;
        previewImg.src = "";
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function (e) {
        previewImg.src = e.target.result;
        preview.hidden = false;
    };

    leitor.readAsDataURL(arquivo);
});

function verificarConfiguracao() {

    if (supabaseConfigurado()) return true;

    mensagem.textContent =
        "Supabase ainda não configurado. Siga o guia configurar-supabase.txt.";
    mensagem.style.color = "red";

    return false;
}

formulario.addEventListener("submit", function (event) {

    event.preventDefault();

    mensagem.textContent = "Enviando...";
    mensagem.style.color = "black";

    if (!verificarConfiguracao()) return;

    const eixo = document.getElementById("eixo").value;
    const numero_eixo = document.getElementById("numero_eixo").value;
    const data = document.getElementById("data").value;
    const nome = document.getElementById("nome").value.trim();
    const imagem = imagemInput.files[0];

    if (!eixo || !numero_eixo || !data || nome === "" || !imagem) {

        mensagem.textContent = "Preencha todos os campos e selecione a imagem.";
        mensagem.style.color = "red";

        return;
    }

    cadastrarAtividadeComImagem(
        {
            eixo: eixo,
            numero_eixo: Number(numero_eixo),
            data: data,
            nome: nome
        },
        imagem
    ).then(function () {

        mensagem.textContent = "Atividade cadastrada! Redirecionando...";
        mensagem.style.color = "green";

        const destino = ARQUIVOS[eixo] || "indexx.html";

        setTimeout(function () {
            window.location.href = destino + "?eixo=" + numero_eixo;
        }, 900);

    }).catch(function (erro) {

        console.error("ERRO:", erro);

        mensagem.textContent = "Erro ao cadastrar: " + erro.message;
        mensagem.style.color = "red";
    });
});

function limparForm() {

    formulario.reset();
    preview.hidden = true;
    previewImg.src = "";
    mensagem.textContent = "";
}