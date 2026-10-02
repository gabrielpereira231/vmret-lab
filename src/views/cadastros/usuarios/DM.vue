<script setup>
import { useToast } from 'primevue/usetoast'; // Função para exibir notificações
import { reactive, ref, onMounted, watch, computed } from 'vue'; // Hooks do Vue.js
import { useAuthStore } from '@/store/authStore.js'; // Store para autenticação de usuário
import { FilterMatchMode } from '@primevue/core/api'; // Modo de filtro global para PrimeVue
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Componente de loading
import { useDataStore } from '@/store/dataStore.js'; // Store para dados gerais
import {
    selectAll, // Importa a função selectAll do módulo DMHelper.js
    desselectAll, // Importa a função desselectAll do módulo DMHelper.js
    handleControladoraChange as hcgHelper, // Importa a função handleControladoraChange do módulo DMHelper.js e a renomeia para hcgHelper
    mapControladoras as mapControladorasHelper, // Importa a função mapControladoras do módulo DMHelper.js e a renomeia para mapControladorasHelper
    preencherOpcoesControladoras as pocHelper, // Importa a função preencherOpcoesControladoras do módulo DMHelper.js e a renomeia para pocHelper
    validarAndarSelecionado as ValidarAndarHelper, // Importa a função validarAndarSelecionado do módulo DMHelper.js e a renomeia para ValidarAndarHelper
    preencherControladoraOptions as pcoHelper, // Importa a função preencherControladoraOptions do módulo DMHelper.js e a renomeia para pcoHelper
    ajustarContagemInicial as ContagemHelper, // Importa a função ajustarContagemInicial do módulo DMHelper.js e a renomeia para ContagemHelper
    validarMudancaAndar, // Importa a função validarMudancaAndar do módulo DMHelper.js
    validarCampos as validarCamposHelper, // Importa a função validarCampos do módulo DMHelper.js e a renomeia para validarCamposHelper
    updateTipoControladora as updateControladoraHelper, // Importa a função updateTipoControladora do módulo DMHelper.js e a renomeia para updateControladoraHelper
    findControladora, // Importa a função findControladora do módulo DMHelper.js
    updateProdutoSelecionado, // Importa a função updateProdutoSelecionado do módulo DMHelper.js
    prepareDMData, // Importa a função prepareDMData do módulo DMHelper.js
    prepareItemDMData, // Importa a função prepareItemDMData do módulo DMHelper.js
    FormatarListaCliente, // Importa a função FormatarListaCliente do módulo DMHelper.js
    isArmario // Importa a função isArmario do módulo DMHelper.js
} from '@/helpers/DMHelper.js';
import { normalizeDateTime, prepareListData } from '@/helpers/HelperUtils.js'; // Importa as funções normalizeDateTime e prepareListData do módulo HelperUtils.js
import { resetDMForm, resetProdutoSelecionado } from '@/helpers/formHelper.js'; // Importa as funções resetDMForm e resetProdutoSelecionado do módulo formHelper.js
import dmService from '@/services/dmService'; // Importa o serviço dmService do módulo dmService.js
import { useI18n } from 'vue-i18n'; // Importa a função useI18n do módulo vue-i18n
const { t } = useI18n(); // Desestrutura a função t da função useI18n

import ScrollTop from 'primevue/scrolltop'; // Importa o componente ScrollTop do módulo primevue/scrolltop
//Store e Variaveis Reativas
const dataStore = useDataStore();
const store = useAuthStore();
const toast = useToast();
//controle de Loading
const loading = ref(false);
const loadingControladoras = ref(true);
//Objeto de DM
let DM = reactive({
    Ativo: false,
    Chave: '',
    ChaveAPI: '',
    ClienteID: '',
    ClienteNome: '',
    Created: '',
    Enviada: '',
    ID_CR_Usuario: '',
    ID_DM: '',
    IDcliente: '',
    Identificacao: '',
    Integracao: false,
    Numero: '',
    OP_Biometria: false,
    OP_Facial: false,
    OP_Senha: false,
    voucher: false,
    cracha: false,
    URL: '',
    Updated: '',
    UserID: '',
    Versao: '',
    Devolucao: false
});

let locker = reactive({
    // Declara um objeto reativo chamado locker
    id_dm: '', // Define a propriedade 'id_dm' com valor inicial vazio
    id_cliente: '', // Define a propriedade 'id_cliente' com valor inicial vazio
    is_locker: false // Define a propriedade 'is_locker' com valor inicial false
});

const carregarLocker = async (id_dm, id_cliente) => {
    try {
        const res = await dmService.getLocker({ id_dm, id_cliente });
        locker.id_dm = id_dm;
        locker.id_cliente = id_cliente;
        locker.is_locker = res.data?.exists === true || res.data?.exists === 'true';
        console.log('exists recebido:', res.data?.exists, 'Tipo:', typeof res.data?.exists);
    } catch (error) {
        console.error('Erro ao carregar locker:', error);
        locker.is_locker = false;
    }
};

// Mapeamento de valores
const nextValues = reactive({
    // Declara um objeto reativo chamado nextValues
    2018: { placa: 12 }, // Define a propriedade '2018' com um objeto contendo a propriedade 'placa' com valor 12
    2023: { dip: 2 }, // Define a propriedade '2023' com um objeto contendo a propriedade 'dip' com valor 2
    'Locker-Padrao': { dip: 2 }, // Define a propriedade 'Locker-Padrao' com um objeto contendo a propriedade 'dip' com valor 2
    'Locker-Ker': { dip: 0 }, // Define a propriedade 'Locker-Ker' com um objeto contendo a propriedade 'dip' com valor 0
    'Locker-Opus': { dip: 0 }, // Define a propriedade 'Locker-Opus' com um objeto contendo a propriedade 'dip' com valor 0
    2024: { placa: 101 } // Define a propriedade '2024' com um objeto contendo a propriedade 'placa' com valor 101
});
const tipoControladoras = [
    // Declara um array chamado tipoControladoras
    { label: '2018', value: '2018' }, // Adiciona um objeto com as propriedades label e value
    { label: '2023', value: '2023' }, // Adiciona um objeto com as propriedades label e value
    { label: '2024', value: '2024' }, // Adiciona um objeto com as propriedades label e value
    { label: 'Locker Padrão', value: 'Locker-Padrao' }, // Adiciona um objeto com as propriedades label e value
    { label: 'Locker Ker', value: 'Locker-Ker' }, // Adiciona um objeto com as propriedades label e value
    { label: 'Locker Opus', value: 'Locker-Opus' } // Adiciona um objeto com as propriedades label e value
];
// Objeto de produto selecionado
const produtoSelecionado = ref({
    // Declara um objeto reativo chamado produtoSelecionado
    id_produto: '', // Define a propriedade 'id_produto' com valor inicial vazio
    Porta: '', // Define a propriedade 'Porta' com valor inicial vazio
    Placa: '', // Define a propriedade 'Placa' com valor inicial vazio
    Posicao: '', // Define a propriedade 'Posicao' com valor inicial vazio
    Andar: '', // Define a propriedade 'Andar' com valor inicial vazio
    Dip: '', // Define a propriedade 'Dip' com valor inicial vazio
    Motor1: '', // Define a propriedade 'Motor1' com valor inicial vazio
    Motor2: '', // Define a propriedade 'Motor2' com valor inicial vazio
    Controladora: '', // Define a propriedade 'Controladora' com valor inicial vazio
    Capacidade: 1 // Define a propriedade 'Capacidade' com valor inicial 1
});
//Listas Reativas
const filters = ref({
    // Declara um objeto reativo chamado filters
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Define a propriedade global com um objeto contendo value inicial null e matchMode como FilterMatchMode.CONTAINS
});
const lazyParams = ref({
    first: 0, // Índice inicial
    rows: 10, // Número de registros por página
    sortField: 'Identificacao', // Campo padrão para ordenação
    sortOrder: 1, // Ordem padrão (1 = ascendente, -1 = descendente)
    filters: {} // Filtros aplicados
});
const ListaItens = ref([]);
const ListaClientes = ref([]);
const produtos = computed(() => dataStore.produtos);
const ListaProdutos = computed(() => {
    return produtos.value
        .filter((produto) => produto.value !== null)
        .map(({ value, codigo, label }) => ({
            label: `${codigo} | ${label}`,
            value
        }))
        .sort((a, b) => {
            const codigoA = parseInt(a.label.split(' | ')[0], 10);
            const codigoB = parseInt(b.label.split(' | ')[0], 10);
            return codigoA - codigoB;
        });
});
const Controladoras = ref([]); // Declara um array reativo chamado Controladoras
const controladoraOptions = ref([]); // Declara um array reativo chamado controladoraOptions
const molasOptions = ref([]); // Declara um array reativo chamado molasOptions
const dipOptions = ref([]); // Declara um array reativo chamado dipOptions
const andarOptions = ref([]); // Declara um array reativo chamado andarOptions
const posicaoOptions = ref([]); // Declara um array reativo chamado posicaoOptions
const placaOptions = ref([]); // Declara um array reativo chamado placaOptions
const motorOptions = ref([]); // Declara um array reativo chamado motorOptions
const ListaDMS = ref([]);
const controladoraRefs = ref([]);
// Controles de Estado
const totalRecords = ref(0); // Declara uma variável reativa chamada totalRecords com valor inicial 0
const isEditMode = ref(false); // Declara uma variável reativa chamada isEditMode com valor inicial false
const showDialogProduto = ref(false); // Declara uma variável reativa chamada showDialogProduto com valor inicial false
const active = ref('0'); // Declara uma variável reativa chamada active com valor inicial 0
const showDialogDVM = ref(false); // Declara uma variável reativa chamada showDialogDVM com valor inicial false
const showDialogDItem = ref(false); // Declara uma variável reativa chamada showDialogDItem com valor inicial false
const showDialogControl = ref(false); // Declara uma variável reativa chamada showDialogControl com valor inicial false
const show = ref(false); // Declara uma variável reativa chamada show com valor inicial false
const usarApi = ref(false); // Declara uma variável reativa chamada usarApi com valor inicial false
const selectedClient = ref({ id_cliente: '', nome_cliente: '', usar_api: false }); // Declara um objeto reativo chamado selectedClient com propriedades id_cliente, nome_cliente e usar_api
const dialogMessage = ref(''); // Declara uma variável reativa chamada dialogMessage com valor inicial vazio
const selectedItem = ref(null); // Declara uma variável reativa chamada selectedItem com valor inicial null
const todosOption = { label: 'Todos', value: { id_cliente: '', nome_cliente: 'Todos', usar_api: false }, usar_api: false }; // Declara um objeto chamado todosOption com propriedades label e value
const operador = ref(false); // Declara uma variável reativa chamada operador com valor inicial false
const visible = ref(false); // Declara uma variável reativa chamada visible com valor inicial false
const currentPage = ref(1); // Declara uma variável reativa chamada currentPage com valor inicial 1
const debounceTimeout = ref(null); // Declara uma variável reativa chamada debounceTimeout com valor inicial null
const salvardados = ref(true); // Declara uma variável reativa chamada salvardados com valor inicial true
const salvardadosMaquina = ref(true); // Declara uma variável reativa chamada salvardadosMaquina com valor inicial true
const supe = ref(false); // Declara uma variável reativa chamada supe com valor inicial false
const dupe = ref(false); // Declara uma variável reativa chamada dupe com valor inicial false

