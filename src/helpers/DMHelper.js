import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar informações do usuário autenticado.
const store = useAuthStore();
/**
 * Manipula mudanças na controladora selecionada.
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @param {Object} produtoSelecionado - Produto atualmente selecionado, com propriedades como `Controladora` e `Motor1`.
 * @param {Object[]} ListaItens - Lista de itens associados que afetam as opções disponíveis para a controladora.
 * @param {boolean} isEditMode - Indica se está no modo de edição, permitindo ajustes nas opções disponíveis.
 * @param {Object} options - Objeto contendo os estados reativos para atualizar as opções na UI.
 * @param {Object} options.molasOptions - Estado reativo para opções de molas disponíveis.
 * @param {Object} options.dipOptions - Estado reativo para opções de DIP disponíveis.
 * @param {Object} options.andarOptions - Estado reativo para opções de andar disponíveis.
 * @param {Object} options.posicaoOptions - Estado reativo para opções de posição disponíveis.
 * @param {Object} options.motorOptions - Estado reativo para opções de motor disponíveis.
 * @param {Object} options.placaOptions - Estado reativo para opções de placa disponíveis.
 *
 * @description
 * A função é responsável por ajustar as opções de molas, DIP, andar, posição, motor e placa de acordo com a controladora selecionada,
 * levando em consideração seu tipo (2018, 2023, 2024 ou Locker). Além disso, a função lida com a lógica de edição, removendo as molas
 * ocupadas se necessário.
 */
export const handleControladoraChange = (Controladoras, produtoSelecionado, ListaItens, isEditMode, options) => {
    const { molasOptions, dipOptions, andarOptions, posicaoOptions, motorOptions, placaOptions } = options; // Extrai as opções de molas, dip, andar, posição, motor e placa do objeto 'options'.

    const selectedControladora = Controladoras.find((c) => c.id === produtoSelecionado.Controladora); // Encontra a controladora selecionada pela id no array de controladoras.

    if (!selectedControladora) return; // Se não encontrar a controladora selecionada, retorna imediatamente.

    if (selectedControladora.tipo === '2018') {// Verifica se o tipo da controladora é '2018'.
        let molasOcupadas = ListaItens.filter((item) => {// Filtra os itens da lista para encontrar as molas ocupadas associadas à controladora '2018'.
            const [tipo, identificador] = item.Posicao.replace(/\s/g, '').split('/'); // Separa a posição em tipo e identificador, removendo espaços.
            return tipo === '2018' && Number(identificador) === selectedControladora.dados.placa; // Retorna os itens que correspondem ao tipo '2018' e ao identificador da controladora.
        }).map((item) => {// Mapeia os itens para retornar as molas ocupadas.
            const [_, __, mola1] = item.Posicao.replace(/\s/g, '').split('/'); // Para cada item, separa a posição e retorna a mola1.
            return Number(mola1);// Retorna a mola1 como um número.
        });

        if (isEditMode && produtoSelecionado.Motor1) {// Se estiver no modo de edição e se houver um motor1 selecionado, remove a mola ocupada.
            molasOcupadas = molasOcupadas.filter((mola) => mola !== produtoSelecionado.Motor1);// Filtra as molas ocupadas, removendo a mola selecionada.
        }

        const molasDisponiveis = selectedControladora.dados.molas.filter((mola) => !molasOcupadas.includes(mola));// Filtra as molas disponíveis, removendo as ocupadas.
        
        const sortedMolasDisponiveis = molasDisponiveis.sort((a, b) => a - b);// Ordena as molas disponíveis.

        molasOptions.value = sortedMolasDisponiveis.map((mola) => ({ label: mola, value: mola }));// Atualiza as opções de molas disponíveis.

        const sortedPlacaOptions = [{ label: selectedControladora.dados.placa, value: selectedControladora.dados.placa }].sort((a, b) => a.label - b.label); // Atualiza as opções de placa para a controladora selecionada.

        placaOptions.value = sortedPlacaOptions;// Atualiza as opções de placa para a controladora selecionada.
    }
    // Verifica se o tipo da controladora é '2023'.
    else if (selectedControladora.tipo === '2023') {
        // Atualiza as opções de DIP com os dados da controladora.
        dipOptions.value = [{ label: selectedControladora.dados.dip, value: selectedControladora.dados.dip }];

        const sortedAndarOptions = selectedControladora.dados.andar.sort((a, b) => a - b);
        // Atualiza as opções de andar com os andares da controladora.
        andarOptions.value = sortedAndarOptions.map((a) => ({ label: a, value: a }));

        const sortedPosicaoOptions = selectedControladora.dados.posicao.sort((a, b) => a - b);

        // Atualiza as opções de posição com as posições da controladora.
        posicaoOptions.value = sortedPosicaoOptions.map((p) => ({ label: p, value: p }));
    }
    // Verifica se o tipo da controladora é '2024'.
    else if (selectedControladora.tipo === '2024') {
        const sortedMotorOptions = selectedControladora.dados.motor.sort((a, b) => a - b);
        // Atualiza as opções de motor com o motor da controladora.
        motorOptions.value = sortedMotorOptions.map((motor) => ({ label: motor, value: motor }));
    }
    // Verifica se o tipo da controladora é um 'Locker'.
    else if (selectedControladora.tipo === 'Locker' || selectedControladora.tipo === 'Locker-Padrao' || selectedControladora.tipo === 'Locker-Ker' || selectedControladora.tipo === 'Locker-Opus') {
        produtoSelecionado.Capacidade = 1;

        // Atualiza as opções de DIP para a controladora do tipo Locker.
        let posicoesOcupadas = ListaItens.filter((item) => {
            // Separa a posição em tipo e identificador, removendo espaços.
            const [tipo, identificador] = item.Posicao.replace(/\s/g, '').split('/');
            // Retorna os itens que correspondem ao tipo 'Locker' e ao identificador da controladora.
            return (tipo === 'Locker' || tipo === 'Locker-Padrao' || tipo === 'Locker-Ker' || tipo === 'Locker-Opus') && Number(identificador) === selectedControladora.dados.dip;
        }).map((item) => {
            // Para cada item, separa a posição e retorna a posição específica do Locker.
            const [_, __, posicao] = item.Posicao.replace(/\s/g, '').split('/');
            return Number(posicao);
        });

        // Se estiver no modo de edição e houver uma posição selecionada, remove a posição ocupada.
        if (isEditMode && produtoSelecionado.Posicao) {
            posicoesOcupadas = posicoesOcupadas.filter((pos) => pos !== produtoSelecionado.Posicao);
        }

        // Filtra as posições disponíveis, removendo as que estão ocupadas.
        const posicoesDisponiveis = selectedControladora.dados.posicao.filter((pos) => !posicoesOcupadas.includes(pos));

        // Ordena as posições disponíveis.
        const sortedPosicaoOptions = posicoesDisponiveis.sort((a, b) => a - b);

        // Atualiza as opções de DIP para a controladora do tipo Locker.
        dipOptions.value = [{ label: selectedControladora.dados.dip.toString(), value: selectedControladora.dados.dip }];

        // Atualiza as opções de posição para a controladora do tipo Locker.
        posicaoOptions.value = sortedPosicaoOptions.map((p) => ({ label: p, value: p }));
    }
};

