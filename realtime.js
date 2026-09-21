console.log("REALTIME.JS FOI CARREGADO!");

const SUPABASE_CLIENT = (typeof window !== "undefined" && window.supabase)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

let canalAtividades = null;
let canalRemovidas = null;

let callbackRemovida = null;
let callbackAtividadeRemovida = null;

function definirCallbacks(removida, atividadeRemovida) {

    callbackRemovida = removida;
    callbackAtividadeRemovida = atividadeRemovida;
}

function desconectarRealtime() {

    if (canalAtividades) {

        SUPABASE_CLIENT.removeChannel(canalAtividades);
        canalAtividades = null;
    }

    if (canalRemovidas) {

        SUPABASE_CLIENT.removeChannel(canalRemovidas);
        canalRemovidas = null;
    }
}

function conectarRealtime() {

    if (!SUPABASE_CLIENT) {

        console.warn("Supabase JS (CDN) não carregado. Tempo real não ativado.");
        return;
    }

    const materia = document.body.dataset.materia;

    if (!materia) return;

    desconectarRealtime();

    canalAtividades = SUPABASE_CLIENT
        .channel("realtime-atividades")
        .on(
            "postgres_changes",
            {
                event: "DELETE",
                schema: "public",
                table: "atividades"
            },
            function (payload) {

                const id = payload.old && payload.old.id;

                if (id && callbackAtividadeRemovida) {

                    callbackAtividadeRemovida(id);
                }
            }
        )
        .subscribe();

    canalRemovidas = SUPABASE_CLIENT
        .channel("realtime-atividades-removidas")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "atividades_removidas"
            },
            function (payload) {

                const novo = payload.new;

                if (novo && novo.eixo === materia && callbackRemovida) {

                    callbackRemovida(novo.titulo);
                }
            }
        )
        .subscribe();
}