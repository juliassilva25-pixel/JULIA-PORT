console.log("SUPABASE.JS FOI CARREGADO!");

const SUPABASE_BUCKET = "atividades-imagens";

function supabaseConfigurado() {

    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
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

    const url = SUPABASE_URL +
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

    const nome = Date.now() + "-" + arquivo.name;

    const url = SUPABASE_URL +
        "/storage/v1/object/" +
        SUPABASE_BUCKET + "/" +
        encodeURIComponent(nome);

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

        throw new Error("Erro ao enviar a imagem (" + resposta.status + "): " + detalhe);
    }

    return SUPABASE_URL +
        "/storage/v1/object/public/" +
        SUPABASE_BUCKET + "/" +
        nome;
}

async function inserirAtividade(dados) {

    if (!supabaseConfigurado()) {

        throw new Error("Supabase não configurado.");
    }

    const url = SUPABASE_URL + "/rest/v1/atividades";

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