/**
 * Adiciona uma nova controladora à lista.
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @param {string} tipo - Tipo da controladora a ser adicionada.
 * @param {Object} nextValues - Objeto contendo os valores padrão para cada tipo de controladora.
 * @description
 * A função cria uma nova controladora com base no tipo fornecido e adiciona à lista de controladoras.
 * Se o tipo for '2018', ela inicializa a placa com o valor de `nextValues['2018'].placa`.
 */
export const addControladora = (Controladoras, tipo, nextValues) => {
    // Cria um objeto para a nova controladora com base no tipo fornecido.
    const newControladora = {
        ID: null, // Define o ID como nulo, indicando que ainda não foi atribuído um ID único.
        tipo, // O tipo da controladora (por exemplo, '2018').
        deleted: false, // A controladora é marcada como não deletada inicialmente.
        dados: tipo === '2018' ? { placa: nextValues['2018'].placa++ } : {} // Se o tipo for '2018', inicializa a placa com o valor atual de nextValues['2018'].placa e incrementa.
    };

    // Adiciona a nova controladora à lista de controladoras.
    Controladoras.push(newControladora);
};

/**
 * Remove uma controladora da lista.
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @param {number} index - Índice da controladora a ser removida.
 * @description
 * A função altera o status da controladora no índice especificado para "deleted: true",
 * efetivamente removendo-a da lista sem excluí-la fisicamente.
 */
export const removeControladora = (Controladoras, index) => {
    // Marca a controladora como deletada (não a remove fisicamente da lista).
    Controladoras[index].deleted = true;
};

/**
 * Preenche as opções de controladoras disponíveis para seleção.
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @returns {Array} - Lista de opções formatadas para seleção.
 * @description
 * A função percorre a lista de controladoras e gera um conjunto de opções formatadas
 * para que possam ser utilizadas em uma interface de usuário para seleção.
 * O identificador é escolhido com base no tipo da controladora (placa, dip ou valor indefinido).
 */
export const preencherControladoraOptions = (Controladoras) => {
    // Mapeia a lista de controladoras para criar uma lista de opções para seleção.
    return Controladoras.map((controladora) => {
        // Desestrutura as propriedades da controladora para obter id, tipo e dados.
        const { id, tipo, dados } = controladora;

        // Inicializa uma variável identificador com um valor vazio.
        let identificador = '';

        // Determina o identificador com base no tipo da controladora.
        if (tipo === '2018' || tipo === '2024') {
            // Para controladoras dos tipos '2018' e '2024', utiliza a placa como identificador.
            identificador = dados.placa;
        } else if (tipo === '2023' || tipo === 'Locker' || tipo === 'Locker-Padrao' || tipo === 'Locker-Ker' || tipo === 'Locker-Opus') {
            // Para controladoras dos tipos '2023' e 'Locker', utiliza o dip como identificador.
            identificador = dados.dip;
        } else {
            // Para tipos desconhecidos, define o identificador como 'Indefinido'.
            identificador = 'Indefinido';
        }

        // Retorna um objeto formatado para a lista de opções com o identificador e o ID da controladora.
        return {
            label: `${tipo}: ${identificador}`, // O texto a ser exibido na opção.
            value: id // O valor associado à opção, que é o ID da controladora.
        };
    });
};

/**
 * Ajusta as contagens iniciais de valores das controladoras.
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @param {Object} nextValues - Objeto contendo os valores padrão para cada tipo de controladora.
 * @description
 * A função verifica se já existem controladoras de cada tipo ('2018', '2023', '2024') e ajusta os valores
 * de placa ou dip no objeto `nextValues` de acordo com a maior placa ou dip existente. Se não houver nenhuma controladora
 * do tipo específico, um valor inicial será atribuído a `nextValues` para esse tipo.
 */
