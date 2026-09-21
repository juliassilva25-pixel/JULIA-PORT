console.log("ATIVIDADES.JS FOI CARREGADO!");

const MATERIA = document.body.dataset.materia || "";

const CHAVE_REMOVIDAS = "atividades_removidas";

function obterRemovidas() {

    try {

        return JSON.parse(localStorage.getItem(CHAVE_REMOVIDAS)) || [];

    } catch (e) {

        return [];
    }
}

function adicionarRemovida(identificador) {

    const removidas = obterRemovidas();

    if (removidas.indexOf(identificador) === -1) {

        removidas.push(identificador);

        localStorage.setItem(CHAVE_REMOVIDAS, JSON.stringify(removidas));
    }
}

function criarBotaoRemover() {

    const botao = document.createElement("button");

    botao.type = "button";

    botao.className = "btn-remover";

    botao.title = "Remover atividade";

    botao.setAttribute("aria-label", "Remover atividade");

    botao.textContent = "×";

    return botao;
}

function removerCard(card) {

    const id = card.dataset.id;

    if (id) {

        deletarAtividade(id)

            .then(function () {
                card.remove();
            })

            .catch(function (erro) {
                console.error("ERRO AO REMOVER ATIVIDADE:", erro);
            });

    } else {

        const titulo = card.querySelector("h2");

        if (titulo) {

            adicionarRemovida(titulo.textContent);
        }

        card.remove();
    }
}

function prepararCardsComRemover() {

    const cards = document.querySelectorAll(".card");

    cards.forEach(function (card) {

        if (card.dataset.id) return;

        const titulo = card.querySelector("h2");

        if (titulo && obterRemovidas().indexOf(titulo.textContent) !== -1) {

            card.remove();

        } else if (!card.querySelector(".btn-remover")) {

            const botao = criarBotaoRemover();

            botao.addEventListener("click", function () {
                removerCard(card);
            });

            card.appendChild(botao);
        }
    });
}

document.addEventListener("DOMContentLoaded", prepararCardsComRemover);

function formatarData(data) {

    if (!data) return "";

    const partes = String(data).split("-");

    if (partes.length === 3) {
        return partes[2] + "/" + partes[1];
    }

    return data;
}

function caminhoImagem(imagem) {

    if (!imagem) return "";

    if (imagem.indexOf("http") === 0) {
        return imagem;
    }

    if (imagem.indexOf("data:") === 0) {
        return imagem;
    }

    return "./IMG PORTIFÓLIO/" + imagem;
}

function criarCard(atividade) {

    const card = document.createElement("article");
    card.className = "card";
    card.dataset.id = atividade.id;

    const botaoRemover = criarBotaoRemover();

    botaoRemover.addEventListener("click", function () {
        removerCard(card);
    });

    card.appendChild(botaoRemover);

    const imagemDiv = document.createElement("div");
    imagemDiv.className = "imagem";

    const imagem = document.createElement("img");
    imagem.src = caminhoImagem(atividade.imagem);
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

        if (!supabaseConfigurado()) {

            console.warn("Supabase não configurado. Preencha supabase-config.js");
            return;
        }

        console.log("Buscando atividades para:", MATERIA);

        const atividades = await listarAtividades();

        const secoes = document.querySelectorAll(".projetos");

        secoes.forEach(function (secao) {

            const main = secao.closest("main");

            if (!main) return;

            const numero = main.querySelector(".cabecalho-eixo h1 span");

            if (!numero) return;

            const numeroEixo = numero.textContent.trim();

            const atividadesDoEixo = atividades.filter(function (item) {
                return item.eixo === MATERIA
                    && String(item.numero_eixo) === String(numeroEixo);
            });

            atividadesDoEixo.forEach(function (atividade) {

                if (secao.querySelector('[data-id="' + atividade.id + '"]')) return;

                secao.appendChild(criarCard(atividade));
            });
        });

        rolarParaEixoQuandoSolicitado();

    } catch (erro) {

        console.error("ERRO AO BUSCAR ATIVIDADES:", erro);
    }
}

function rolarParaEixo(numero) {

    if (!numero) return;

    const cabecalhos = document.querySelectorAll(".cabecalho-eixo");

    for (let i = 0; i < cabecalhos.length; i++) {

        const span = cabecalhos[i].querySelector("h1 span");

        if (span && span.textContent.trim() === String(numero)) {

            cabecalhos[i].scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            break;
        }
    }
}

function rolarParaEixoQuandoSolicitado() {

    const eixoParam = new URLSearchParams(window.location.search).get("eixo");

    if (!eixoParam) return;

    rolarParaEixo(eixoParam);
}

let rolagemInicial = false;

async function carregarErolarInicial() {

    await carregarAtividades();

    if (!rolagemInicial) {

        rolarParaEixoQuandoSolicitado();
        rolagemInicial = true;
    }
}

if (MATERIA) {

    carregarErolarInicial();

    window.addEventListener("focus", function () {
        carregarAtividades();
    });
}