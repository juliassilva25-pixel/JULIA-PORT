console.log("CADASTRAR-ATIVIDADE-INLINE.JS FOI CARREGADO!");

document.querySelectorAll(".form-atividade-inline").forEach(function (form) {

    const eixo = document.body.dataset.materia || "";
    const msg = form.querySelector(".msg-form");
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

            msg.textContent =
                "Supabase ainda não configurado. Siga o guia configurar-supabase.txt.";
            msg.style.color = "red";

            return;
        }

        const numero_eixo = form.querySelector('select[name="numero_eixo"]').value;
        const data = form.querySelector('input[name="data"]').value;
        const nome = form.querySelector('input[name="nome"]').value.trim();
        const imagem = fileInput.files[0];

        if (!numero_eixo || !data || nome === "" || !imagem) {

            msg.textContent = "Preencha todos os campos e selecione a imagem.";
            msg.style.color = "red";

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

            msg.textContent = "Atividade cadastrada com sucesso!";
            msg.style.color = "green";

            form.reset();
            preview.hidden = true;
            preview.innerHTML = "";

            if (typeof carregarAtividades === "function") {
                carregarAtividades();
            }

            if (typeof rolarParaEixo === "function") {
                setTimeout(function () {
                    rolarParaEixo(numero_eixo);
                }, 100);
            }

        }).catch(function (erro) {

            console.error("ERRO:", erro);

            msg.textContent = "Erro ao cadastrar: " + erro.message;
            msg.style.color = "red";
        });
    });
});