export const ajustarContagemInicial = (Controladoras, nextValues) => {
    // Filtra as controladoras do tipo '2018' e mapeia para uma lista de suas placas.
    const placasExistentes2018 = Controladoras.filter((controladora) => controladora.tipo === '2018').map((controladora) => controladora.dados.placa);

    // Verifica se existem placas do tipo '2018'.
    if (placasExistentes2018.length > 0) {
        // Se existirem, define o valor da próxima placa como a maior placa existente + 1.
        nextValues['2018'].placa = Math.max(...placasExistentes2018) + 1;
    } else {
        // Caso não existam placas do tipo '2018', define o valor inicial da placa como 12.
        nextValues['2018'].placa = 12;
    }

    // Filtra as controladoras do tipo '2023' e mapeia para uma lista de seus dips.
    const dipsExistentes2023 = Controladoras.filter((controladora) => controladora.tipo === '2023').map((controladora) => controladora.dados.dip);

    // Verifica se existem dips do tipo '2023'.
    if (dipsExistentes2023.length > 0) {
        // Se existirem, define o valor do próximo dip como o maior dip existente + 1.
        nextValues['2023'].dip = Math.max(...dipsExistentes2023) + 1;
    } else {
        // Caso não existam dips do tipo '2023', define o valor inicial do dip como 2.
        nextValues['2023'].dip = 2;
    }

    // Filtra as controladoras do tipo '2024' e mapeia para uma lista de suas placas.
    const placas2024Existentes = Controladoras.filter((controladora) => controladora.tipo === '2024').map((controladora) => controladora.dados.placa);

    // Verifica se existem placas do tipo '2024'.
    if (placas2024Existentes.length > 0) {
        // Se existirem, define o valor da próxima placa como a maior placa existente + 1.
        nextValues['2024'].placa = Math.max(...placas2024Existentes) + 1;
    } else {
        // Caso não existam placas do tipo '2024', define o valor inicial da placa como 101.
        nextValues['2024'].placa = 101;
    }
};

/**
 * Mapeia as controladoras de um DM para o formato necessário.
 * @param {Object} DM - Objeto DM com dados das controladoras.
 * @returns {Object[]} - Lista de controladoras mapeadas.
 * @description
 * Esta função mapeia as controladoras do objeto `DM`, transformando os dados para um formato específico necessário
 * para a aplicação. Para cada controladora, as propriedades são extraídas e formatadas conforme necessário.
 * * @typedef {Object} DadosControladora
         * @property {number|null} placa - A placa da controladora, pode ser nula.
         * @property {number|null} dip - O DIP da controladora, pode ser nulo.
         * @property {number[]} andar - Lista de andares associados à controladora.
         * @property {number[]} posicao - Lista de posições associadas à controladora.
         * @property {number[]} molas - Lista de molas associadas à controladora.
         
 */
export const mapControladoras = async (DM) => {
    // Retorna uma lista de controladoras mapeadas a partir de DM.Controladoras.
    return DM.Controladoras.map((controladora) => ({// Mapeia cada controladora do DM para um objeto com as propriedades necessárias.
        id: controladora.ID,// O ID da controladora.
        tipo: controladora.Tipo_Controladora,// O tipo da controladora.
        deleted: false,// Define a controladora como não deletada inicialmente.
        dados: {// Os dados associados à controladora.
            placa: controladora.Placa || null,// A placa da controladora, se não existir, é nula.
            dip: controladora.DIP ?? null,// O DIP da controladora, se não existir, é nulo.
            andar: Array.isArray(controladora.Andar) ? controladora.Andar.map(Number) : controladora.Andar?.split(',').map(Number) || [],// Lista de andares associados à controladora.
            posicao: Array.isArray(controladora.Posicao) ? controladora.Posicao.map(Number) : controladora.Posicao?.split(',').map(Number) || [],// Lista de posições associadas à controladora.

            /**
             * Lista de molas associadas à controladora. Se a propriedade Mola1 for uma string, ela é dividida por vírgulas.
             *
             * @type {number[]}
             */
            molas: Array.isArray(controladora.Mola1) ? controladora.Mola1.map(Number) : controladora.Mola1?.split(',').map(Number) || []
        }
    }));
};

/**
 * Seleciona todas as opções disponíveis para uma controladora.
 * @param {Object} controladora - Controladora a ser ajustada.
 */
/**
 * Preenche automaticamente as listas de molas, andares e posições de acordo com o tipo da controladora.
 *
 * @param {Object} controladora - A controladora que terá seus dados atualizados.
 * @param {string} controladora.tipo - O tipo da controladora, que pode ser '2018', '2023', ou 'Locker'.
 * @param {Object} controladora.dados - Os dados associados à controladora, que serão preenchidos com as listas correspondentes.
 * @param {number[]} controladora.dados.molas - Lista de molas da controladora (somente preenchida se o tipo for '2018').
 * @param {number[]} controladora.dados.andar - Lista de andares da controladora (somente preenchida se o tipo for '2023').
 * @param {number[]} controladora.dados.posicao - Lista de posições da controladora (preenchida conforme o tipo da controladora).
 *
 * @description
 * Esta função preenche automaticamente os dados da controladora com base no tipo da controladora.
 * Dependendo do tipo ('2018', '2023', ou 'Locker'), a função preenche as propriedades de molas, andares e posições.
 */
