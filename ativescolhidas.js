console.log("ATIVESCOLHIDAS.JS FOI CARREGADO!");

const DISCIPLINAS = [
    { nome: "Linguagens", materia: "Linguagens", icone: "fa-feather-pointed", eixos: 4 },
    { nome: "Matemática", materia: "Matemática", icone: "fa-calculator", eixos: 4 },
    { nome: "Humanas", materia: "Humanas", icone: "fa-landmark", eixos: 4 },
    { nome: "Natureza", materia: "Natureza", icone: "fa-flask", eixos: 4 },
    { nome: "SENAI", materia: "SENAI", icone: "fa-industry", eixos: 4 }
];

let materiaAtual = null;
let posicaoAtual = 0;

const atividadesCache = {};

let canalAtividadesGlobal = null;

const telaDisciplinas = document.getElementById("tela-disciplinas");
const telaCarrossel = document.getElementById("tela-carrossel");
const gradeDisciplinas = document.getElementById("gradeDisciplinas");
const trilhoCarrossel = document.getElementById("trilhoCarrossel");
const carrosselMateria = document.getElementById("carrosselMateria");
const carrosselTitulo = document.getElementById("carrosselTitulo");
const indicadorEixo = document.getElementById("indicadorEixo");
const setaEsq = document.getElementById("setaEsq");
const setaDir = document.getElementById("setaDir");

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

    if (imagem.indexOf("http") === 0 ||
        imagem.indexOf("data:") === 0 ||
        imagem.indexOf("/") !== -1) {
        return imagem;
    }

    return "./IMG PORTIFÓLIO/" + imagem;
}

/* =========================
   DESTAQUE (banco de dados + tempo real)
========================= */

function conectarTempoReal() {

    if (!window.supabase) {

        console.warn("supabase-js não carregado. Tempo real não ativado.");
        return;
    }

    if (canalAtividadesGlobal) return;

    const cliente = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    canalAtividadesGlobal = cliente
        .channel("destaque-atividades-global")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "atividades"
            },
            function () {

                setTimeout(recarregarEixosDoMateria, 150);
            }
        )
        .subscribe();
}

function recarregarEixosDoMateria() {

    if (!materiaAtual) return;

    const slides = trilhoCarrossel.querySelectorAll(".slide");

    slides.forEach(function (slide) {

        const chave = chaveCache(materiaAtual, slide.dataset.eixo);

        delete atividadesCache[chave];

        carregarAtividadesDoEixo(slide, materiaAtual, slide.dataset.eixo);
    });
}

/* =========================
   CARDS
========================= */

function criarCardDestaque(atividade, slide) {

    const card = document.createElement("article");
    card.className = "destaque-card";

    const badge = document.createElement("span");
    badge.className = "destaque-badge";
    badge.textContent = "★ Em destaque";

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

    const legenda = document.createElement("p");
    legenda.textContent = "Atividade em destaque do " +
        slide.querySelector(".slide-cabecalho h2").textContent;

    conteudo.appendChild(badge);
    conteudo.appendChild(data);
    conteudo.appendChild(titulo);
    conteudo.appendChild(legenda);

    card.appendChild(imagemDiv);
    card.appendChild(conteudo);

    return card;
}

function criarOpcao(atividade, slide, selecionada) {

    const opcao = document.createElement("div");
    opcao.className = "opcao";
    opcao.tabIndex = 0;
    opcao.dataset.id = atividade.id;
    opcao.setAttribute("role", "button");
    opcao.title = "Destacar: " + atividade.nome;

    if (selecionada) {
        opcao.classList.add("selecionada");
    }

    const botaoRemover = document.createElement("button");
    botaoRemover.type = "button";
    botaoRemover.className = "btn-remover";
    botaoRemover.title = "Remover atividade";
    botaoRemover.setAttribute("aria-label", "Remover atividade");
    botaoRemover.textContent = "×";

    botaoRemover.addEventListener("click", function (event) {
        event.stopPropagation();
        removerAtividade(atividade, slide);
    });

    const marca = document.createElement("span");
    marca.className = "marca-destaque";
    marca.textContent = "★";
    marca.title = "Atividade em destaque";

    const imagem = document.createElement("img");
    imagem.src = caminhoImagem(atividade.imagem);
    imagem.alt = atividade.nome;
    imagem.loading = "lazy";

    const nome = document.createElement("span");
    nome.className = "opcao-nome";
    nome.textContent = atividade.nome;

    opcao.appendChild(botaoRemover);

    if (selecionada) {
        opcao.appendChild(marca);
    }

    opcao.appendChild(imagem);
    opcao.appendChild(nome);

    opcao.addEventListener("click", function () {
        selecionarDestaque(slide, atividade.id);
    });

    opcao.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selecionarDestaque(slide, atividade.id);
        }
    });

    return opcao;
}

