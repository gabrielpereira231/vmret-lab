<script setup>
/**
 * Importa o composable useToast do PrimeVue, usado para exibir mensagens de notificação.
 */
import { useToast } from 'primevue/usetoast';
import Message from 'primevue/message';
import { ref, onMounted } from 'vue';
import '@vuepic/vue-datepicker/dist/main.css';
import laService from '@/Services/laService.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const dipsComPosicoes = ref([]);
const loading = ref(false);
const toast = useToast();
const itemCache = ref({}); // objeto com chave = id_dm e valor = lista de itens
const itensAtuais = ref([]);
const listaArmarios = ref([]);
const dmSelecionado = ref(null);
const codigoMensagem = ref('');
const erroMensagem = ref('');

const salvarRequisicao = async () => {
    if (!dmSelecionado.value) {
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: t('select_locker') });
        return;
    }

    try {
        let requisicoesEnviadas = 0;

        for (const dipItem of dipsComPosicoes.value) {
            for (const pos of dipItem.posicoes) {
                if (pos.requisicao && !pos.ocupado) {
                    // Define modulo e posicao de acordo com o tipo da controladora
                    let modulo = null;
                    let posicao = null;
                    let andar = null;

                    if (dipItem.tipo === '2018') {
                        // módulo = placa, posição = mola
                        modulo = pos.placa;
                        posicao = pos.mola;
                    } else if (dipItem.tipo === '2023') {
                        // módulo = DIP, posição = pos.index
                        modulo = dipItem.dip;
                        posicao = pos.index;
                        andar = pos.andar;
                    } else {
                        // Locker padrão
                        modulo = dipItem.dip;
                        posicao = pos.index;
                    }

                    // chamada ao backend com os campos certos
                    await laService.adicionar({
                        id_dm: dmSelecionado.value,
                        modulo,
                        posicao,
                        andar,
                        controladora: dipItem.tipo,
                        requisicao: pos.requisicao
                    });

                    // Marca como ocupado no frontend
                    pos.ocupado = true;
                    pos.item = { requisicao: pos.requisicao };
                    requisicoesEnviadas++;
                }
            }
        }


        if (requisicoesEnviadas > 0) {
            // limpa cache para forçar atualização
            delete itemCache.value[dmSelecionado.value];

            await carregarDIPsComPosicoes(); // 🔄 recarrega a grid completa
            toast.add({
                severity: 'success',
                summary: 'Sucesso',
                life: 3000,
                detail: `${requisicoesEnviadas} requisições enviadas com sucesso.`
            });
        } else {
            toast.add({
                severity: 'warn',
                summary: 'Aviso',
                life: 3000,
                detail: 'Nenhuma requisição foi preenchida.'
            });
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            life: 3000,
            detail: 'Erro ao adicionar, verifique se a requisição já existe ou foi retirada'
        });
    }
};