export const selectAll = (controladora) => {
    // Verifica se o tipo da controladora é '2018'
    if (controladora.tipo === '2018') {
        // Preenche a propriedade 'molas' com uma lista de números de 1 a 10.
        controladora.dados.molas = Array.from({ length: 10 }, (_, i) => i + 1);
    }

    // Verifica se o tipo da controladora é '2023'
    if (controladora.tipo === '2023') {
        // Preenche a propriedade 'andar' com uma lista de números de 1 a 6.
        controladora.dados.andar = Array.from({ length: 6 }, (_, i) => i + 1);
        // Preenche a propriedade 'posicao' com uma lista de números de 1 a 15.
        controladora.dados.posicao = Array.from({ length: 15 }, (_, i) => i + 1);
    }

    // Verifica se o tipo da controladora é 'Locker'
    if (controladora.tipo === 'Locker-Padrao') {
        // Preenche a propriedade 'posicao' com uma lista de números de 1 a 20.
        controladora.dados.posicao = Array.from({ length: 20 }, (_, i) => i + 1);
    }
    if (controladora.tipo === 'Locker-Ker') {
        // Preenche a propriedade 'posicao' com uma lista de números de 1 a 20.
        controladora.dados.posicao = Array.from({ length: 12 }, (_, i) => i + 1);
    }
    if (controladora.tipo === 'Locker-Opus') {
        // Preenche a propriedade 'posicao' com uma lista de números de 1 a 25.
        controladora.dados.posicao = Array.from({ length: 25 }, (_, i) => i + 1);
    }
};

/**
 * Remove a seleção de todas as opções para uma controladora.
 * @param {Object} controladora - Controladora específica.
 */
export const desselectAll = (controladora) => {
    // Verifica se o tipo da controladora é '2018'
    if (controladora.tipo === '2018') {
        // Limpa a lista de molas da controladora do tipo '2018'
        controladora.dados.molas = [];
    }

    // Verifica se o tipo da controladora é '2023'
    if (controladora.tipo === '2023') {
        // Limpa as listas de andares e posições da controladora do tipo '2023'
        controladora.dados.andar = [];
        controladora.dados.posicao = [];
    }

    // Verifica se o tipo da controladora é 'Locker'
    if (controladora.tipo === 'Locker-Padrao' || controladora.tipo === 'Locker-Ker' || controladora.tipo === 'Locker-Opus') {
        // Limpa a lista de posições da controladora do tipo 'Locker'
        controladora.dados.posicao = [];
    }
};

/**
 * Valida se o andar foi selecionado antes de permitir a seleção de uma posição.
 *
 * @param {Object} produtoSelecionado - O objeto do produto que está sendo selecionado.
 * @param {Object} produtoSelecionado.value - O valor do produto selecionado, contendo as propriedades 'Andar' e 'Posicao'.
 * @param {string} produtoSelecionado.value.Andar - O andar selecionado para o produto.
 * @param {string} produtoSelecionado.value.Posicao - A posição selecionada para o produto.
 *
 * @throws {Error} Lança um erro caso o andar não tenha sido selecionado.
 *
 * @description
 * A função verifica se o andar foi selecionado no objeto 'produtoSelecionado'. Caso não tenha sido selecionado,
 * ela limpa o campo de posição e andar e lança um erro solicitando que o andar seja selecionado antes de escolher a posição.
 */
export const validarAndarSelecionado = (produtoSelecionado) => {
    // Recupera o valor do andar selecionado do objeto produtoSelecionado
    const Andar = produtoSelecionado.value.Andar;

    // Verifica se o andar não foi selecionado
    if (!Andar) {
        // Limpa o valor de 'Posicao' e 'Andar' no objeto produtoSelecionado
        produtoSelecionado.value.Posicao = '';
        produtoSelecionado.value.Andar = '';

        // Lança um erro com uma mensagem informando que o andar deve ser selecionado antes da posição
        throw Error('Selecione um andar antes de selecionar uma posição.');
    }
};
/**
 * Valida a mudança de andar e atualiza as posições disponíveis.
 *
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @param {Object} produtoSelecionado - Objeto representando o produto atualmente selecionado.
 * @param {Object[]} ListaItens - Lista de itens associados.
 * @param {Object} posicaoOptions - Objeto reativo contendo as opções de posição.
 *
 * @returns {void}
 */
export const validarMudancaAndar = (Controladoras, produtoSelecionado, ListaItens, posicaoOptions) => {
    // Encontrar a controladora selecionada
    const selectedControladora = Controladoras.find((c) => c.id === produtoSelecionado.Controladora);// Encontra a controladora selecionada na lista de controladoras.

    if (!selectedControladora) {// Se a controladora não for encontrada, limpa as opções de posição e lança um erro.
        posicaoOptions.value = [];// Limpa as opções de posição.
        throw Error('Nenhuma controladora selecionada encontrada.');// Lança um erro informando que nenhuma controladora foi encontrada.
    }

    // Filtrar molas ocupadas com base nos itens da lista
    const molasOcupadas = ListaItens.filter((item) => {// Filtra os itens da lista para encontrar as molas ocupadas associadas à controladora '2023'.
        const [tipo, identificador, Andar, Posicao] = item.Posicao.replace(/\s/g, '').split('/');// Separa a posição em tipo, identificador, andar e posição, removendo espaços.
        return tipo === '2023' && Number(identificador) === selectedControladora.dados.dip && produtoSelecionado.Andar === Number(Andar);// Retorna os itens que correspondem ao tipo '2023', ao identificador da controladora e ao andar selecionado.
    }).map((item) => {// Mapeia os itens para retornar as posições ocupadas.
        const [tipo, identificador, Andar, Posicao] = item.Posicao.replace(/\s/g, '').split('/');   // Para cada item, separa a posição e retorna a posição específica.
        return Number(Posicao); // Retorna a posição como um número.
    });

    // Calcular molas disponíveis
    const molasDisponiveis = selectedControladora.dados.posicao.filter((mola) => !molasOcupadas.includes(mola));    // Filtra as posições disponíveis, removendo as ocupadas.

    // Atualizar as opções de posição
    posicaoOptions.value = molasDisponiveis.map((mola) => ({ label: mola, value: mola }));  // Atualiza as opções de posição com as posições disponíveis.
    posicaoOptions.value.sort((a, b) => a.value - b.value); // Ordena as posições disponíveis.
};