function removerAtividade(atividade, slide) {

    if (!confirm("Remover a atividade \"" + atividade.nome + "\"?")) return;

    deletarAtividade(atividade.id)
        .then(function () {

            const materia = materiaAtual;
            const eixo = slide.dataset.eixo;

            delete atividadesCache[chaveCache(materia, eixo)];

            carregarAtividadesDoEixo(slide, materia, eixo);
        })
        .catch(function (erro) {
            console.error("ERRO AO REMOVER ATIVIDADE:", erro);
        });
}

/* =========================
   CARREGAR ATIVIDADES
========================= */

function chaveCache(materia, eixo) {
    return materia + "::" + eixo;
}

async function carregarAtividadesDoEixo(slide, materia, numeroEixo) {

    let atividades = null;

    try {

        if (supabaseConfigurado()) {
            atividades = await listarAtividades();
        } else {
            console.warn("Supabase não configurado.");
            atividades = [];
        }

    } catch (erro) {
        console.error("ERRO AO BUSCAR ATIVIDADES:", erro);
        atividades = [];
    }

    const doEixo = atividades.filter(function (item) {
        return item.eixo === materia &&
            String(item.numero_eixo) === String(numeroEixo);
    });

    atividadesCache[chaveCache(materia, numeroEixo)] = doEixo;

    renderizarSlide(slide, materia, numeroEixo, doEixo);
}

function renderizarSlide(slide, materia, numeroEixo, atividades) {

    const destaque = slide.querySelector(".destaque");
    const opcoes = slide.querySelector(".opcoes");

    const escolhida = atividades.find(function (item) {
        return item.destaque === true;
    });

    destaque.innerHTML = "";

    if (!atividades.length) {

        const vazio = document.createElement("div");
        vazio.className = "destaque-vazio";
        vazio.innerHTML = '<i class="fa-solid fa-star"></i>' +
            '<p>Nenhuma atividade neste eixo ainda.<br>Cadastre a primeira abaixo.</p>';
        destaque.appendChild(vazio);

        opcoes.hidden = true;
        return;
    }

    opcoes.hidden = false;

    if (escolhida) {

        destaque.appendChild(criarCardDestaque(escolhida, slide));

    } else {

        const vazio = document.createElement("div");
        vazio.className = "destaque-vazio";
        vazio.innerHTML = '<i class="fa-solid fa-star"></i>' +
            '<p>Escolha uma atividade abaixo para deixá-la em destaque.</p>';
        destaque.appendChild(vazio);
    }

    opcoes.innerHTML = "";

    atividades.forEach(function (item) {

        const selecionada = escolhida &&
            String(item.id) === String(escolhida.id);

        opcoes.appendChild(criarOpcao(item, slide, selecionada));
    });
}

function selecionarDestaque(slide, id) {

    const materia = materiaAtual;
    const eixo = slide.dataset.eixo;

    const atividades = atividadesCache[chaveCache(materia, eixo)] || [];

    const atividadesDoEixo = atividades.filter(function (item) {
        return item.eixo === materia &&
            String(item.numero_eixo) === String(eixo);
    });

    atividades.forEach(function (item) {
        item.destaque = String(item.id) === String(id);
    });

    renderizarSlide(slide, materia, eixo, atividades);

    const atualizacoes = atividadesDoEixo.map(function (item) {
        return atualizarDestaque(item.id, String(item.id) === String(id));
    });

    Promise.all(atualizacoes)
        .then(function () {

            delete atividadesCache[chaveCache(materia, eixo)];

            carregarAtividadesDoEixo(slide, materia, eixo);

        })
        .catch(function (erro) {

            console.error("ERRO AO DEFINIR DESTAQUE:", erro);

            alert(
                "Não foi possível salvar o destaque. \n" +
                "Verifique se a coluna 'destaque' foi criada no Supabase " +
                "(rode o supabase.sql novamente)."
            );

            updateCarregarDoBanco(slide, materia, eixo);
        });
}

function updateCarregarDoBanco(slide, materia, eixo) {

    delete atividadesCache[chaveCache(materia, eixo)];

    carregarAtividadesDoEixo(slide, materia, eixo);
}

/* =========================
   ESTRUTURA DO CARROSSEL
========================= */