// Propriedades Computadas
const tipoControladoraSelecionada = computed(() => {
    // Declara uma propriedade computada chamada tipoControladoraSelecionada
    const controladora = Controladoras.value.find((c) => c.id === produtoSelecionado.value.Controladora); // Encontra a controladora correspondente ao ID da controladora selecionada
    return controladora ? controladora.tipo : null; // Retorna o tipo da controladora se encontrada, caso contrário, retorna null
});

//Funções Ultilitárias
const validarCampos = () => {
    // Declara uma função chamada validarCampos
    try {
        // Inicia um bloco try para capturar possíveis erros
        // Tenta validar os campos
        validarCamposHelper(produtoSelecionado.value, tipoControladoraSelecionada.value); // Chama a função validarCamposHelper com os valores de produtoSelecionado e tipoControladoraSelecionada
        return true; // Retorna true se a validação for bem-sucedida
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a validação
        // Captura o erro e exibe a mensagem no toast
        toast.add({ severity: 'error', summary: 'Erro', detail: error.message, life: 3000 }); // Adiciona uma mensagem de erro ao toast
        return false; // Retorna false se ocorrer um erro
    }
};

const setRefs = (el) => {
    // Declara uma função chamada setRefs
    if (el) {
        // Verifica se o elemento existe
        controladoraRefs.value.push(el); // Adiciona o elemento ao array reativo controladoraRefs
    }
};
const selectAllCliente = (index) => {
    // Declara uma função chamada selectAllCliente que recebe um índice como parâmetro
    selectAll(Controladoras.value[index]); // Chama a função selectAll com a controladora correspondente ao índice fornecido
};

const desselectAllCliente = (index) => {
    // Declara uma função chamada desselectAllCliente que recebe um índice como parâmetro
    desselectAll(Controladoras.value[index]); // Chama a função desselectAll com a controladora correspondente ao índice fornecido
};

const addControladora = () => {
    // Declara uma função chamada addControladora
    Controladoras.value.push({
        // Adiciona um novo objeto controladora ao array reativo Controladoras
        ID: null, // Define a propriedade ID como null
        tipo: '', // Define a propriedade tipo como uma string vazia
        deleted: false, // Define a propriedade deleted como false
        dados: {} // Define a propriedade dados como um objeto vazio
    });
    setTimeout(() => {
        // Define um timeout para executar a função após 100ms
        const ultimaControladora = controladoraRefs.value[controladoraRefs.value.length - 1]; // Obtém a última controladora adicionada
        if (ultimaControladora) {
            // Verifica se a última controladora existe
            ultimaControladora.scrollIntoView({ behavior: 'smooth', block: 'end' }); // Rola a página até a última controladora com animação suave
        }
    }, 100);
};

