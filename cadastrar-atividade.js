console.log("CADASTRAR-ATIVIDADE.JS FOI CARREGADO!");

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

formulario.addEventListener("submit", async function (event) {

    event.preventDefault();

    mensagem.textContent = "Enviando...";
    mensagem.style.color = "black";

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

    const formData = new FormData();
    formData.append("eixo", eixo);
    formData.append("numero_eixo", numero_eixo);
    formData.append("data", data);
    formData.append("nome", nome);
    formData.append("imagem", imagem);

    try {

        console.log("Enviando atividade...", nome);

        const resposta = await fetch(
            "http://127.0.0.1:3000/atividades",
            {
                method: "POST",
                body: formData
            }
        );

        const dados = await resposta.json();

        console.log("Resposta do servidor:", dados);

        if (dados.sucesso) {
            mensagem.textContent = "Atividade cadastrada com sucesso!";
            mensagem.style.color = "green";
            formulario.reset();
            preview.hidden = true;
            previewImg.src = "";
        } else {
            mensagem.textContent = dados.mensagem;
            mensagem.style.color = "red";
        }

    } catch (erro) {

        console.error("ERRO:", erro);

        mensagem.textContent = "Erro ao conectar com o servidor.";
        mensagem.style.color = "red";
    }
});

function limparForm() {

    formulario.reset();
    preview.hidden = true;
    previewImg.src = "";
    mensagem.textContent = "";
}