function montarSlide(numeroEixo) {

    const slide = document.createElement("div");
    slide.className = "slide";
    slide.dataset.eixo = numeroEixo;

    const cabecalho = document.createElement("div");
    cabecalho.className = "slide-cabecalho";

    const mini = document.createElement("p");
    mini.className = "mini-titulo";
    mini.textContent = "PORTFÓLIO • " + materiaAtual;

    const titulo = document.createElement("h2");
    titulo.textContent = "EIXO " + numeroEixo;

    cabecalho.appendChild(mini);
    cabecalho.appendChild(titulo);
    slide.appendChild(cabecalho);

    const destaque = document.createElement("div");
    destaque.className = "destaque";
    slide.appendChild(destaque);

    const opcoes = document.createElement("div");
    opcoes.className = "opcoes";

    const opcoesTitulo = document.createElement("p");
    opcoesTitulo.className = "opcoes-titulo";
    opcoesTitulo.textContent = "Escolher atividade em destaque";

    opcoes.appendChild(opcoesTitulo);

    const opcoesLista = document.createElement("div");
    opcoesLista.className = "opcoes-lista";
    opcoes.appendChild(opcoesLista);

    slide.appendChild(opcoes);

    const detalhes = document.createElement("details");
    detalhes.className = "cadastro-box";

    const summary = document.createElement("summary");
    summary.textContent = "Cadastrar nova atividade";
    detalhes.appendChild(summary);

    const form = document.createElement("form");
    form.className = "form-atividade-inline";
    form.enctype = "multipart/form-data";

    const oculto = document.createElement("input");
    oculto.type = "hidden";
    oculto.name = "numero_eixo";
    oculto.value = numeroEixo;

    const campos = document.createElement("div");
    campos.className = "campos-inline";

    const campoData = montarCampo({
        label: "Data",
        campo: document.createElement("input"),
        inputType: "date",
        name: "data"
    });

    campos.appendChild(campoData.container);

    const campoNome = montarCampo({
        label: "Nome da atividade",
        campo: document.createElement("input"),
        inputType: "text",
        name: "nome",
        placeholder: "Ex.: Mapa mental"
    });

    campos.appendChild(campoNome.container);

    const campoImagem = montarCampo({
        label: "Imagem da atividade",
        campo: document.createElement("input"),
        inputType: "file",
        name: "imagem"
    });

    campos.appendChild(campoImagem.container);

    form.appendChild(oculto);
    form.appendChild(campos);

    const botao = document.createElement("button");
    botao.type = "submit";
    botao.className = "btn-salvar-inline";
    botao.textContent = "Salvar atividade";
    form.appendChild(botao);

    const msg = document.createElement("p");
    msg.className = "msg-form";
    form.appendChild(msg);

    detalhes.appendChild(form);
    slide.appendChild(detalhes);

    vincularFormulario(form, msg, numeroEixo, slide);

    return slide;
}

function montarCampo(opcoes) {

    const container = document.createElement("div");
    container.className = "campo-inline";

    const label = document.createElement("label");
    label.textContent = opcoes.label;
    label.setAttribute("for", opcoes.name + "-" + Math.random().toString(36).slice(2, 7));

    const campo = opcoes.campo;
    campo.id = label.getAttribute("for");
    campo.name = opcoes.name;
    campo.type = opcoes.inputType;
    campo.required = true;

    if (opcoes.placeholder) {
        campo.placeholder = opcoes.placeholder;
    }

    if (opcoes.inputType === "file") {
        campo.accept = "image/*";
    }

    container.appendChild(label);
    container.appendChild(campo);

    const resultado = {
        container: container,
        campo: campo
    };

    if (opcoes.inputType === "file") {

        const preview = document.createElement("div");
        preview.className = "preview-inline";
        preview.hidden = true;
        container.appendChild(preview);

        resultado.preview = preview;
    }

    return resultado;
}

function vincularFormulario(form, msg, numeroEixo, slide) {

    const fileInput = form.querySelector('input[type="file"]');
    const preview = form.querySelector(".preview-inline");

    fileInput.addEventListener("change", function () {

        const arquivo = fileInput.files[0];

        if (!arquivo) {
            preview.hidden = true;
            preview.innerHTML = "";
            return;
        }

        const leitor = new FileReader();

        leitor.onload = function (e) {

            preview.innerHTML = "";

            const img = document.createElement("img");
            img.src = e.target.result;
            img.alt = "Prévia da imagem";

            preview.appendChild(img);
            preview.hidden = false;
        };

        leitor.readAsDataURL(arquivo);
    });

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        msg.textContent = "Enviando...";
        msg.style.color = "black";

        if (!supabaseConfigurado()) {

            msg.textContent = "Supabase ainda não configurado.";
            msg.style.color = "red";
            return;
        }

        const data = form.querySelector('input[name="data"]').value;
        const nome = form.querySelector('input[name="nome"]').value.trim();
        const imagem = fileInput.files[0];

        if (!data || nome === "" || !imagem) {

            msg.textContent = "Preencha todos os campos e selecione a imagem.";
            msg.style.color = "red";
            return;
        }

        cadastrarAtividadeComImagem(
            {
                eixo: materiaAtual,
                numero_eixo: Number(numeroEixo),
                data: data,
                nome: nome
            },
            imagem
        ).then(function () {

            msg.textContent = "Atividade cadastrada com sucesso!";
            msg.style.color = "green";

            form.reset();
            preview.hidden = true;
            preview.innerHTML = "";

            delete atividadesCache[chaveCache(materiaAtual, numeroEixo)];

            carregarAtividadesDoEixo(slide, materiaAtual, numeroEixo);

        }).catch(function (erro) {

            console.error("ERRO:", erro);

            msg.textContent = "Erro ao cadastrar: " + erro.message;
            msg.style.color = "red";
        });
    });
}

