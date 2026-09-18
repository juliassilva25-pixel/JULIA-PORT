console.log("ATIVIDADES.JS FOI CARREGADO!");

const MATERIA = document.body.dataset.materia || "";

function formatarData(data) {

    if (!data) return "";

    const partes = data.split("-");

    if (partes.length === 3) {
        return partes[2] + "/" + partes[1];
    }

    return data;
}

function criarCard(atividade) {

    const card = document.createElement("article");
    card.className = "card";

    const imagemDiv = document.createElement("div");
    imagemDiv.className = "imagem";

    const imagem = document.createElement("img");
    imagem.src = "./IMG PORTIFÓLIO/" + atividade.imagem;
    imagem.alt = atividade.nome;
    imagem.loading = "lazy";

    imagemDiv.appendChild(imagem);

    const conteudo = document.createElement("div");
    conteudo.className = "card-conteudo";

    const data = document.createElement("span");
    data.className = "data";
    data.textContent = formatarData(atividade.data);

    const titulo = document.createElement("h2");
    titulo.textContent = atividade.nome;

    conteudo.appendChild(data);
    conteudo.appendChild(titulo);

    card.appendChild(imagemDiv);
    card.appendChild(conteudo);

    return card;
}

async function carregarAtividades() {

    try {

        console.log("Buscando atividades para:", MATERIA);

        const resposta = await fetch("http://127.0.0.1:3000/atividades");

        const dados = await resposta.json();

        if (!dados.sucesso) return;

        const secoes = document.querySelectorAll(".projetos");

        secoes.forEach(function (secao) {

            const main = secao.closest("main");

            if (!main) return;

            const numero = main.querySelector(".cabecalho-eixo h1 span");

            if (!numero) return;

            const numeroEixo = numero.textContent.trim();

            const atividades = dados.atividades.filter(function (item) {
                return item.eixo === MATERIA
                    && String(item.numero_eixo) === String(numeroEixo);
            });

            atividades.forEach(function (atividade) {
                secao.appendChild(criarCard(atividade));
            });
        });

    } catch (erro) {

        console.error("ERRO AO BUSCAR ATIVIDADES:", erro);
    }
}

if (MATERIA) {
    carregarAtividades();
}