/**
 * Atualiza as opções disponíveis para controladoras com base no tipo de controladora.
 *
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis, cada uma contendo propriedades como `tipo` e `dados`.
 * @param {Object} options - Objeto contendo os estados reativos que serão atualizados.
 * @param {Object} options.molasOptions - Estado reativo para opções de molas.
 * @param {Object} options.dipOptions - Estado reativo para opções de DIP.
 * @param {Object} options.andarOptions - Estado reativo para opções de andar.
 * @param {Object} options.posicaoOptions - Estado reativo para opções de posição.
 * @param {Object} options.motorOptions - Estado reativo para opções de motor.
 * @param {Object} options.placaOptions - Estado reativo para opções de placa.
 *
 * @returns {void}
 */
export const preencherOpcoesControladoras = (Controladoras, options) => {
    // Desestrutura as propriedades do objeto options que serão preenchidas com as opções de controladoras
    const { molasOptions, dipOptions, andarOptions, posicaoOptions, motorOptions, placaOptions } = options;

    // Inicializa as opções como arrays vazios antes de preenchê-las
    molasOptions.value = [];    // Inicializa as opções de molas como um array vazio.
    dipOptions.value = [];  // Inicializa as opções de DIP como um array vazio.
    andarOptions.value = [];    // Inicializa as opções de andar como um array vazio.
    posicaoOptions.value = [];  // Inicializa as opções de posição como um array vazio.
    motorOptions.value = [];    // Inicializa as opções de motor como um array vazio.

    // Itera sobre todas as controladoras fornecidas
    Controladoras.forEach((controladora) => {   // Itera sobre todas as controladoras fornecidas.
        // Verifica o tipo da controladora e preenche as opções de acordo com o tipo
        if (controladora.tipo === '2018') { // Verifica se o tipo da controladora é '2018'.
            // Se for do tipo 2018, adiciona as molas e a placa à suas respectivas opções
            molasOptions.value.push(...controladora.dados.molas);   // Adiciona as molas à lista de opções de molas.
            placaOptions.value.push(controladora.dados.placa);  // Adiciona a placa à lista de opções de placa.
        } else if (controladora.tipo === '2023') {
            // Se for do tipo 2023, adiciona DIP, andares e posições às suas respectivas opções
            dipOptions.value.push(controladora.dados.dip);  // Adiciona o DIP à lista de opções de DIP.
            andarOptions.value.push(...controladora.dados.andar);       // Adiciona os andares à lista de opções de andar.
            posicaoOptions.value.push(...controladora.dados.posicao);   // Adiciona as posições à lista de opções de posição.
        } else if (controladora.tipo === '2024') {  
            // Se for do tipo 2024, adiciona o motor à sua respectiva opção
            motorOptions.value.push(controladora.dados.motor);  // Adiciona o motor à lista de opções de motor.
        }
    });
};
/**
 * Configura o cliente selecionado com base no DM.
 * @param {Object} ListaClientes - Lista de clientes disponíveis.
 * @param {Object} DM - Objeto DM com o cliente associado.
 * @returns {Object} - Cliente selecionado atualizado.
 */
export const configurarClienteSelecionado = (ListaClientes, DM) => {    // Configura o cliente selecionado com base no DM.
    // Encontra o cliente que possui o mesmo ID que o DM.ID_Cliente
    const client = ListaClientes.find((client) => client.value.id_cliente === DM.ID_Cliente);   // Encontra o cliente com o ID_Cliente do DM.

    // Se o cliente for encontrado, retorna seus dados junto com a chave 'usar_api', que será false se não estiver definida
    if (client) {   // Se o cliente for encontrado, retorna seus dados.
        return { ...client.value, usar_api: client.value.usar_api || false };   // Retorna os dados do cliente com a chave 'usar_api'.
    }

    // Caso o cliente não seja encontrado, retorna um objeto com valores padrão
    return { id_cliente: '', nome_cliente: '', usar_api: false };   
};
/**
 * Valida os campos obrigatórios com base no tipo da controladora selecionada.
 *
 * @param {Object} produtoSelecionado - Objeto representando o produto atualmente selecionado.
 * @param {string} tipoControladoraSelecionada - Tipo da controladora selecionada (ex.: '2018', '2023').
 *
 * @throws {Error} - Lança um erro com uma mensagem apropriada se a validação falhar.
 *
 * @returns {void}
 */