const updateTipoControladora = (index, tipo) => {
    // Declara uma função chamada updateTipoControladora
    try {
        // Inicia um bloco try para capturar possíveis erros
        updateControladoraHelper(index, tipo, Controladoras.value, nextValues); // Chama a função updateControladoraHelper com os parâmetros fornecidos
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a atualização
        console.log('Erro ao atualizar o tipo da controladora:', error); // Loga a mensagem de erro no console
        toast.add({ severity: 'warn', summary: t('title_error'), detail: error.message, life: 3000 }); // Adiciona uma mensagem de aviso ao toast
        return; // Retorna para interromper a execução da função
    }
};
const admin = () => {
    // Declara uma função chamada admin
    return store.userRole === 'Administrador'; // Retorna true se o papel do usuário for 'Administrador'
};
const voltar = () => {
    // Declara uma função chamada voltar
    show.value = false; // Define a variável reativa show como false
    operador.value = false; // Define a variável reativa operador como false
};
const onFilterChange = async () => {
    // Declara uma função assíncrona chamada onFilterChange
    lazyParams.value.filters = filters.value; // Atualiza os filtros
    await fetchDMS(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};

const onSortChange = async (event) => {
    lazyParams.value.sortField = event.sortField; // Campo a ser ordenado
    lazyParams.value.sortOrder = event.sortOrder; // Ordem (ascendente/descendente)
    await fetchDMS(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onPageChange = async (event) => {
    lazyParams.value.first = event.first; // Atualiza o índice inicial
    lazyParams.value.rows = event.rows; // Atualiza o número de registros por página
    await fetchDMS(Math.ceil(event.first / event.rows) + 1); // Recalcula a página atual e busca os dados
};
//Funções de manipulaçao de estado
// Função para manipular mudanças na controladora selecionada
const handleControladoraChange = () => {
    // Declara uma função chamada handleControladoraChange
    hcgHelper(Controladoras.value, produtoSelecionado.value, ListaItens.value, isEditMode.value, { molasOptions, dipOptions, andarOptions, posicaoOptions, motorOptions, placaOptions }); // Chama a função hcgHelper com os parâmetros fornecidos
};

// Função para manipular mudanças no andar selecionado
const handleAndarChange = () => {
    // Declara uma função chamada handleAndarChange
    validarMudancaAndar(Controladoras.value, produtoSelecionado.value, ListaItens.value, posicaoOptions); // Chama a função validarMudancaAndar com os parâmetros fornecidos
};

// Função para validar o andar selecionado
const validarAndarSelecionado = () => {
    // Declara uma função chamada validarAndarSelecionado
    try {
        // Inicia um bloco try para capturar possíveis erros
        ValidarAndarHelper(produtoSelecionado); // Chama a função ValidarAndarHelper com o valor de produtoSelecionado
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a validação
        toast.add({ severity: 'warn', summary: t('title_error'), detail: error.message, life: 3000 }); // Adiciona uma mensagem de aviso ao toast
        console.error('Erro ao validar o andar selecionado:', error); // Loga a mensagem de erro no console
    }
};
//função para remoção de controladora
const removeControladora = (index) => {
    // Declara uma função chamada removeControladora
    if (!DM.ID_DM) {
        // Verifica se o ID_DM não está definido
        Controladoras.value.splice(index, 1); // Remove a controladora do array Controladoras
    } else {
        Controladoras.value[index].deleted = true; // Marca a controladora como deletada
    }
};
/**
 * Função chamada para cancelar a exclusão de um item.
 * Apenas fecha o diálogo sem realizar nenhuma ação.
 */
const cancelDelete = () => {
    // Declara uma função chamada cancelDelete
    showDialogDItem.value = false; // Define showDialogDItem como false
    showDialogDVM.value = false; // Define showDialogDVM como false
    showDialogControl.value = false; // Define showDialogControl como false
    selectedItem.value = null; // Define selectedItem como null
};
function debounce(func, wait = 3000) {
    // Declara uma função chamada debounce
    let timeout; // Declara uma variável timeout
    return (...args) => {
        // Retorna uma função que recebe argumentos
        clearTimeout(timeout); // Limpa o timeout anterior
        timeout = setTimeout(() => func.apply(this, args), wait); // Define um novo timeout para chamar a função após o tempo de espera
    };
}

const debouncedFilterChange = debounce(() => {
    // Declara uma função chamada debouncedFilterChange que usa debounce para chamar onFilterChange após 300ms
    onFilterChange();
}, 300);

const onRowSelect = async (event) => {
    // Declara uma função assíncrona chamada onRowSelect
    if (!event || !event.data) {
        // Verifica se o evento ou os dados do evento são inválidos
        console.error('Seleção inválida na tabela.'); // Loga uma mensagem de erro no console
        return;
    }
    try {
        // Inicia um bloco try para capturar possíveis erros
        // DM = {...event.data};
        Object.assign(DM, event.data); // Atribui os dados do evento ao objeto DM
        active.value = '1'; // Altera o índice ativo para 1 (indicando que a dm está sendo editada)
        visible.value = true; // Define a variável reativa visible como true
        await mapControladoras(DM); // Mapeia as controladoras do DM
        configurarCliente(DM); // Configura o cliente do DM
        configurarVisibilidade(); // Configura a visibilidade dos elementos
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a execução
        console.error('Erro ao selecionar a DM:', error); // Loga a mensagem de erro no console
        loadingControladoras.value = false; // Define a variável reativa loadingControladoras como false
    }
};

/**
 * Função chamada ao submeter o formulário.
 * Dependendo da visibilidade do formulário, ele pode ser para adicionar ou atualizar um cliente.
 */
const submitForm = () => {
    if (visible.value) {
        // Se o formulário estiver visível, indica que é uma atualização de cliente
        atualizarDM();
    } else {
        // Caso contrário, trata-se da adição de um novo cliente
        adicionarDM();
    }
};

const handleRowSelection = async (event) => {
    // Declara uma função assíncrona chamada handleRowSelection
    const edit = event.data; // Obtém os dados do evento
    isEditMode.value = true; // Define a variável reativa isEditMode como true
    showDialogProduto.value = true; // Define a variável reativa showDialogProduto como true
    //seto o produto para edição
    produtoSelecionado.value = {
        // Define os valores do objeto produtoSelecionado
        id_item: edit.id_item,
        id_produto: edit.id_produto,
        Nome_Produto: edit.Nome_Produto,
        QTD: edit.QTD,
        SKU: edit.SKU,
        Controladora: '',
        Capacidade: edit.Capacidade
    };
    // Extrai valores da posição
    const [controladora, ...valores] = edit.Posicao.split(' / '); // Divide a string Posicao em controladora e valores

    // Busca pela controladora original
    const controladoraOriginal = findControladora(controladora, Number(valores[0]), Controladoras.value); // Encontra a controladora original
    if (controladoraOriginal) {
        // Verifica se a controladora original foi encontrada
        produtoSelecionado.value.Controladora = controladoraOriginal.id; // Define o ID da controladora no objeto produtoSelecionado
    } else {
        console.warn('Controladora não encontrada para o tipo e identificador fornecidos.'); // Loga uma mensagem de aviso no console
    }

    // Atualiza o produto selecionado com base no tipo de controladora
    updateProdutoSelecionado(produtoSelecionado.value, controladora, valores); // Atualiza o produto selecionado
    console.log('Produto selecionado:', produtoSelecionado.value); // Loga o produto selecionado no console
    await nextTick(); // Aguarda a próxima atualização do DOM
    handleControladoraChange(); // Chama a função handleControladoraChange
};

//funções de  cancelar dialogo e limpeza de campos
const handleCancelar = () => {
    resetProdutoSelecionado(produtoSelecionado);
    isEditMode.value = false;
    showDialogProduto.value = false;
};

const fetchDMS = async (page = 1) => {
    //Função para buscar as DMs através de uma requisição.
    loading.value = true; //A requisição é ajustada de acordo com o tipo de usuário (admin ou não).
    try {
        const params = {
            first: (page - 1) * lazyParams.value.rows, // Calcula o índice inicial com base na página
            rows: lazyParams.value.rows, // Número de registros por página
            sortField: lazyParams.value.sortField, // Campo para ordenação
            sortOrder: lazyParams.value.sortOrder, // Ordem (1 = ascendente, -1 = descendente)
            filters: lazyParams.value.filters // Filtros aplicados
        };

        const data = prepareListData(params);
        const response = await dmService.listarDMPaginado(data);
        ListaDMS.value = response.data.dmsArray; // Atualiza a lista de DMs com a resposta
        totalRecords.value = response.data.totalRecords; // Atualiza o total de registros
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_dm_list'), life: 3000 }); // Exibe uma mensagem de erro
        console.error('Erro ao carregar usuários:', error); // Loga o erro no console
    } finally {
        loading.value = false; // Desativa o loading após a requisição
    }
};
const validarDados = async () => {
    // Declara uma função assíncrona chamada validarDados
    const data = {
        // Cria um objeto data com as propriedades UserID, Chaveapi, ClienteID e URL do objeto DM
        UserID: DM.UserID,
        Chaveapi: DM.ChaveAPI,
        ClienteID: DM.ClienteID,
        URL: DM.URL
    };
    if (!data.UserID || !data.Chaveapi || !data.ClienteID || !data.URL) {
        // Verifica se algum dos campos obrigatórios está vazio
        toast.add({ severity: 'warn', summary: 'Campos obrigatórios', detail: 'Preencha todos os campos antes de validar.', life: 3000 }); // Adiciona uma mensagem de aviso ao toast
        return;
    }
    try {
        // Inicia um bloco try para capturar possíveis erros
        const response = await dmService.validarExternalData(data); // Faz uma requisição para validar os dados externos

        if (response.data.success) {
            // Verifica se a validação foi bem-sucedida
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Dados validados com sucesso!', life: 3000 }); // Adiciona uma mensagem de sucesso ao toast
        } else {
            toast.add({ severity: 'warn', summary: 'Falha na Validação', detail: response.data.message || 'Não foi possível validar os dados.', life: 3000 }); // Adiciona uma mensagem de aviso ao toast
        }
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a validação
        console.error('Erro ao validar dados:', error); // Loga a mensagem de erro no console
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro ao validar os dados. Tente novamente.', life: 4000 }); // Adiciona uma mensagem de erro ao toast
    }
};
const adicionarDM = async () => {
    loading.value = true;
    try {
        const data = prepareDMData('adicionar', DM, selectedClient.value, Controladoras.value);

        // Adiciona a DM e já pega o ID retornado
        const novaDM = await dmService.adicionarDM(data); // backend deve retornar { id_dm: 123 }

        // Só chama seforlocker se for marcado como locker
        if (locker.is_locker) {
            await dmService.seforlocker({
                id_cliente: selectedClient.value.id_cliente,
                id_dm: novaDM.data.id_dm,
                is_locker: locker.is_locker // <-- aqui sim você pega o valor real do toggle
            });
        }

        dataStore.invalidateDMCache();
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('dm_added_sucess'), life: 3000 });
        fetchDMS();
        active.value = '0';
        resetDMForm(DM, Controladoras, selectedClient.value, nextValues);
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('dm_added_error'), life: 3000 });
        console.error('Erro ao adicionar DM:', error);
    } finally {
        loading.value = false;
    }
};

