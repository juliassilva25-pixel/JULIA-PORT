console.log("SUPABASE.JS FOI CARREGADO!");

function supabaseConfigurado() {

    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function supabaseBase() {

    return String(SUPABASE_URL).replace(/\/+$/, "");
}

function supabaseHeaders() {

    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + SUPABASE_ANON_KEY
    };
}

function arquivoParaDataURL(arquivo) {

    return new Promise(function (resolve, reject) {

        const leitor = new FileReader();

        leitor.onload = function (e) {
            resolve(e.target.result);
        };

        leitor.onerror = reject;

        leitor.readAsDataURL(arquivo);
    });
}

function comprimirImagem(arquivo) {

    return new Promise(function (resolve, reject) {

        const url = URL.createObjectURL(arquivo);
        const img = new Image();

        img.onload = function () {

            const max = 1600;

            let largura = img.width;
            let altura = img.height;

            if (largura > max) {

                altura = Math.round(altura * max / largura);
                largura = max;
            }

            const canvas = document.createElement("canvas");
            canvas.width = largura;
            canvas.height = altura;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, largura, altura);

            URL.revokeObjectURL(url);

            resolve(canvas.toDataURL("image/jpeg", 0.85));
        };

        img.onerror = function () {

            URL.revokeObjectURL(url);

            arquivoParaDataURL(arquivo).then(resolve).catch(reject);
        };

        img.src = url;
    });
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

    const dataURL = await comprimirImagem(arquivo);

    dados.imagem = dataURL;

    await inserirAtividade(dados);
}