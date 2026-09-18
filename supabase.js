console.log("SUPABASE.JS FOI CARREGADO!");

const SUPABASE_BUCKET = "atividades-imagens";

function supabaseConfigurado() {

    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function supabaseBase() {

    return String(SUPABASE_URL).replace(/\/+$/, "");
}

function limparNomeArquivo(nome) {

    return String(nome)

        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-");
}

function supabaseHeaders() {

    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + SUPABASE_ANON_KEY
    };
}

async function listarAtividades() {

    if (!supabaseConfigurado()) {

        console.warn("Supabase não configurado. Preencha supabase-config.js");
        return [];
    }

    const url = supabaseBase() +
        "/rest/v1/atividades?select=*&order=data.asc,id.asc";

    const resposta = await fetch(url, {
        headers: supabaseHeaders()
    });

    if (!resposta.ok) {

        throw new Error("Erro ao listar atividades: " + resposta.status);
    }

    return await resposta.json();
}

async function enviarImagemAtividade(arquivo) {

    if (!supabaseConfigurado()) {

        throw new Error("Supabase não configurado.");
    }

    const nome = Date.now() + "-" + limparNomeArquivo(arquivo.name);

    const url = supabaseBase() +
        "/storage/v1/object/" +
        SUPABASE_BUCKET + "/" +
        nome;

    const resposta = await fetch(url, {

        method: "POST",

        headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": "Bearer " + SUPABASE_ANON_KEY,
            "Content-Type": arquivo.type || "application/octet-stream",
            "x-upsert": "true"
        },

        body: arquivo
    });

    if (!resposta.ok) {

        let detalhe = "";

        try { detalhe = await resposta.text(); } catch (e) { }

        const dica = detalhe.indexOf("PGRST125") >= 0
            ? " Verifique se o bucket '" + SUPABASE_BUCKET +
              "' existe (Storage) e se a Parte 2 do supabase.sql foi executada."
            : "";

        throw new Error(
            "Erro ao enviar a imagem (" + resposta.status + "): " +
            detalhe + " | URL: " + url + dica
        );
    }

    return supabaseBase() +
        "/storage/v1/object/public/" +
        SUPABASE_BUCKET + "/" +
        nome;
}

async function inserirAtividade(dados) {

    if (!supabaseConfigurado()) {

        throw new Error("Supabase não configurado.");
    }

    const url = supabaseBase() + "/rest/v1/atividades";

    const resposta = await fetch(url, {

        method: "POST",

        headers: Object.assign(supabaseHeaders(), {
            "Content-Type": "application/json"
        }),

        body: JSON.stringify(dados)
    });

    if (!resposta.ok) {

        let detalhe = "";

        try { detalhe = await resposta.text(); } catch (e) { }

        throw new Error("Erro ao cadastrar atividade (" + resposta.status + "): " + detalhe);
    }
}

async function cadastrarAtividadeComImagem(dados, arquivo) {

    const urlImagem = await enviarImagemAtividade(arquivo);

    dados.imagem = urlImagem;

    await inserirAtividade(dados);
}