const atualizarDM = async () => {
    dataStore.invalidateDMCache();
    loading.value = true;

    const preparedControladoras = Controladoras.value.map((controladora) => ({
        ...controladora,
        ID: controladora.ID || null
    }));

    const data = prepareDMData('atualizar', DM, selectedClient.value, preparedControladoras);

    try {
        // Atualiza a DM
        await dmService.atualizarDM(data);

        // Sempre chama o seforlocker (tanto quando marcar quanto desmarcar)
        await dmService.seforlocker({
            id_cliente: selectedClient.value.id_cliente,
            id_dm: DM.ID_DM,
            is_locker: locker.is_locker // <-- aqui sim você pega o valor real do toggle
        });

        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('dm_update_sucess'), life: 3000 });
        fetchDMS();
        active.value = '0';
        resetDMForm(DM, Controladoras, selectedClient.value, nextValues);
    } catch (error) {
        // Erro de validação do backend (ex.: DIP/placa já usado) vem com a mensagem explicando o motivo.
        const detail = error.response?.status === 400 && error.response.data?.message ? error.response.data.message : t('dm_update_error');
        toast.add({ severity: 'error', summary: t('title_error'), detail, life: 5000 });
        console.error('Erro ao atualizar DM:', error);
    } finally {
        loading.value = false;
    }
};

const deleteDM = async (item) => {
    // Função chamada quando o usuário deseja excluir uma DM
    dialogMessage.value = `Você tem certeza que deseja excluir a DM: ${item.Identificacao}?`; // Define a mensagem de diálogo com a identificação da DM
    showDialogDVM.value = true; // Exibe o diálogo de confirmação de exclusão
    selectedItem.value = item; // Define o item selecionado como a DM a ser excluída
};

const confirmdeleteDM = async () => {
    // Declara uma função assíncrona chamada confirmdeleteDM
    if (!selectedItem.value) return; // Verifica se não há item selecionado e retorna se for o caso
    console.log(selectedItem.value); // Loga o item selecionado no console
    const data = prepareDMData('deletar', selectedItem.value); // Prepara os dados para deletar a DM
    try {
        // Inicia um bloco try para capturar possíveis erros
        showDialogDVM.value = false; // Fecha o diálogo de confirmação de exclusão
        loading.value = true; // Ativa o estado de loading
        await dmService.deletarDM(data); // Faz uma requisição para deletar a DM
        dataStore.invalidateDMCache(); // Invalida o cache de DM no dataStore
        toast.add({ severity: 'success', summary: 'Successful', detail: t('dm_delete_sucess'), life: 3000 }); // Adiciona uma mensagem de sucesso ao toast
        await fetchDMS(); // Busca as DMs atualizadas
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a exclusão
        if (error.response && (error.response.status === 500 || error.response.status === 401)) {
            // Verifica se o erro é de servidor ou de autorização
            toast.add({ severity: 'error', summary: 'Error', detail: t('dm_delete_error'), life: 3000 }); // Adiciona uma mensagem de erro ao toast
        }
    } finally {
        loading.value = false; // Desativa o loading
        selectedItem.value = null; // Reseta o item selecionado
    }
};

const mapControladoras = async (dm) => {
    //Função para mapear as controladoras do DM.
    Controladoras.value = await mapControladorasHelper(dm); // Preenche as informações relacionadas às controladoras e ajusta a contagem inicial de valores.
    ajustarContagemInicial();
};

/**
 * Função para preencher as opções de controladoras disponíveis para seleção.
 */
const preencherControladoraOptions = () => {
    controladoraOptions.value = pcoHelper(Controladoras.value);
};
/**
 * Função para ajustar a contagem inicial dos valores das controladoras com base nas existentes.
 */
const ajustarContagemInicial = () => {
    ContagemHelper(Controladoras.value, nextValues);
};
/**
 * Função para preencher as opções de controladoras, incluindo molas, dips, andares, posições e motores.
 */
const preencherOpcoesControladoras = () => {
    pocHelper(Controladoras.value, { molasOptions, dipOptions, andarOptions, posicaoOptions, motorOptions, placaOptions });
};
const getTooltipText = (data) => {
    // Declara uma função chamada getTooltipText
    if (data.modelo === '2018') {
        // Verifica se o modelo é '2018'
        return t('controller_2018'); // Retorna o texto traduzido para 'controller_2018'
    } else if (data.modelo === '2023') {
        // Verifica se o modelo é '2023'
        return t('controller_2023'); // Retorna o texto traduzido para 'controller_2023'
    } else {
        // Caso contrário
        return t('default_controller'); // Retorna o texto traduzido para 'default_controller'
    }
};
const configurarVisibilidade = () => {
    // Declara uma função chamada configurarVisibilidade
    if (!admin()) {
        // Verifica se o usuário não é administrador
        show.value = true; // Define a variável reativa show como true
        fetchItemDM(); // Chama a função fetchItemDM para buscar os itens do DM
        loadData(); // Chama a função loadData para carregar os dados (trocar aqui caso haja algum comportamento estranho na listagem de produtos)
        preencherOpcoesControladoras(); // Chama a função preencherOpcoesControladoras para preencher as opções de controladoras
        preencherControladoraOptions(); // Chama a função preencherControladoraOptions para preencher as opções de controladoras
        operador.value = true; // Define a variável reativa operador como true
    } else {
        active.value = '1'; // Define a variável reativa active como 1
    }
};

const adicionarProduto = async () => {
    // Declara uma função assíncrona chamada adicionarProduto
    if (!validarCampos()) {
        // Verifica se a validação dos campos falhou
        return; // Se falhar, não continua
    }

    const data = prepareItemDMData('adicionar', DM, produtoSelecionado, Controladoras); // Prepara os dados do item para adicionar
    try {
        // Inicia um bloco try para capturar possíveis erros
        loading.value = true; // Ativa o estado de loading
        await dmService.adicionarItem(data); // Faz uma requisição para adicionar o item
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('product_added_sucess'), life: 3000 }); // Adiciona uma mensagem de sucesso ao toast
        showDialogProduto.value = false; // Fecha o diálogo de produto
        resetProdutoSelecionado(produtoSelecionado); // Reseta o produto selecionado
        fetchItemDM(); // Busca os itens do DM atualizados
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a adição
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('product_added_error'), life: 3000 }); // Adiciona uma mensagem de erro ao toast
        console.error('Erro ao carregar produtos:', error); // Loga a mensagem de erro no console
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};

// Função para atualizar o produto selecionado
const atualizarProduto = async () => {
    // Declara uma função assíncrona chamada atualizarProduto
    const data = prepareItemDMData('atualizar', DM, produtoSelecionado, Controladoras); // Prepara os dados do item para atualizar
    try {
        // Inicia um bloco try para capturar possíveis erros
        loading.value = true; // Ativa o estado de loading
        await dmService.atualizarProduto(data); // Faz uma requisição para atualizar o produto
        showDialogProduto.value = false; // Fecha o diálogo de produto
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('product_update_sucess'), life: 3000 }); // Adiciona uma mensagem de sucesso ao toast
        resetProdutoSelecionado(produtoSelecionado); // Reseta o produto selecionado
        fetchItemDM(); // Busca os itens do DM atualizados
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a atualização
        console.error('Erro ao carregar produtos:', error); // Loga a mensagem de erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('product_update_error'), life: 3000 }); // Adiciona uma mensagem de erro ao toast
    } finally {
        loading.value = false; // Desativa o estado de loading
        isEditMode.value = false; // Define o modo de edição como false
    }
};
/**
 * Função chamada quando o usuário deseja excluir um item.
 * Exibe o diálogo de confirmação de exclusão com a mensagem personalizada.
 */
const deleteItem = async (item) => {
    // Declara uma função assíncrona chamada deleteItem
    dialogMessage.value = t('confirm_delete_item', { product: item.Nome_Produto }); // Define a mensagem de diálogo com o nome do produto
    showDialogDItem.value = true; // Exibe o diálogo de confirmação de exclusão
    selectedItem.value = item; // Define o item selecionado como o produto a ser excluído
};