async function carregarDIPsComPosicoes() {
    dipsComPosicoes.value = []; // limpa

    if (!dmSelecionado.value) return;

    try {
        const response = await laService.listarDIPs(dmSelecionado.value);
        const dips = response.data;

        // carrega todos os itens ocupados dessa DM
        await carregarItens(dmSelecionado.value);

        console.log('Itens carregados (ocupados):', itensAtuais.value);

        for (const dip of dips) {
            const responsePos = await laService.listarPosicoes({
                id_dm: dmSelecionado.value,
                dips: [{ tipo: dip.Tipo_Controladora, dip: dip.DIP }]
            });

            console.log(`Posições retornadas para DIP ${dip.DIP} (${dip.Tipo_Controladora}):`, responsePos.data);

            dipsComPosicoes.value.push({
                tipo: dip.Tipo_Controladora,
                dip: dip.DIP,
                posicoes: responsePos.data.map((p) => {
                    let ocupado = false;
                    let itemEncontrado = null;

                    if (dip.Tipo_Controladora === '2018') {
                        itemEncontrado = itensAtuais.value.find((item) => {
                            // Dados vindos da tabela Retirada_Avulsa
                            if (item.origem === 'Retirada_Avulsa') {
                                return item.modulo == p.Placa && item.posicao == p.Mola1;
                                // aqui você compara com a mola (posição equivalente na 2018)
                            }

                            // Dados de DM_Itens (2018 usa Placa + Motor1)
                            return item.Controladora === '2018' && item.Placa == p.Placa && item.Motor1 == p.Mola1;
                        });
                    } else if (dip.Tipo_Controladora === '2023') {
                        itemEncontrado = itensAtuais.value.find((item) => {
                            if (item.origem === 'Retirada_Avulsa') {
                                return item.modulo == dip.DIP && item.posicao == p.Posicao && item.andar == p.Andar;
                            }

                            return item.Controladora === '2023' && item.Andar == p.Andar && item.Posicao == p.Posicao && item.DIP == dip.DIP;
                        });
                    } else {
                        itemEncontrado = itensAtuais.value.find((item) => {
                            // Dados vindos da tabela Retirada_Avulsa
                            if (item.origem === 'Retirada_Avulsa') {
                                return item.modulo == dip.DIP && item.posicao == p.Posicao;
                            }

                            // Dados de DM_Itens
                            return (item.Controladora === 'Locker-Padrao' || item.Controladora === 'Locker-Ker' || item.Controladora === 'Locker-Opus') && item.Posicao == p.Posicao && item.DIP == dip.DIP;
                        });
                    }

                    ocupado = !!itemEncontrado;

                    console.log(itemEncontrado);

                    if (ocupado) {
                        console.log('🔴 Ocupado encontrado:', {
                            tipo: dip.Tipo_Controladora,
                            placa: p.Placa,
                            mola: p.Mola1,
                            andar: p.Andar,
                            abastecido: itemEncontrado?.abastecido,
                            produto: itemEncontrado?.id_produto, // ✔
                            posicao: p.Posicao,
                            dip: dip.DIP
                        });
                    } else {
                        console.log('🟢 Livre:', {
                            tipo: dip.Tipo_Controladora,
                            placa: p.Placa,
                            mola: p.Mola1,
                            andar: p.Andar,
                            abastecido: itemEncontrado?.abastecido,
                            posicao: p.Posicao,
                            dip: dip.DIP
                        });
                    }

                    return {
                        index: p.Posicao,
                        andar: p.Andar || null,
                        mola: p.Mola1 || null,
                        placa: p.Placa || null,
                        abastecido: itemEncontrado ? itemEncontrado.abastecido : null,
                        produto: itemEncontrado ? itemEncontrado.id_produto : null, // ✔ agora vem do itemEncontrado
                        ocupado,
                        item: itemEncontrado,
                        ocupadoPor: itemEncontrado ? (itemEncontrado.origem === 'DM_Itens' ? `ITEM ALOCADO` : `${itemEncontrado.codigo_requisicao}`) : null,
                        requisicao: itemEncontrado?.origem === 'Retirada_Avulsa' ? itemEncontrado.requisicao : ''
                    };
                })
            });
        }

        console.log('Itens abastecidos (azul):', dipsComPosicoes.value.flatMap(dip => dip.posicoes.filter(pos => pos.abastecido === 1)));
    } catch (error) {
        console.error('Erro ao carregar DIPs e posições:', error);
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: 'Falha ao carregar DIPs e posições' });
    }
}