export const validarCampos = (produtoSelecionado, tipoControladoraSelecionada) => {   // Valida os campos obrigatórios com base no tipo da controladora selecionada.
    switch (tipoControladoraSelecionada) {  // Verifica o tipo da controladora selecionada.
        case '2018':    // Se for do tipo '2018'.
            // Verifica se os campos obrigatórios estão preenchidos
            if (!produtoSelecionado.id_produto || !produtoSelecionado.Controladora || !produtoSelecionado.Placa || !produtoSelecionado.Motor1 || !produtoSelecionado.Capacidade) {
                throw new Error('Preencha todos os campos obrigatórios para a controladora 2018.');
            }

            break;  // Finaliza a verificação do tipo '2018'.
        case '2023':    // Se for do tipo '2023'.
            // Verifica se os campos obrigatórios estão preenchidos
            if (!produtoSelecionado.id_produto || !produtoSelecionado.Controladora || !produtoSelecionado.Dip || !produtoSelecionado.Andar || !produtoSelecionado.Posicao || !produtoSelecionado.Capacidade) {
                throw new Error('Preencha todos os campos obrigatórios para a controladora 2023.');
            }

            break;  // Finaliza a verificação do tipo '2023'.
        case 'Locker-Padrao':
            // Verifica se os campos obrigatórios estão preenchidos
            if (!produtoSelecionado.id_produto || !produtoSelecionado.Controladora || !produtoSelecionado.Dip || !produtoSelecionado.Posicao) {
                throw new Error('Preencha todos os campos obrigatórios para a controladora Locker.');
            }

            break;
        case 'Locker-Ker':
        case 'Locker-Opus':
            // Verifica se os campos obrigatórios estão preenchidos
            if (!produtoSelecionado.id_produto || !produtoSelecionado.Controladora || produtoSelecionado.Dip == null || !produtoSelecionado.Posicao) {
                throw new Error('Preencha todos os campos obrigatórios para a controladora Locker.');
            }

            break;
        default:// Se o tipo da controladora não for reconhecido, lança um erro.
            throw new Error('Tipo de controladora inválido.');
    }
};
/**
 * Atualiza o tipo de uma controladora na lista de controladoras.
 *
 * @param {number} index - O índice da controladora a ser atualizada.
 * @param {string} tipo - O novo tipo da controladora.
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @param {Object} nextValues - Objeto contendo os próximos valores padrão para cada tipo de controladora.
 * @returns {void}
 */
export const updateTipoControladora = (index, tipo, Controladoras, nextValues) => {
    // Conta quantas controladoras do tipo selecionado já existem na lista
    const count = Controladoras.filter((controladora) => controladora.tipo === tipo).length;

    // Recupera a controladora no índice especificado
    const controladora = Controladoras[index];

    // Define os limites máximos de controladoras por tipo
    const maxControladoras = {
        2018: 16, // Limite de 16 controladoras do tipo '2018'
        2023: 90, // Limite de 90 controladoras do tipo '2023'
        'Locker-Padrao': Infinity,// Sem limite para controladoras do tipo 'Locker'
        'Locker-Ker': Infinity, // Sem limite para controladoras do tipo 'Locker'
        'Locker-Opus': Infinity, // Sem limite para controladoras do tipo 'Locker'
        2024: Infinity // Sem limite para controladoras do tipo '2024'
    };

    // Verifica se a quantidade atual de controladoras do tipo atingiu o limite máximo
    if (count >= maxControladoras[tipo]) {
        // Se atingiu o limite, remove a controladora da lista e lança um erro
        Controladoras.splice(index, 1);
        throw Error(`Você atingiu o limite máximo de controladoras ${tipo}`);
    }

    // Atualiza os dados da controladora conforme o tipo selecionado
    if (tipo === '2018') {
        // Se for do tipo '2018', incrementa o valor de 'placa' e garante que 'molas' seja um array
        controladora.dados.placa = nextValues['2018'].placa++;
        controladora.dados.molas = controladora.dados.molas || []; // Garante que 'molas' seja um array
    } else if (tipo === '2023') {
        // Se for do tipo '2023', incrementa o valor de 'dip' e garante que 'andar' e 'posicao' sejam arrays
        controladora.dados.dip = nextValues['2023'].dip++;
        controladora.dados.andar = controladora.dados.andar || []; // Garante que 'andar' seja um array
        controladora.dados.posicao = controladora.dados.posicao || []; // Garante que 'posicao' seja um array
    } else if (tipo === '2024') {
        // Se for do tipo '2024', incrementa o valor de 'placa' e garante que 'motor' seja um string
        controladora.dados.placa = nextValues['2024'].placa++;
        controladora.dados.motor = controladora.dados.motor || ''; // Garante que 'motor' seja uma string
    } else if (tipo === 'Locker-Padrao') {
        // Se for do tipo 'Locker', incrementa o valor de 'dip' e garante que 'posicao' seja um array
        controladora.dados.dip = nextValues['Locker-Padrao'].dip++;
        controladora.dados.posicao = controladora.dados.posicao || []; // Garante que 'posicao' seja um array
    } else if (tipo === 'Locker-Ker') {
        // Se for do tipo 'Locker', incrementa o valor de 'dip' e garante que 'posicao' seja um array
        controladora.dados.dip = nextValues['Locker-Ker'].dip++;
        controladora.dados.posicao = controladora.dados.posicao || []; // Garante que 'posicao' seja um array
    } else if (tipo === 'Locker-Opus') {
        // Se for do tipo 'Locker', incrementa o valor de 'dip' e garante que 'posicao' seja um array
        controladora.dados.dip = nextValues['Locker-Opus'].dip++;
        controladora.dados.posicao = controladora.dados.posicao || []; // Garante que 'posicao' seja um array
    }
};
/**
 * Encontra a controladora com base no tipo e identificador fornecidos.
 *
 * @param {string} tipo - Tipo da controladora (2018, 2023, 2024, Locker).
 * @param {number} identificador - Identificador da controladora (placa ou DIP).
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @returns {Object|null} - A controladora encontrada ou `null` se não existir.
 */
