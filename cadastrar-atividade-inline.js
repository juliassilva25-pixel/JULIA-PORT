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

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        msg.textContent = "Enviando...";
        msg.style.color = "black";

        const numero_eixo = form.querySelector('select[name="numero_eixo"]').value;
        const data = form.querySelector('input[name="data"]').value;
        const nome = form.querySelector('input[name="nome"]').value.trim();
        const imagem = fileInput.files[0];

        if (!numero_eixo || !data || nome === "" || !imagem) {

            msg.textContent = "Preencha todos os campos e selecione a imagem.";
            msg.style.color = "red";

            return;
        }

        const formData = new FormData();
        formData.append("eixo", eixo);
        formData.append("numero_eixo", numero_eixo);
        formData.append("data", data);
        formData.append("nome", nome);
        formData.append("imagem", imagem);

        try {

            console.log("Enviando atividade:", nome, "-", eixo);

            const resposta = await fetch(
                "http://127.0.0.1:3000/atividades",
                { method: "POST", body: formData }
            );

            const dados = await resposta.json();

            console.log("Resposta do servidor:", dados);

            if (dados.sucesso) {

                msg.textContent = "Atividade cadastrada com sucesso!";
                msg.style.color = "green";

                form.reset();
                preview.hidden = true;
                preview.innerHTML = "";

                if (typeof carregarAtividades === "function") {
                    carregarAtividades();
                }

            } else {

                msg.textContent = dados.mensagem;
                msg.style.color = "red";
            }

        } catch (erro) {

            console.error("ERRO:", erro);

            msg.textContent = "Erro ao conectar com o servidor.";
            msg.style.color = "red";
        }
    });
});