/* =========================
   SELEÇÃO DE DISCIPLINA
========================= */

function montarGradeDisciplinas() {

    DISCIPLINAS.forEach(function (disciplina) {

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "disciplina-card";

        const icone = document.createElement("span");
        icone.className = "icone-disc";
        icone.innerHTML = '<i class="fa-solid ' + disciplina.icone + '"></i>';

        const nome = document.createElement("strong");
        nome.textContent = disciplina.nome;

        const eixoInfo = document.createElement("small");
        eixoInfo.textContent = disciplina.eixos + " eixos";

        botao.appendChild(icone);
        botao.appendChild(nome);
        botao.appendChild(eixoInfo);

        botao.addEventListener("click", function () {
            selecionarDisciplina(disciplina);
        });

        gradeDisciplinas.appendChild(botao);
    });
}

function selecionarDisciplina(disciplina) {

    materiaAtual = disciplina.materia;
    posicaoAtual = 0;

    document.body.dataset.materia = disciplina.materia;

    construirCarrossel(disciplina.eixos);

    carrosselMateria.textContent = "Portfólio • " + disciplina.nome;

    telaDisciplinas.hidden = true;
    telaCarrossel.hidden = false;

    conectarTempoReal();

    rolarParaTopo();
}

function construirCarrossel(totalEixos) {

    trilhoCarrossel.innerHTML = "";
    indicadorEixo.innerHTML = "";

    const linha = document.createElement("div");
    linha.className = "trilho-linha";
    linha.id = "trilhoLinha";

    for (let i = 1; i <= totalEixos; i++) {

        const slide = montarSlide(i);

        linha.appendChild(slide);
        carregarAtividadesDoEixo(slide, materiaAtual, i);

        const ponto = document.createElement("button");
        ponto.type = "button";
        ponto.className = "ponto";
        ponto.title = "Eixo " + i;
        ponto.setAttribute("aria-label", "Ir para o eixo " + i);

        ponto.addEventListener("click", function () {
            irParaEixo(i - 1);
        });

        indicadorEixo.appendChild(ponto);
    }

    trilhoCarrossel.appendChild(linha);

    atualizarCarrossel();
}

function irParaEixo(posicao) {

    const total = totalEixosAtual();

    posicaoAtual = Math.max(0, Math.min(posicao, total - 1));

    atualizarCarrossel();
}

function totalEixosAtual() {

    return trilhoCarrossel.querySelectorAll(".slide").length;
}

function atualizarCarrossel() {

    const linha = document.getElementById("trilhoLinha");

    if (!linha) return;

    linha.style.transform = "translateX(-" + (posicaoAtual * 100) + "%)";

    const numero = posicaoAtual + 1;

    carrosselTitulo.innerHTML = "EIXO <span>" + numero + "</span>";

    const total = totalEixosAtual();

    setaEsq.disabled = posicaoAtual === 0;
    setaDir.disabled = posicaoAtual === total - 1;

    const pontos = indicadorEixo.querySelectorAll(".ponto");

    pontos.forEach(function (ponto, index) {
        ponto.classList.toggle("ativo", index === posicaoAtual);
    });
}

function rolarParaTopo() {

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================
   EVENTOS
========================= */

setaEsq.addEventListener("click", function () {
    irParaEixo(posicaoAtual - 1);
});

setaDir.addEventListener("click", function () {
    irParaEixo(posicaoAtual + 1);
});

document.getElementById("btnTrocarDisciplina").addEventListener("click", function () {

    telaCarrossel.hidden = true;
    telaDisciplinas.hidden = false;

    rolarParaTopo();
});

/* re-carregar ao focar a aba */
window.addEventListener("focus", function () {

    recarregarEixosDoMateria();
});

montarGradeDisciplinas();