export const findControladora = (tipo, identificador, Controladoras) => {
    // Utiliza o método 'find' para buscar a controladora que corresponde ao tipo e identificador fornecidos
    return Controladoras.find((c) => {
        // Verifica se a controladora corresponde ao tipo fornecido
        if (c.tipo === tipo) {
            // Se o tipo for '2018' ou '2024', verifica se a placa da controladora corresponde ao identificador fornecido
            if (tipo === '2018' || tipo === '2024') {
                return c.dados.placa === identificador;
            }
            // Se o tipo for '2023' ou 'Locker', verifica se o dip da controladora corresponde ao identificador fornecido
            else if (tipo === '2023' || tipo === 'Locker-Padrao' || tipo === 'Locker-Ker' || tipo === 'Locker-Opus') {
                return c.dados.dip === identificador;
            }
        }
        // Caso o tipo não corresponda, retorna 'false', indicando que a controladora não foi encontrada
        return false;
    });
};

/**
 * Atualiza o objeto `produtoSelecionado` com base no tipo de controladora e valores fornecidos.
 *
 * @param {Object} produtoSelecionado - Objeto do produto selecionado.
 * @param {string} tipo - Tipo da controladora (2018, 2023, 2024, Locker).
 * @param {Array<string|number>} valores - Array contendo os valores associados à controladora.
 */
export const updateProdutoSelecionado = (produtoSelecionado, tipo, valores) => {
    // Verifica se o tipo é '2018', e atualiza os campos específicos para este tipo de controladora
    if (tipo === '2018') {
        // Atribui o valor da placa como um número
        produtoSelecionado.Placa = Number(valores[0]);
        // Atribui o valor do Motor1 como um número
        produtoSelecionado.Motor1 = Number(valores[1]);
    }
    // Verifica se o tipo é '2023', e atualiza os campos específicos para este tipo de controladora
    else if (tipo === '2023') {
        // Atribui o valor do Dip como um número
        produtoSelecionado.Dip = Number(valores[0]);
        // Atribui o valor do andar como um número
        produtoSelecionado.Andar = Number(valores[1]);
        // Atribui o valor da posição como um número
        produtoSelecionado.Posicao = Number(valores[2]);
    }
    // Verifica se o tipo é '2024', e atualiza os campos específicos para este tipo de controladora
    else if (tipo === '2024') {
        // Atribui o valor do Motor1 como um número
        produtoSelecionado.Motor1 = Number(valores[0]);
    }
    // Verifica se o tipo é 'Locker', e atualiza os campos específicos para este tipo de controladora
    else if (tipo === 'Locker-Padrao') {
        // Atribui o valor do Dip como um número
        produtoSelecionado.Dip = Number(valores[0]);
        // Atribui o valor da posição como um número
        produtoSelecionado.Posicao = Number(valores[1]);
    } else if (tipo === 'Locker-Ker' || tipo === 'Locker-Opus') {
        // Atribui o valor do Dip como um número
        produtoSelecionado.Dip = Number(valores[0]);
        // Atribui o valor da posição como um número
        produtoSelecionado.Posicao = Number(valores[1]);
    }
};

/**
 * Prepares data for DM service based on the specified action.
 *
 * @param {string} action - The action to be performed. Can be 'listar', 'adicionar', 'atualizar', or 'deletar'.
 * @param {Object} DM - The DM data object.
 * @param {Object} Cliente - The Cliente data object.
 * @param {Object} Controladora - The Controladora data object.
 * @returns {Object} The prepared data for the specified action.
 * @throws {Error} Throws an error if the action is invalid.
 */
export const prepareDMData = (action, DM, Cliente, Controladora) => {
    // Definindo os dados base que serão incluídos em todas as ações, como o id do usuário e id do cliente.
    const baseData = {
        id_usuario: store.userId || null, // O ID do usuário (obtido do store ou nulo, se não disponível).
        id_cliente: store.userIdCliente || null // O ID do cliente (obtido do store ou nulo, se não disponível).
    };

    // Switch para decidir a preparação dos dados com base na ação fornecida.
    switch (action) {
        // Caso a ação seja 'listar', prepara os dados para exibição.
        case 'listar':
            // Se o papel do usuário for 'Administrador', retorna um objeto vazio.
            // Caso contrário, retorna apenas os dados base (id_usuario e id_cliente).
            return store.userRole === 'Administrador' ? {} : { ...baseData };

        // Caso a ação seja 'adicionar', prepara os dados para adicionar um novo DM.
        case 'adicionar':
            // Define o ID do cliente e o nome do cliente no objeto DM.
            DM.IDcliente = Cliente.id_cliente;
            DM.ClienteNome = Cliente.nome_cliente;
            // Retorna os dados combinados: dados base, os dados do DM e as controladoras associadas.
            return {
                ...baseData, // Dados base com id_usuario e id_cliente.
                ...DM, // Os dados de DM.
                Controladoras: Controladora // As controladoras associadas.
            };

        // Caso a ação seja 'atualizar', prepara os dados para atualizar um DM existente.
        case 'atualizar':
            // Verifica se o ID do cliente foi alterado, e se sim, atualiza.
            if (DM.ID_cliente !== Cliente.id_cliente) {
                DM.ID_cliente = Cliente.id_cliente;
            }
            // Verifica se o nome do cliente foi alterado, e se sim, atualiza.
            if (DM.ClienteNome !== Cliente.nome_cliente) {
                DM.ClienteNome = Cliente.nome_cliente;
            }
            // Retorna os dados combinados: dados base, dados de DM atualizados e as controladoras.
            return {
                ...baseData, // Dados base com id_usuario e id_cliente.
                ...DM, // Os dados de DM atualizados.
                Controladoras: Controladora // As controladoras associadas.
            };

        // Caso a ação seja 'deletar', prepara os dados necessários para deletar um DM.
        case 'deletar':
            // Retorna os dados necessários para a exclusão do DM, incluindo o ID do DM.
            return {
                ...baseData, // Dados base com id_usuario e id_cliente.
                ID_DM: DM.ID_DM // O ID do DM que será deletado.
            };

        // Caso a ação não seja válida, lança um erro.
        default:
            // Lança um erro se a ação fornecida não for reconhecida.
            throw new Error('Ação inválida para preparar os dados do serviço de DM.');
    }
};