/**
 * Função chamada para confirmar a exclusão do item.
 * Realiza a requisição para excluir o item e atualiza a lista de itens.
 */
const confirmDeleteItem = async () => {
    // Declara uma função assíncrona chamada confirmDeleteItem
    if (!selectedItem.value) return; // Verifica se não há item selecionado e retorna se for o caso
    console.log(selectedItem.value); // Loga o item selecionado no console
    try {
        // Inicia um bloco try para capturar possíveis erros
        showDialogDItem.value = false; // Fecha o diálogo de confirmação de exclusão
        loading.value = true; // Ativa o estado de loading
        const data = prepareItemDMData('deletar', DM, selectedItem); // Prepara os dados para deletar o item
        await dmService.deletarItem(data); // Faz uma requisição para deletar o item
        // Atualiza a lista de itens após exclusão
        fetchItemDM(); // Busca os itens do DM atualizados

        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('product_delete_sucess'), life: 3000 }); // Adiciona uma mensagem de sucesso ao toast
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a exclusão
        console.error('Erro ao excluir item:', error); // Loga a mensagem de erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('product_delete_error'), life: 3000 }); // Adiciona uma mensagem de erro ao toast
    } finally {
        loading.value = false; // Desativa o estado de loading
        selectedItem.value = null; // Reseta o item selecionado
    }
};