async function carregarItens(id_dm) {
    if (itemCache.value[id_dm]) {
        itensAtuais.value = itemCache.value[id_dm];
        return;
    }

    try {
        const responseDMItens = await laService.itensLocker(id_dm);
        const responseAvulsa = await laService.requisicoesSalvas(id_dm);

        const dadosDM = responseDMItens.data || [];
        const dadosAvulsa = responseAvulsa.data || [];

        // Marcar origem se quiser identificar depois
        const todosItens = [...dadosDM.map((item) => ({ ...item, origem: 'DM_Itens', id_produto: item.id_produto })), ...dadosAvulsa.map((item) => ({ ...item, origem: 'Retirada_Avulsa' }))];

        itemCache.value[id_dm] = todosItens;
        itensAtuais.value = todosItens;
    } catch (error) {
        console.error('Erro ao carregar itens:', error);
    }
}

const excluirRequisicao = async (dipItem, pos) => {
    try {
        let modulo = null;
        let posicao = null;
        let andar = null;

        if (dipItem.tipo === '2018') {
            modulo = pos.placa;
            posicao = pos.mola;
        } else if (dipItem.tipo === '2023') {
            modulo = dipItem.dip;
            posicao = pos.index;
            andar = pos.andar;
        } else {
            modulo = dipItem.dip;
            posicao = pos.index;
        }

        await laService.excluirRequisicao({
            id_dm: dmSelecionado.value,
            modulo,
            posicao,
            andar,
            requisicao: pos.item.codigo_requisicao
        });

        // Atualiza frontend
        pos.requisicao = '';
        pos.ocupado = false;
        pos.item = null;
        pos.ocupadoPor = null;

        delete itemCache.value[dmSelecionado.value];
        await carregarDIPsComPosicoes();

        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            life: 3000,
            detail: 'Requisição excluída com sucesso.'
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            life: 3000,
            detail: 'Erro ao excluir a requisição.'
        });
    }
};