/**
 * Prepares the data for DM service based on the given action.
 *
 * @param {string} action - The action to be performed ('listar', 'adicionar', 'atualizar', 'deletar').
 * @param {Object} DM - The DM object containing the ID_DM property.
 * @param {Object} Produto - The Produto object containing the value property.
 * @param {Object} Controladora - The Controladora object containing the tipo property.
 * @returns {Object} The prepared data for the DM service.
 * @throws {Error} If the action is invalid or if the tipo_controladora is not defined for 'adicionar' or 'atualizar' actions.
 */
export const prepareItemDMData = (action, DM, Produto, Controladoras) => {
    // Definição dos dados base que serão incluídos em todas as ações, como o id do usuário, id do cliente e id do DM.
    const baseData = {
        id_usuario: store.userId || null, // O ID do usuário (obtido do store ou nulo se não disponível).
        id_cliente: store.userIdCliente || null, // O ID do cliente (obtido do store ou nulo se não disponível).
        id_dm: DM.ID_DM || null // O ID do DM (obtido do DM ou nulo se não disponível).
    };

    // Localiza a controladora selecionada com base no ID da controladora presente no produto.
    const selectedControladora = Controladoras?.value ? Controladoras.value.find((c) => c.id === Produto.value.Controladora) : null;

    // Switch para decidir como preparar os dados com base na ação fornecida.
    switch (action) {
        // Caso a ação seja 'listar', prepara os dados para exibir os itens.
        case 'listar':
            return { ...baseData }; // Retorna apenas os dados base.

        // Caso a ação seja 'adicionar', prepara os dados para adicionar um novo item de DM.
        case 'adicionar':
            return {
                ...baseData, // Dados base com id_usuario, id_cliente e id_dm.
                ...Produto.value, // Os dados do produto que será adicionado.
                tipo_controladora: selectedControladora
                    ? selectedControladora.tipo // Se a controladora for encontrada, usa o tipo dela.
                    : (() => {
                          throw new Error('Tipo de controladora não definido.'); // Lança um erro caso o tipo de controladora não esteja definido.
                      })() // Caso contrário, lança um erro.
            };

        // Caso a ação seja 'atualizar', prepara os dados para atualizar um item de DM existente.
        case 'atualizar':
            return {
                ...baseData, // Dados base com id_usuario, id_cliente e id_dm.
                ...Produto.value, // Os dados do produto que será atualizado.
                tipo_controladora: selectedControladora
                    ? selectedControladora.tipo // Se a controladora for encontrada, usa o tipo dela.
                    : (() => {
                          throw new Error('Tipo de controladora não definido.'); // Lança um erro caso o tipo de controladora não esteja definido.
                      })() // Caso contrário, lança um erro.
            };

        // Caso a ação seja 'deletar', prepara os dados necessários para deletar um item de DM.
        case 'deletar':
            return {
                ...baseData, // Dados base com id_usuario, id_cliente e id_dm.
                id_item: Produto.value.id_item // O ID do item que será deletado.
            };

        // Caso a ação não seja válida, lança um erro.
        default:
            throw new Error('Ação inválida para preparar os dados do serviço de DM.'); // Lança um erro para ações inválidas.
    }
};

/**
 * Formats a list of clients into a specific structure.
 *
 * @param {Array} ListaClientes - The list of clients to format.
 * @param {Object} ListaClientes[].id_cliente - The ID of the client.
 * @param {Object} ListaClientes[].nome - The name of the client.
 * @param {Object} ListaClientes[].usar_api - Indicates if the client uses the API.
 * @returns {Array} The formatted list of clients.
 */
export const FormatarListaCliente = (ListaClientes, simple = false) => {
    // Itera sobre a lista de clientes e formata cada um dos itens conforme necessário.
    return ListaClientes.map((cliente) => { // Itera sobre a lista de clientes.
        if (simple) {   // Se a formatação for simples, retorna apenas o ID e o nome do cliente.
            return {    // Retorna um objeto com o ID e o nome do cliente.
                value: cliente.id_cliente,  // O ID do cliente.
                label: cliente.nome   // O nome do cliente.
            };
        } else {
            return {    // Retorna um objeto com o ID, o nome e o uso da API do cliente.
                // 'label' será o nome do cliente, usado como texto exibido na interface.
                label: cliente.nome,    // O nome do cliente.

                // 'value' contém os dados do cliente, que serão utilizados internamente para identificar o cliente selecionado.
                value: { id_cliente: cliente.id_cliente, nome_cliente: cliente.nome, usar_api: cliente.usar_api },
                // O campo 'usar_api' é armazenado diretamente no objeto de nível superior para fácil acesso.
                usar_api: cliente.usar_api
            };
        }
    });
};
export const isArmario = (tipo) => {    // Verifica se o tipo é um armário.
    return ['Locker', 'Locker-Padrao', 'Locker-Ker', 'Locker-Opus'].includes(tipo?.toString());    // Retorna verdadeiro se o tipo for 'Locker', 'Locker-Padrao' ou 'Locker-Ker'.
};