const fetchCliente = async () => {
    // Declara uma função assíncrona chamada fetchCliente
    loading.value = true; // Ativa o estado de loading
    try {
        // Inicia um bloco try para capturar possíveis erros
        const response = await dmService.listarClientes(); // Faz uma requisição para listar os clientes
        ListaClientes.value = [todosOption, ...FormatarListaCliente(response.data)]; // Formata e atualiza a lista de clientes
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a requisição
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_client_list'), life: 3000 }); // Adiciona uma mensagem de erro ao toast
        console.error('Erro ao carregar clientes:', error); // Loga a mensagem de erro no console
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};

const configurarCliente = () => {
    // Declara uma função chamada configurarCliente
    const cliente = ListaClientes.value.find((c) => c.value.id_cliente === DM.id_cliente); // Encontra o cliente correspondente ao ID do cliente no DM
    if (cliente) {
        // Verifica se o cliente foi encontrado
        selectedClient.value = cliente; // Define o cliente selecionado
        usarApi.value = cliente.value.usar_api; // Define se o cliente usa API
    } else {
        console.warn('Cliente não encontrado na ListaClientes:', DM.id_cliente); // Loga uma mensagem de aviso no console
    }
};

const fetchItemDM = async () => {
    // Declara uma função assíncrona chamada fetchItemDM
    loading.value = true; // Ativa o estado de loading
    try {
        // Inicia um bloco try para capturar possíveis erros
        const data = prepareItemDMData('listar', DM); // Prepara os dados para listar os itens do DM
        const response = await dmService.fetchItemDM(data); // Faz uma requisição para buscar os itens do DM
        ListaItens.value = response.data; // Atualiza a lista de itens com a resposta
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a requisição
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_client_dm_iten_list'), life: 3000 }); // Adiciona uma mensagem de erro ao toast
        console.error('Erro ao carregar Itens:', error); // Loga a mensagem de erro no console
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};
const loadData = async () => {
    loading.value = true;
    try {
        if (!dataStore.produtos) await dataStore.fetchProdutos();
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_initial_data'), life: 3000 });
        console.error('Erro ao carregar dados iniciais:', error);
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};

const handleSalvarDadosChange = () => {
    // Declara uma função chamada handleSalvarDadosChange
    if (!salvardados.value) {
        // Verifica se a variável reativa salvardados é false
        supe.value = false; // Define a variável reativa supe como false
        dupe.value = false; // Define a variável reativa dupe como false
    }
};

watch(
    () => DM.ID_Cliente, // Observa mudanças no ID do cliente no objeto DM
    (newClienteId) => {
        // Função de callback chamada quando o ID do cliente muda
        const client = ListaClientes.value.find((client) => client.value.id_cliente === newClienteId); // Encontra o cliente correspondente ao novo ID do cliente
        if (client) {
            // Verifica se o cliente foi encontrado
            selectedClient.value = { ...client.value }; // Atualiza selectedClient com o cliente selecionado
            usarApi.value = client.value.usar_api ?? false; // Verifica se usar_api é nulo e define como false
        } else {
            usarApi.value = false; // Define usarApi como false se o cliente não for encontrado
        }
    }
);

watch(
    () => DM.ID_DM,
    (newIdDm) => {
        const idCliente = DM.ID_Cliente; // pega direto do objeto DM
        if (newIdDm && idCliente) {
            carregarLocker(newIdDm, idCliente);
        }
    }
);

watch(active, (newIndex, oldIndex) => {
    // Observa mudanças na variável reativa active
    if (newIndex !== oldIndex && newIndex === '0') {
        // Verifica se o índice mudou e se o novo índice é 0
        resetDMForm(DM, Controladoras, selectedClient.value, nextValues); // Reseta o formulário de DM
        fetchDMS(); // Busca as DMs
        visible.value = false; // Define a variável reativa visible como false
    }
});

watch(
    () => filters.value.global.value, // Observa mudanças no valor do filtro global
    (newValue, oldValue) => {
        if (debounceTimeout.value) {
            clearTimeout(debounceTimeout.value); // Limpa o timeout anterior
        }

        // Espera 1 segundo após a digitação
        debounceTimeout.value = setTimeout(() => {
            fetchDMS(currentPage.value); // Carrega os produtos com o filtro atualizado
        }, 1000); // Tempo de espera de 1000ms (1 segundo)
    },
    { immediate: true } // Executa a função de busca imediatamente ao observar a mudança
);

onMounted(async () => {
    // Declara uma função assíncrona chamada onMounted
    await loadData(); // Carrega os dados iniciais
    await fetchCliente(); // Busca a lista de clientes
    await fetchDMS(); // Busca a lista de DMs

    active.value = '0';
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Tabs v-model:value="active" :value="0" v-if="!show">
                    <TabList>
                        <Tab value="0">{{ $t('dispenser_machine_list') }}</Tab>
                        <Tab v-if="admin()" value="1">{{ visible ? t('edit_dispenser_machine') : t('add_dispenser_machine') }}</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel value="0">
                            <div class="col-12">
                                <DataTable
                                    v-model:filters="filters"
                                    :value="ListaDMS"
                                    stripedRows
                                    removableSort
                                    paginator
                                    lazy
                                    :totalRecords="totalRecords"
                                    :rows="lazyParams.value?.rows || 10"
                                    :rowsPerPageOptions="[5, 10, 20, 50]"
                                    :globalFilterFields="['Numero', 'Identificacao', 'ClienteNome', 'local', 'Updated']"
                                    selectionMode="single"
                                    tableStyle="min-width: 50rem; table-layout: fixed;"
                                    dataKey="id"
                                    :metaKeySelection="false"
                                    @rowSelect="onRowSelect"
                                    @click="active.value = '1'"
                                    :sortOrder="lazyParams.value?.sortOrder || 1"
                                    :sortField="lazyParams.value?.sortField || 'Identificacao'"
                                    @filter="onFilterChange($event)"
                                    @page="onPageChange($event)"
                                    @sort="onSortChange($event)"
                                >
                                    <template #header>
                                        <div class="flex justify-content-between align-items-center">
                                            <div class="flex justify-content-start">
                                                <span>{{ $t('total_records', { count: totalRecords }) }}</span>
                                            </div>
                                            <div>
                                                <IconField iconPosition="left">
                                                    <InputIcon>
                                                        <i class="pi pi-search" />
                                                    </InputIcon>
                                                    <InputText v-model="filters['global'].value" :placeholder="t('search')" @input="debouncedFilterChange" autocomplete="off" />
                                                </IconField>
                                            </div>
                                        </div>
                                    </template>
                                    <template #empty>{{ $t('no_dm_added') }} </template>
                                    <Column field="Identificacao" sortable :header="t('identification')">
                                        <template #body="{ data }">
                                            <span class="tooltip-target" v-tooltip="data.Identificacao">{{ data.Identificacao }}</span>
                                        </template></Column
                                    >
                                    <Column field="Numero" sortable :header="t('number')">
                                        <template #body="{ data }">
                                            <span class="tooltip-target" v-tooltip="data.Numero">{{ data.Numero }}</span>
                                        </template>
                                    </Column>

                                    <Column field="ClienteNome" sortable :header="t('client')">
                                        <template #body="{ data }">
                                            <span class="tooltip-target" v-tooltip="data.ClienteNome">{{ data.ClienteNome }}</span>
                                        </template></Column
                                    >
                                    <!-- <Column field="local" sortable :header="t('station')">
                                        <template #body="{ data }">
                                            <span class="tooltip-target" v-tooltip="data.local">{{ data.local }}</span>
                                        </template></Column
                                    > -->
                                    <Column field="Ativo" sortable style="width: 9%; text-align: center" :header="t('active')">
                                        <template #body="{ data }">
                                            <i class="pi" :class="{ 'pi-check-circle pi-yes ': data.Ativo, 'pi-times-circle pi-no': !data.Ativo }"></i>
                                        </template>
                                    </Column>
                                    <!-- <Column field="Locker" sortable style="width: 9%; text-align: center" :header="t('locker')">
                                        <template #body="{ data }">
                                            <i class="pi" :class="{ 'pi-check-circle pi-yes ': locker.is_locker, 'pi-times-circle pi-no': !locker.is_locker }"></i>
                                        </template>
                                    </Column> -->
                                    <Column field="Updated" style="width: 15%" sortable :header="t('updated')">
                                        <template #body="{ data }">
                                            {{ normalizeDateTime(data.Updated, true) }}
                                        </template>
                                    </Column>
                                    <Column style="min-width: 8rem" v-if="admin()">
                                        <template #body="slotProps">
                                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteDM(slotProps.data)" />
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </TabPanel>
                        <TabPanel value="1">
                            <div class="grid">
                                <div class="col-12">
                                    <div class="mt-5">
                                        <!--Formulário para adicionar ou editar um cliente -->
                                        <form @submit.prevent="submitForm">
                                            <div class="mt-5 mx-0 p-fluid grid">
                                                <div class="lg:col-12 md:col-12 sm:col-12">
                                                    <label for="name">{{ t('client') }}:</label>
                                                    <Select class="my-2 w-full" v-model="selectedClient" :options="ListaClientes" optionLabel="label" optionValue="value" :placeholder="t('select_one')" />
                                                </div>
                                                <div class="lg:col-6 md:col-9 sm:col-12">
                                                    <label for="indetificacao">{{ t('dm_identification') }}</label>
                                                    <InputText class="my-2 w-full" v-model="DM.Identificacao" id="indetificacao" />
                                                </div>
                                                <div class="lg:col-6 md:col-9 sm:col-12">
                                                    <label for="numero">{{ t('dm_number') }}:</label>
                                                    <InputText class="my-2 w-full" v-model="DM.Numero" id="numero" />
                                                </div>
                                                <div class="flex flex-column align-items-center xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                                    <label class="mt-0 text-nowrap" for="switch2">{{ t('dm_active') }}</label>
                                                    <div class="grid mt-3">
                                                        <ToggleSwitch class="mr-2" v-model="DM.Ativo" inputId="switch2" />
                                                        <span class="ml-2">{{ DM.Ativo ? $t('yes') : $t('no') }}</span>
                                                    </div>
                                                </div>
                                                <div class="flex flex-column align-items-center xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                                    <label class="mt-0 text-nowrap" for="switch3">{{ t('dm_return') }}</label>
                                                    <div class="grid mt-3">
                                                        <ToggleSwitch class="mr-2" v-model="DM.Devolucao" inputId="switch3" />
                                                        <span class="ml-2">{{ DM.Devolucao ? $t('yes') : $t('no') }}</span>
                                                    </div>
                                                </div>
                                                <div class="flex flex-column align-items-center xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                                    <label class="mt-0 text-nowrap" for="switch4">{{ t('dm_locker') }}</label>
                                                    <div class="grid mt-3">
                                                        <ToggleSwitch v-model="locker.is_locker" inputId="switch4" />
                                                        <span class="ml-2">{{ locker.is_locker ? $t('yes') : $t('no') }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <hr />

                            <panel :header="$t('dm_options')" class="mt-4">
                                <div class="grid mt-5 mx-0 p-fluid">
                                    <!-- Painel Configuração da Máquina -->
                                    <div class="col-12 md:col-6">
                                        <panel :header="$t('dm_config_with')">
                                            <div id="fim" class="flex flex-column gap-3 mt-3">
                                                <div class="flex align-items-center">
                                                    <Checkbox v-model="DM.voucher" inputId="Voucher" :binary="true" />
                                                    <label for="Voucher" class="ml-2"> {{ t('voucher') }} </label>
                                                </div>
                                                <div class="flex align-items-center">
                                                    <Checkbox v-model="DM.cracha" inputId="cracha" :binary="true" />
                                                    <label for="cracha" class="ml-2"> {{ t('badge') }} </label>
                                                </div>
                                                <div class="flex align-items-center">
                                                    <Checkbox v-model="DM.OP_Biometria" inputId="Biometria" :binary="true" />
                                                    <label for="Biometria" class="ml-2"> {{ t('biometric_reader') }} </label>
                                                </div>
                                                <div class="flex align-items-center">
                                                    <Checkbox v-model="DM.OP_Facial" inputId="Facial" :binary="true" />
                                                    <label for="Facial" class="ml-2">{{ t('facial_recognition') }}</label>
                                                </div>
                                                <div class="flex align-items-center">
                                                    <Checkbox v-model="DM.OP_Senha" inputId="Senha" :binary="true" />
                                                    <label for="Senha" class="ml-2"> {{ t('password') }} </label>
                                                </div>
                                            </div>
                                        </panel>
                                    </div>

                                    <!-- Painel Opções de Retirada -->
                                    <div class="col-12 md:col-6">
                                        <panel :header="$t('dm_config')">
                                            <div class="flex flex-column gap-3 mt-3">
                                                <div class="flex align-items-center flex-column">
                                                    <label for="switch4" class="mt-0 text-nowrap"> {{ $t('dm_config_data') }}</label>
                                                    <div class="grid mt-3">
                                                        <ToggleSwitch class="mr-2" v-model="salvardados" inputId="switch4" @change="handleSalvarDadosChange" />
                                                        <span class="ml-2">{{ salvardados ? $t('yes') : $t('no') }}</span>
                                                    </div>
                                                </div>

                                                <div class="flex flex-column gap-3">
                                                    <div class="flex align-items-center">
                                                        <Checkbox v-model="supe" inputId="supe" :binary="true" :disabled="!salvardados" />
                                                        <label for="supe" class="ml-2">{{ $t('employee_name') }} </label>
                                                    </div>
                                                    <div class="flex align-items-center">
                                                        <Checkbox v-model="dupe" inputId="dupe" :binary="true" :disabled="!salvardados" />
                                                        <label for="dupe" class="ml-2"> {{ $t('employee_id') }} </label>
                                                    </div>
                                                </div>
                                                <hr />
                                                <div class="flex flex-column gap-3">
                                                    <div class="flex align-items-center flex-column mt-4">
                                                        <label for="switch4" class="mt-0 text-nowrap">{{ $t('dm_config_data_save') }}</label>
                                                        <div class="grid mt-3">
                                                            <ToggleSwitch class="mr-2" v-model="salvardadosMaquina" inputId="switch4" />
                                                            <span class="ml-2">{{ salvardadosMaquina ? $t('yes') : $t('no') }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </panel>
                                    </div>
                                </div>
                            </panel>

                            <div v-if="selectedClient.usar_api" class="mt-5 card grid mb-5">
                                <div class="flex xl:col-12 lg:col-12 md:col-12 sm:col-12 mt-3">
                                    <label class="mt-3 ml-4 mb-5" for="switch3">Usa Mob?</label>
                                    <ToggleSwitch class="grid mt-3 ml-3" v-model="DM.Integracao" inputId="switch3" />
                                </div>
                                <div class="lg:col-6 md:col-9 sm:col-12">
                                    <label for="userapi">{{ t('userid_api') }}:</label>
                                    <InputText class="my-2 w-full" id="userapi" v-model="DM.UserID" />
                                </div>
                                <div class="lg:col-6 md:col-9 sm:col-12">
                                    <label for="senhaapi">{{ t('api_password') }}:</label>
                                    <InputText class="my-2 w-full" id="senhaapi" v-model="DM.ChaveAPI" />
                                </div>
                                <div class="lg:col-6 md:col-9 sm:col-12">
                                    <label for="clienteAPI">{{ t('idclient_api') }}:</label>
                                    <InputText class="my-2 w-full" id="clienteAPI" v-model="DM.ClienteID" />
                                </div>
                                <div class="lg:col-6 md:col-9 sm:col-12">
                                    <label for="urlapi">{{ t('url_api') }}:</label>
                                    <InputText class="my-2 w-full" id="urlapi" v-model="DM.URL" />
                                </div>
                                <div class="lg:col-6 md:col-9 sm:col-12">
                                    <label for="codigo">{{ t('key') }}:</label>
                                    <Textarea v-model="DM.Chave" class="my-2 overflow-hidden w-full" style="min-height: 50px; min-width: 450px" inputClass="w-full" rows="2" cols="30" />
                                </div>
                                <div class="mt-2 lg:col-6 md:col-9 sm:col-12">
                                    <!-- <label for="validar">{{ t('validate_external_data') }}</label> -->
                                    <Button class="mt-4 w-full" icon="pi pi-check" :label="t('validate_external_data_text')" @click="validarDados" />
                                </div>
                            </div>
                            <Button class="mt-7" icon="pi pi-plus" :label="t('new_controller')" @click="addControladora" />

                            <div>
                                <div v-for="(controladora, index) in Controladoras" :key="index" class="mt-5 card" v-show="!DM.ID_DM || !controladora?.deleted" :ref="setRefs">
                                    <div class="flex justify-content-between flex-wrap">
                                        <h5>{{ $t('controller_number', { number: index + 1 }) }}</h5>

                                        <!-- Botão de Remoção -->
                                        <Button icon="pi pi-trash" :label="$t('remove')" class="p-button-danger" @click="removeControladora(index)" />
                                    </div>

                                    <div class="field mt-3 col-12">
                                        <label class="mr-3">{{ t('model') }}: </label>
                                        <Select
                                            class="select"
                                            style="width: 250px"
                                            v-model="controladora.tipo"
                                            optionLabel="label"
                                            optionValue="value"
                                            :options="tipoControladoras"
                                            :placeholder="$t('select_controller')"
                                            @change="updateTipoControladora(index, controladora.tipo)"
                                        />
                                    </div>

                                    <!<!-- Controladora 2018 -->
                                    <div class="" v-if="controladora.tipo === '2018'">
                                        <div class="field col-12 mt-3">
                                            <label class="mr-5 p-0">{{ t('board') }}: </label>
                                            <InputText class="" style="width: 250px" v-model="controladora.dados.placa" />
                                        </div>

                                        <fieldset class="field card mt-4">
                                            <legend>{{ t('spring') }}</legend>

                                            <div class="checkbox-group mt-3" style="text-align: center">
                                                <div v-for="i in 10" :key="i" class="checkbox-item mt-3">
                                                    <Checkbox v-model="controladora.dados.molas" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>

                                            <div class="button-group mt-5" style="text-align: end">
                                                <Button class="mr-3" style="width: 200px" :label="$t('select_all')" @click="selectAllCliente(index)" />
                                                <Button style="width: 200px" :label="$t('deselect')" @click="desselectAllCliente(index)" />
                                            </div>
                                        </fieldset>
                                    </div>

                                    <!-- Controladora 2023 -->
                                    <div v-if="controladora.tipo === '2023'">
                                        <div class="field col-12 mt-3">
                                            <label class="mr-6 p-0">{{ t('dip') }}: </label>
                                            <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                        </div>
                                        <div class="card mt-5">
                                            <div class="field mt-3">
                                                <h4>{{ t('level_floor') }}:</h4>
                                                <div class="checkbox-group">
                                                    <div v-for="i in 6" :key="i" class="checkbox-item mt-3">
                                                        <Checkbox v-model="controladora.dados.andar" :value="i" />
                                                        <label>{{ i }}</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="field mt-6">
                                                <h4>{{ t('position') }}</h4>
                                                <div class="checkbox-group">
                                                    <div v-for="i in 15" :key="i" class="checkbox-item mt-3">
                                                        <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                        <label>{{ i }}</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="button-group mt-5" style="text-align: end">
                                                <Button class="mr-3" style="width: 200px" :label="$t('select_all')" @click="selectAllCliente(index)" />
                                                <Button style="width: 200px" :label="$t('deselect')" @click="desselectAllCliente(index)" />
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Controladora 2024 -->
                                    <div v-if="controladora.tipo === '2024'">
                                        <div class="field col-12 mt-3">
                                            <label class="mr-5 p-0">{{ t('board') }}: </label>
                                            <InputText style="width: 250px" v-model="controladora.dados.placa" />
                                        </div>
                                        <div class="field col-12 mt-3">
                                            <label class="mr-5 p-0">{{ t('motor') }}: </label>
                                            <InputText style="width: 250px" v-model="controladora.dados.motor" />
                                        </div>
                                    </div>

                                    <!-- Controladora Locker -->
                                    <div v-if="controladora.tipo === 'Locker-Padrao'">
                                        <div class="field col-12 mt-3">
                                            <label class="mr-6 p-0">{{ t('dip') }}: </label>
                                            <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                        </div>
                                        <div class="field card">
                                            <h4>{{ t('position') }}</h4>
                                            <div class="checkbox-group">
                                                <div v-for="i in 20" :key="i" class="checkbox-item mt-3">
                                                    <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>

                                            <div class="button-group mt-5" style="text-align: end">
                                                <Button class="mr-3" style="width: 200px" :label="$t('select_all')" @click="selectAllCliente(index)" />
                                                <Button style="width: 200px" :label="$t('deselect')" @click="desselectAllCliente(index)" />
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="controladora.tipo === 'Locker-Ker'">
                                        <div class="field col-12 mt-3">
                                            <label class="mr-6 p-0">{{ t('dip') }}: </label>
                                            <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                        </div>
                                        <div class="field card">
                                            <h4>{{ t('position') }}</h4>
                                            <div class="checkbox-group">
                                                <div v-for="i in 12" :key="i" class="checkbox-item mt-3">
                                                    <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>

                                            <div class="button-group mt-5" style="text-align: end">
                                                <Button class="mr-3" style="width: 200px" :label="$t('select_all')" @click="selectAllCliente(index)" />
                                                <Button style="width: 200px" :label="$t('deselect')" @click="desselectAllCliente(index)" />
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="controladora.tipo === 'Locker-Opus'">
                                        <div class="field col-12 mt-3">
                                            <label class="mr-6 p-0">{{ t('dip') }}: </label>
                                            <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                        </div>
                                        <div class="field card">
                                            <h4>{{ t('position') }}</h4>
                                            <div class="checkbox-group">
                                                <div v-for="i in 25" :key="i" class="checkbox-item mt-3">
                                                    <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>

                                            <div class="button-group mt-5" style="text-align: end">
                                                <Button class="mr-3" style="width: 200px" :label="$t('select_all')" @click="selectAllCliente(index)" />
                                                <Button style="width: 200px" :label="$t('deselect')" @click="desselectAllCliente(index)" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-5 mx-0 p-fluid grid">
                                <Button v-if="!visible" :label="$t('save')" icon="pi pi-check" severity="info" @click="adicionarDM" class="full mt-4 mr-2" />
                                <Button v-if="visible" :label="$t('save')" icon="pi pi-check" severity="info" @click="atualizarDM" class="full mt-4 mr-2" />
                            </div>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
                <div class="card" v-if="operador">
                    <div class="mx-0 grid">
                        <div class="col-12">
                            <div class="flex mt-5 justify-content-between">
                                <h5>{{ t('itens_dms') }} {{ DM.Identificacao }}</h5>
                                <Button :label="$t('add_items')" @click="showDialogProduto = true" />
                            </div>
                            <DataTable
                                v-model:filters="filters"
                                :value="ListaItens"
                                rowGroupMode="subheader"
                                groupRowsBy="modelo"
                                selectionMode="single"
                                tableStyle="min-width: 50rem; table-layout: fixed;"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                :globalFilterFields="['SKU', 'Nome_Produto', 'Posicao', 'QTD']"
                                stripedRows
                                removableSort
                                dataKey="id"
                                :metaKeySelection="false"
                                @rowSelect="handleRowSelection"
                                paginator
                                :rows="10"
                                :sortOrder="1"
                                :sortField="'Posicao'"
                            >
                                <template #header>
                                    <div class="flex justify-content-between mt-4">
                                        <div class="font-semibold">
                                            <span>{{ $t('total_records', { count: ListaItens.length }) }}</span>
                                        </div>
                                        <IconField iconPosition="left">
                                            <InputIcon>
                                                <i class="pi pi-search" />
                                            </InputIcon>
                                            <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                                        </IconField>
                                    </div>
                                </template>

                                <template #empty> {{ t('no_added_item') }} </template>

                                <Column field="SKU" style="width: 9%" sortable :header="t('sku')">
                                    <template #body="{ data }">
                                        <span class="tooltip-target" v-tooltip="data.SKU">{{ data.SKU }}</span>
                                    </template>
                                </Column>
                                <Column field="Nome_Produto" sortable style="width: 30%" :header="t('product')">
                                    <template #body="{ data }">
                                        <span class="tooltip-target" v-tooltip="data.Nome_Produto">{{ data.Nome_Produto }}</span>
                                    </template></Column
                                >
                                <Column field="Posicao" sortable style="width: 40%" :header="t('position')">
                                    <template #body="{ data }">
                                        <span v-tooltip="getTooltipText(data)">
                                            {{ data.Posicao }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="QTD" sortable style="width: 9%" :header="t('quantity_short')"></Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteItem(slotProps.data)" v-tooltip="{ value: $t('delete_product'), showDelay: 1000, hideDelay: 300 }" />
                                    </template>
                                </Column>
                                <template #groupheader="slotProps">
                                    <div class="flex align-items-center text-3xl gap-2">
                                        <span v-tooltip="$t('controller_model')">
                                            {{ slotProps.data.modelo }}
                                        </span>
                                    </div>
                                </template>
                            </DataTable>
                        </div>
                    </div>
                    <Button class="m-1" :label="$t('back')" @click="voltar()" />
                </div>
                <LoadingSpinner v-if="loading" />
            </div>
        </div>
    </div>
    <Dialog class="" :header="isEditMode ? $t('edit_product') : $t('add_product')" :visible.sync="showDialogProduto" :modal="true" :closable="false" :draggable="false">
        <div class="box card">
            <div class="grid">
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Produto" class="font-semibold">{{ t('product') }}:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <Select
                        v-model="produtoSelecionado.id_produto"
                        class="w-full"
                        removableSort
                        :options="ListaProdutos"
                        :virtualScrollerOptions="{ itemSize: 30 }"
                        :filter="true"
                        :filterBy="'label'"
                        optionLabel="label"
                        optionValue="value"
                        :placeholder="t('select_product')"
                        v-tooltip="{ value: t('select_product'), showDelay: 1000, hideDelay: 300 }"
                    >
                        <template #option="slotProps">
                            <span v-tooltip.top="slotProps.option.label">
                                {{ slotProps.option.label }}
                            </span>
                        </template>
                    </Select>
                </div>
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Controladora" class="font-semibold">{{ t('controller') }}:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <Select v-model="produtoSelecionado.Controladora" class="w-full" optionLabel="label" optionValue="value" :options="controladoraOptions" @change="handleControladoraChange" :placeholder="$t('controller_select')" />
                </div>
                <!-- Exibir campos dependendo do tipo de controladora -->
                <template v-if="tipoControladoraSelecionada === '2018'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">{{ t('board') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Select v-model="produtoSelecionado.Placa" class="w-full" :options="placaOptions" optionLabel="label" optionValue="value" :placeholder="$t('board_select')" />
                    </div>
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="molas" class="font-semibold">{{ t('spring') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Select v-model="produtoSelecionado.Motor1" class="w-full" :options="molasOptions" optionLabel="label" optionValue="value" :placeholder="$t('spring_select')" />
                    </div>
                </template>

                <template v-if="tipoControladoraSelecionada === '2023'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">{{ t('dip') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Select v-model="produtoSelecionado.Dip" class="w-full" :options="dipOptions" optionLabel="label" optionValue="value" :placeholder="$t('dip_select')" />
                    </div>

                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Andar" class="font-semibold">{{ t('level_floor') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Select v-model="produtoSelecionado.Andar" class="w-full" :options="andarOptions" optionLabel="label" optionValue="value" :placeholder="$t('floor_select')" @change="handleAndarChange" />
                    </div>

                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Posicao" class="font-semibold">{{ t('position') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Select v-model="produtoSelecionado.Posicao" class="w-full" :options="posicaoOptions" optionLabel="label" optionValue="value" :placeholder="$t('position_select')" @change="validarAndarSelecionado" />
                    </div>
                </template>

                <template v-if="tipoControladoraSelecionada === '2024'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Motor" class="font-semibold">{{ t('motor') }}:</label>
                    </div>
                    <div class="lg:col-8 md:c ol-8 sm:col-8 flex justify-content-end">
                        <Select v-model="produtoSelecionado.Motor1" class="w-full" :options="motorOptions" optionLabel="label" optionValue="value" :placeholder="$t('motor_select')" />
                    </div>
                </template>

                <template v-if="isArmario(tipoControladoraSelecionada)">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">{{ t('dip') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Select v-model="produtoSelecionado.Dip" class="w-full" :options="dipOptions" optionLabel="label" optionValue="value" :placeholder="$t('dip_select')" />
                    </div>
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Posicao" class="font-semibold">{{ t('position') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Select v-model="produtoSelecionado.Posicao" class="w-full" :options="posicaoOptions" optionLabel="label" optionValue="value" :placeholder="$t('position_select')" />
                    </div>
                </template>
                <div v-if="tipoControladoraSelecionada" class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Capacidade" class="font-semibold">{{ t('capacity') }}:</label>
                </div>
                <div v-if="tipoControladoraSelecionada" class="lg:col-8 md:col-8 sm:col-8 justify-content-end flex">
                    <InputNumber
                        inputId="Capacidade"
                        :disabled="tipoControladoraSelecionada === 'Locker-Padrao' || tipoControladoraSelecionada === 'Locker-Ker' || tipoControladoraSelecionada === 'Locker-Opus'"
                        class="w-full"
                        v-model="produtoSelecionado.Capacidade"
                        :mask="1"
                        aria-describedby="username-help"
                        :suffix="$t('capacity_suffix')"
                    />
                </div>
            </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-4">
            <Button type="button" :label="$t('cancel')" severity="secondary" @click="handleCancelar()"></Button>
            <Button type="button" style="width: 300px !important" :label="isEditMode ? $t('update') : $t('save')" @click="isEditMode ? atualizarProduto() : adicionarProduto()"></Button>
        </div>
    </Dialog>
    <Dialog :header="$t('dialog_delete_item')" :visible.sync="showDialogDItem" style="width: 30vw" :modal="true" :closable="false" :draggable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button :label="$t('cancel')" icon="pi pi-times" class="p-button-secondary" @click="cancelDelete" />
            <Button label="OK" icon="pi pi-check" @click="confirmDeleteItem" />
        </template>
    </Dialog>
    <Dialog :header="$t('dialog_delte_dm')" :visible.sync="showDialogDVM" style="width: 30vw" :modal="true" :closable="false" :draggable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-secondary" @click="cancelDelete" />
            <Button label="Sim" icon="pi pi-check" @click="confirmdeleteDM" />
        </template>
    </Dialog>
    <Dialog header="Deletar Controladora" :visible.sync="showDialogControl" style="width: 30vw" :modal="true" :closable="false" :draggable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-secondary" @click="cancelDelete" />
            <Button label="Sim" icon="pi pi-check" @click="confirmdeleteControl" />
        </template>
    </Dialog>
    <ScrollTop />
</template>

<style scoped>
@media (max-width: 768px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }

    .box {
        width: 50vw;
    }
}

@media (min-width: 769px) {
    .box {
        width: 40vw;
    }
}

@media (min-width: 900px) {
    .box {
        width: 30vw;
    }

    .card {
        overflow: hidden;
        /* Ensure content doesn't overflow */
        box-sizing: border-box;
        /* Include padding and border in element's total width and height */
    }

    .checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .checkbox-item {
        display: flex;
        align-items: center;
        gap: 5px;
    }
}
/* Estilos para a exibição de tooltip */
.tooltip-target {
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
}

/* Estilos para o tooltip, permitindo múltiplas linhas de texto */
.v-tooltip {
    max-width: 400px;
    white-space: normal;
}
</style>