onMounted(async () => {
    loading.value = true;
    try {
        let resultArmarios = await laService.listarLocker();
        listaArmarios.value = resultArmarios.data.map((item) => ({
            label: item.Identificacao,
            value: item.id_dm,
            posicoes: item.total_controladoras
        }));
    } catch (error) {
        erroMensagem.value = `Erro ao carregar dados: ${error.message}`;
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: error.message });
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <!-- Estrutura principal da interface -->
    <div class="card">
        <!-- Grid interno para organizar os campos de entrada -->
        <!-- 1. Select de DM -->
        <div class="lg:col-4 md:col-12 sm:col-12 my-3">
            <label class="m-3 text-lg">{{ t('locker') }}:</label>
            <Select class="my-2 w-8 ml-3" v-model="dmSelecionado" :options="listaArmarios" optionLabel="label"
                optionValue="value" @change="carregarDIPsComPosicoes" />
        </div>

        <div class="flex flex-wrap gap-2 container-portas text-center">
            <div v-for="dipItem in dipsComPosicoes" :key="dipItem.tipo + '_' + dipItem.dip" class="my-4 mx-2">
                <label class="text-md font-semibold">
                    {{ dipItem.tipo }}<span v-if="dipItem.tipo !== '2018'"> DIP {{ dipItem.dip }}</span>
                </label>
                <div class="grid-portas ml-2 mt-2">
                    <div v-for="pos in dipItem.posicoes" :key="pos.index"
                        class="porta p-3 border-1 border-round font-bold cursor-pointer" :style="{
                            backgroundColor:
                                pos.item?.origem === 'DM_Itens' ? '#ef4444' :         // 🔴 Vermelho: não pode usar
                                    pos.abastecido === 1 ? '#3B82F6' :                    // 🔵 Azul: abastecido
                                        pos.item?.origem === 'Retirada_Avulsa' ? 'orange' :   // 🟠 Laranja: aguardando abastecimento
                                            '#22c55e',                                            // 🟢 Verde: livre
                            color: '#fff'
                        }"
                        v-tooltip="pos.ocupado ? (pos.item?.origem === 'DM_Itens' ? 'Indisponível' : pos.item?.abastecido === 1 ? 'Abastecido' : 'Aguardando abastecimento') : 'Livre'">
                        <!-- Caso seja 2018 -->
                        <div v-if="dipItem.tipo === '2018'" class="text-sm font-semibold">
                            <p class="mb-0 nowrap">Placa {{ pos.placa }} - {{ t('position') }} {{ pos.mola }}</p>
                            <hr class="mt-0 pt-0">
                            </hr>
                            <template v-if="!pos.ocupado">
                                <InputText v-model="pos.requisicao" class="w-12 mt-1" style="height: 10%" />
                            </template>
                        </div>

                        <!-- Caso seja 2023 -->
                        <div v-else-if="dipItem.tipo === '2023'" class="text-sm font-semibold">
                            <p class="mb-0 nowrap">Andar {{ pos.andar }} - Posição {{ pos.index }}</p>
                            <hr class="mt-0 pt-0">
                            </hr>
                            <template v-if="!pos.ocupado">
                                <InputText v-model="pos.requisicao" class="w-12 mt-1" style="height: 10%" />
                            </template>
                        </div>

                        <!-- Outros tipos -->
                        <div v-else class="text-sm font-semibold">
                            <p class="mb-0 nowrap">{{ t('position') }} {{ pos.index }}</p>
                            <hr class="mt-0 pt-0">
                            </hr>
                            <template v-if="!pos.ocupado">
                                <InputText v-model="pos.requisicao" class="w-12 mt-1" style="height: 10%" />
                            </template>
                        </div>

                        <div v-if="pos.ocupado" class="card-ocupado flex justify-between items-center" :style="{
                            backgroundColor:
                                pos.item?.origem === 'DM_Itens' ? '#f9becc' :         // 🔴 Vermelho: não pode usar
                                    pos.abastecido === 1 ? '#84cef9' :                    // 🔵 Azul: abastecido
                                        pos.item?.origem === 'Retirada_Avulsa' ? '#ffc04d' :   // 🟠 Laranja: aguardando abastecimento
                                            '#22c55e',                                            // 🟢 Verde: livre
                            color: '#fff',
                        }">
                            <div class="texto-ocupado">
                                <span>{{ pos.ocupadoPor }}</span>
                            </div>
                            <Button v-if="pos.item?.origem === 'Retirada_Avulsa'" icon="pi pi-trash" severity="danger"
                                size="small" text rounded class="delete-btn" @click="excluirRequisicao(dipItem, pos)" />


                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Botão para salvar as informações -->
        <div class="flex align-items-center justify-content-end field col-12">
            <Button label="Salvar" icon="pi pi-check" severity="info" @click="salvarRequisicao" class="full mt-2" />
            <!-- Mensagem esperada ao clicar:
                         - Liberação registrada com sucesso (toast com mensagem de sucesso). -->
        </div>

        <LoadingSpinner v-if="loading" />
        <Message v-if="codigoMensagem" severity="success" :text="codigoMensagem" />

        <!-- Exibe a mensagem de erro se existir -->
        <Message v-if="erroMensagem" severity="error" :text="erroMensagem" />
    </div>
</template>

<style scoped>
.container-portas {
    background-color: #e5e5e562;
    /* fundo cinza como no exemplo */
    justify-content: space-around;
}

.grid-portas {
    display: grid;
    grid-template-columns: repeat(2, auto);
    /* duas portas por linha */
    background-color: #e5e5e5;
    padding: 10px;
    border-radius: 6px;
    width: fit-content;
    /* ajusta à quantidade de portas */

}

.porta {
    width: 160px;
    height: 100px;
    align-content: center;
}

.card-ocupado {
    position: relative;
    padding: 2px 2px;
    /* vermelho */
    border-radius: 5px;
    font-size: 0.85rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50%;
}

.card-ocupado .texto-ocupado {
    flex: 1;
    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 1px;
    /* para dar espaço entre o texto e o botão */
}

.delete-btn {
    flex-shrink: 0;
    margin-left: auto;
}
</style>
