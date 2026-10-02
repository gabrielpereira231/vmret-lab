import { DateTime } from 'luxon';
/**
 * Aplica um filtro global na lista de dados, baseado em um valor de busca.
 * @param {Object[]} dataList - Lista de dados a ser filtrada.
 * @param {string} filterValue - Valor da busca para filtrar os dados.
 * @returns {Object[]} - A lista de dados filtrada.
 */
export const applyGlobalFilter = (dataList, filterValue) => {
  // Converte o valor de filtro para minúsculas. Se não for fornecido, assume uma string vazia
  const filter = filterValue?.toLowerCase() || ''; 

  // Filtra a lista de dados, verificando se algum valor do objeto contém o valor de filtro
  return dataList.filter((item) =>
    Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filter)) // Se algum valor do item contém o filtro, retorna true para incluir o item na lista
  );
};

/**
* Reseta o formulário de **Centro de Custo**.
* @param {Object} form - Objeto do formulário que será resetado.
*/
export const resetCDCForm = (form) => {
  // Limpa todos os campos do formulário de Centro de Custo
  form.Nome = ''; // Nome do centro de custo
  form.Codigo = ''; // Código do centro de custo
  form.ID_CentroCusto = ''; // ID do centro de custo
};

/**
* Retorna um objeto inicial para o formulário de **Cliente**.
* @returns {Object} - Objeto com os campos resetados.
*/
export const resetClienteForm = (cliente) => {// Reseta o formulário de cliente
  Object.assign(cliente, {// Atribui valores padrão para as propriedades do cliente
    id_cliente: null, // ID do cliente
    nome: '', // Nome do cliente
    cpfcnpj: '',  // CPF ou CNPJ do cliente
    ativo: true,  // Status do cliente
    deleted: false, // Flag indicando se o cliente foi deletado
    created: null,  // Data de criação do cliente
    updated: null,  // Data de atualização do cliente
    last_login: null, // Data do último login do cliente  
    usar_api: false,  // Flag indicando se o cliente usa API
    atualizado: 0,  // Flag indicando se o cliente foi atualizado
    textoretirada: '',  // Texto de retirada do cliente
    Sincronizado: null, // Flag indicando se o cliente foi sincronizado
    menus: [],  // Lista de menus associados ao cliente
    cnpj: '', // CNPJ do cliente
  });
};


/**
* Retorna um objeto inicial para o formulário de **Função**.
* @returns {Object} - Objeto com os campos resetados.
*/
export const resetFuncaoForm = () => ({ // Reseta o formulário de função
  codigo: '', // Código da função
  nome: '', // Nome da função
  id_centro_custo: '', // ID do centro de custo associado à função
});

/**
* Retorna um objeto inicial para o formulário de **Funcionário**.
* @returns {Object} - Objeto com os campos resetados.
*/
export const resetFuncionarioForm = () => ({
  id_funcionario: '', // ID do funcionário
  matricula: '', // Matrícula do funcionário
  senha: '', // Senha do funcionário
  nome: '', // Nome do funcionário
  biometria: '', // Biometria do funcionário
  biometria2: '', // Segunda biometria do funcionário
  data_admissao: null, // Data de admissão do funcionário
  CPF: '', // CPF do funcionário
  RG: '', // RG do funcionário
  CTPS: '', // CTPS do funcionário
  email: '', // E-mail do funcionário
  status: '', // Status do funcionário (ex: ativo, inativo)
  hora_inicial: '', // Hora inicial de trabalho
  hora_final: '', // Hora final de trabalho
  id_centro_custo: '', // ID do centro de custo do funcionário
  id_funcao: '', // ID da função do funcionário
  id_planta: '', // ID da planta onde o funcionário trabalha
  id_setor: '', // ID do setor onde o funcionário trabalha
  segunda: false, // Flag indicando se o funcionário trabalha na segunda-feira
  terca: false, // Flag indicando se o funcionário trabalha na terça-feira
  quarta: false, // Flag indicando se o funcionário trabalha na quarta-feira
  quinta: false, // Flag indicando se o funcionário trabalha na quinta-feira
  sexta: false, // Flag indicando se o funcionário trabalha na sexta-feira
  sabado: false, // Flag indicando se o funcionário trabalha no sábado
  domingo: false, // Flag indicando se o funcionário trabalha no domingo
  itens: [], // Lista de itens associados ao funcionário
});

/**
* Reseta o formulário de **Itens** dentro de Funcionario.
* @param {Object} selectedProduct - Objeto do produto selecionado que será resetado.
*/
export const resetItens = (selectedProduct) => {
  // Reseta os campos do produto selecionado para valores iniciais
  selectedProduct.value = {
    id_produto: '', // ID do produto
    nome: '', // Nome do produto
    sku: '', // SKU (código único) do produto
    quantidade: null, // Quantidade do produto
  };
};

/**
* Reseta o estado de um formulário genérico.
* @param {Object} form - Referência do formulário a ser resetado.
* @param {Object} initialState - Estado inicial do formulário.
*/
export const resetGenericForm = (form, initialState) => {
  // Itera pelas chaves do estado inicial e redefine o formulário para esses valores
  Object.keys(initialState).forEach((key) => {
    form[key] = initialState[key]; // Para cada chave, o valor no formulário é redefinido para o valor correspondente no estado inicial
  });
};

/**
 * Reseta os campos do formulário de planta, atribuindo valores padrão para cada propriedade.
 * 
 * @function
 * @param {Object} planta - O objeto que representa os dados da planta a serem resetados.
 * @param {string} planta.codigo - O código da planta.
 * @param {string} planta.nome - O nome da planta.
 * @param {string} planta.id_planta - O ID da planta.
 * @param {string} planta.userid - O ID do usuário associado à planta.
 * @param {string} planta.senha - A senha associada à planta.
 * @param {string} planta.urlapi - A URL da API associada à planta.
 * @param {string} planta.clientid - O ID do cliente associado à planta.
 */
export const resetPlantaForm = (planta) => {  // Reseta o formulário de planta
    Object.assign(planta, { // Atribui valores padrão para as propriedades da planta
        nome: '', // O nome da planta será redefinido como uma string vazia.
        id_planta: '',  // O ID da planta será redefinido como uma string vazia.
        userId: '', // O ID do usuário será redefinido como uma string vazia.
        senha: '',  // A senha será redefinida como uma string vazia.
        urlapi: '', // A URL da API será redefinida como uma string vazia.
        clienteid: '',  // O ID do cliente será redefinido como uma string vazia.
        codigo:'',  // O código da planta será redefinido como uma string vazia.
        userId: '', // O ID do usuário será redefinido como uma string vazia.
        urlapi: '', // A URL da API será redefinida como uma string vazia.
        senha: '',  // A senha será redefinida como uma string vazia.
        ordem: 0, // A ordem será redefinida como 0.
        id_cliente: '', // O ID do cliente será redefinido como uma string vazia.
    });
};

/**
* Reseta os campos do formulário de produto, atribuindo valores padrão para cada propriedade.
* 
* @function
* @param {Object} produto - O objeto que representa os dados do produto a serem resetados.
* @param {string} produto.codigo - O código do produto.
* @param {string} produto.id_planta - O ID da planta associada ao produto.
* @param {string} produto.id_tipoProduto - O tipo de produto.
* @param {string} produto.id_categoria - A categoria do produto.
* @param {string} produto.nome - O nome do produto.
* @param {string} produto.descricao - A descrição do produto.
* @param {string} produto.unidade_medida - A unidade de medida do produto.
* @param {number} produto.validadedias - O número de dias de validade do produto.
* @param {Array} imageRefs - Um array com referências das imagens associadas ao produto (não utilizado diretamente aqui).
*/
export const resetProdutoForm = (produto, imageRefs) => {
  // Reseta o valor da propriedade 'codigo' do produto para uma string vazia.
  Object.assign(produto, {
      codigo: '',  // O código do produto será redefinido como uma string vazia.
      id_planta: '',  // O ID da planta será redefinido como uma string vazia.
      id_tipoProduto: '',  // O ID do tipo do produto será redefinido como uma string vazia.
      id_categoria: '',  // O ID da categoria será redefinido como uma string vazia.
      nome: '',  // O nome do produto será redefinido como uma string vazia.
      descricao: ' ',  // A descrição do produto será redefinida como um espaço em branco.
      unidade_medida: '',  // A unidade de medida será redefinida como uma string vazia.
      validadedias: 0 ,// O número de dias de validade será redefinido como 0.
      quantidademinima: '',//quantidade minima do produto
      especificacoes: ''  // As especificações do produto serão redefinidas como uma string vazia.
  });

    if (imageRefs) {  // Se o array de referências de imagem for fornecido
        imageRefs.forEach((imageRef) => { // Itera sobre cada referência de imagem
            if (imageRef) imageRef.value = null;  // Se a referência de imagem existir, redefine seu valor para nulo
        });// Fim do loop
    }
};


/**
 * Reseta os campos do formulário de setor, atribuindo valores padrão para cada propriedade.
 * 
 * @function
 * @param {Object} setor - O objeto que representa os dados do setor a serem resetados.
 * @param {string} setor.codigo - O código do setor.
 * @param {string} setor.nome - O nome do setor.
 * @param {string} setor.id_centro_custo - O ID do centro de custo associado ao setor.
 */
export const resetSetorForm = (setor) => {
  // Reseta o valor da propriedade 'codigo' do setor para uma string vazia.
  Object.assign(setor, {
      codigo: '',  // O código do setor será redefinido como uma string vazia.
      
      // Reseta o valor da propriedade 'nome' do setor para uma string vazia.
      nome: '',    // O nome do setor será redefinido como uma string vazia.
      
      // Reseta o valor da propriedade 'id_centro_custo' para uma string vazia.
      id_centro_custo: '',  // O ID do centro de custo será redefinido como uma string vazia.

      dias: 0, // O número de dias será redefinido como 0.
  });
};

/**
 * Reseta os campos do formulário DM e limpa as variáveis associadas, atribuindo valores padrão para cada propriedade.
 * 
 * @function
 * @param {Object} DM - O objeto que representa os dados do DM a serem resetados.
 * @param {Object} Controladoras - O objeto que armazena as controladoras associadas ao DM.
 * @param {Object} selectedClient - O objeto que representa o cliente selecionado.
 * @param {Object} nextValues - O objeto que armazena os valores seguintes associados a chaves específicas.
 * 
 * @description
 * A função `resetDMForm` redefine os valores de vários objetos e propriedades para seus valores iniciais padrão. 
 * Ela limpa o objeto DM, redefine valores associados ao cliente selecionado e às controladoras, 
 * e também altera valores em `nextValues` para chaves específicas.
 */
export const resetDMForm = (DM, Controladoras, selectedClient, nextValues) => {
  // Reseta as propriedades do objeto 'DM' para seus valores padrão (string vazia ou nulo).
  Object.assign(DM, {
      Ativo: '',  // Reseta a propriedade 'Ativo' para uma string vazia.
      Chave: '',  // Reseta a propriedade 'Chave' para uma string vazia.
      ChaveAPI: '',  // Reseta a propriedade 'ChaveAPI' para uma string vazia.
      ClienteID: '',  // Reseta a propriedade 'ClienteID' para uma string vazia.
      ClienteNome: '',  // Reseta a propriedade 'ClienteNome' para uma string vazia.
      Created: '',  // Reseta a propriedade 'Created' para uma string vazia.
      Enviada: '',  // Reseta a propriedade 'Enviada' para uma string vazia.
      ID_CR_Usuario: '',  // Reseta a propriedade 'ID_CR_Usuario' para uma string vazia.
      ID_DM: '',  // Reseta a propriedade 'ID_DM' para uma string vazia.
      IDcliente: '',  // Reseta a propriedade 'IDcliente' para uma string vazia.
      Identificacao: '',  // Reseta a propriedade 'Identificacao' para uma string vazia.
      Integracao: '',  // Reseta a propriedade 'Integracao' para uma string vazia.
      Numero: '',  // Reseta a propriedade 'Numero' para uma string vazia.
      OP_Biometria: '',  // Reseta a propriedade 'OP_Biometria' para uma string vazia.
      OP_Facial: '',  // Reseta a propriedade 'OP_Facial' para uma string vazia.
      OP_Senha: '',  // Reseta a propriedade 'OP_Senha' para uma string vazia.
      voucher: '',  // Reseta a propriedade 'OP_Senha' para uma string vazia.
      cracha: '',  // Reseta a propriedade 'OP_Senha' para uma string vazia.
      URL: '',  // Reseta a propriedade 'URL' para uma string vazia.
      Updated: '',  // Reseta a propriedade 'Updated' para uma string vazia.
      UserID: '',  // Reseta a propriedade 'UserID' para uma string vazia.
      Versao: '',  // Reseta a propriedade 'Versao' para uma string vazia.
      Devolucao: '',  // Reseta a propriedade 'Devolucao' para uma string vazia.
      ID_Cliente: null  // Reseta a propriedade 'ID_Cliente' para null.
  });

  // Limpa o valor das controladoras, atribuindo um array vazio.
  Controladoras.value = [];  // O valor de 'Controladoras' é redefinido para um array vazio.

  // Limpa o objeto 'selectedClient', atribuindo valores padrão para cada propriedade.
  selectedClient.value = { 
      id_cliente: '',  // O 'id_cliente' é redefinido para uma string vazia.
      nome_cliente: '',  // O 'nome_cliente' é redefinido para uma string vazia.
      usar_api: false  // O 'usar_api' é redefinido para 'false'.
  };

  // Modifica o valor associado à chave '2018' em 'nextValues', atribuindo 'placa' com valor 12.
  Object.assign(nextValues['2018'], { placa: 12 });  // A chave '2018' recebe o valor { placa: 12 }.

  // Modifica o valor associado à chave '2023' em 'nextValues', atribuindo 'dip' com valor 2.
  Object.assign(nextValues['2023'], { dip: 2 });  // A chave '2023' recebe o valor { dip: 2 }.

  // Modifica o valor associado à chave 'Locker' em 'nextValues', atribuindo 'dip' com valor 2.
  Object.assign(nextValues['Locker-Padrao'], { dip: 2 });  // A chave 'Locker' recebe o valor { dip: 2 }.
  
  Object.assign(nextValues['Locker-Ker'], { dip: 0 });  // A chave 'Locker' recebe o valor { dip: 2 }.
  Object.assign(nextValues['Locker-Opus'], { dip: 0 });

  // Modifica o valor associado à chave '2024' em 'nextValues', atribuindo 'placa' com valor 101.
  Object.assign(nextValues['2024'], { placa: 101 });  // A chave '2024' recebe o valor { placa: 101 }.
};


/**
 * Reseta o objeto do produto selecionado para seus valores iniciais.
 *
 * @param {Object} produtoSelecionado - Objeto referenciado do produto selecionado.
 * @param {Object} produtoSelecionado.value - Valor atual do produto selecionado que será resetado.
 * @property {string} id_produto - Identificador do produto.
 * @property {string} Porta - Porta associada ao produto.
 * @property {string} Motor1 - Identificador do primeiro motor associado ao produto.
 * @property {string} Motor2 - Identificador do segundo motor associado ao produto.
 * @property {string} Controladora - Controladora associada ao produto.
 * @property {string} Posicao - Posição associada ao produto.
 * @property {string} Andar - Andar associado ao produto.
 */

export const resetProdutoSelecionado = (produtoSelecionado) => {
  // Atribui um objeto vazio com valores padrão a 'produtoSelecionado.value', resetando os campos do produto.
  produtoSelecionado.value = {
      // O identificador único do item de produto.
      id_item: '', 
      
      // O identificador único do produto.
      id_produto: '', 
      
      // Nome do produto.
      Nome_Produto: '', 
      
      // Quantidade disponível ou a quantidade do produto.
      QTD: '', 
      
      // SKU (Stock Keeping Unit) do produto, usado para rastrear o inventário.
      SKU: '', 
      
      // A controladora associada ao produto.
      Controladora: '', 
      
      // Motor 1 associado ao produto. Pode ser nulo se não houver.
      Motor1: null, 
      
      // Motor 2 associado ao produto. Pode ser nulo se não houver.
      Motor2: null, 
      
      // DIP (Digital Interface Protocol), utilizado em algumas controladoras, pode ser nulo.
      Dip: null, 
      
      // Andar onde o produto está localizado, pode ser nulo.
      Andar: null, 
      
      // Posição do produto no andar ou no sistema, pode ser nulo.
      Posicao: null, 
      
      // A capacidade do produto ou da controladora associada, pode ser nula.
      Capacidade: null ,
      
  };
};
/**
 * Resets the properties of a given usuario object to their default values.
 *
 * @param {Object} usuario - The usuario object to reset.
 * @param {number} usuario.TotalRecords - The total number of records.
 * @param {number|null} usuario.id_usuario - The ID of the usuario.
 * @param {string} usuario.nome - The name of the usuario.
 * @param {string} usuario.email - The email of the usuario.
 * @param {string|null} usuario.telefone - The phone number of the usuario.
 * @param {string|null} usuario.celular - The mobile number of the usuario.
 * @param {string} usuario.senha - The password of the usuario.
 * @param {boolean} usuario.ativo - The active status of the usuario.
 * @param {boolean} usuario.deleted - The deleted status of the usuario.
 * @param {Date|null} usuario.last_login - The last login date of the usuario.
 * @param {string} usuario.id_planta - The plant ID associated with the usuario.
 * @param {number|null} usuario.id_cliente - The client ID associated with the usuario.
 * @param {string} usuario.role - The role of the usuario.
 * @param {string} usuario.nome_cliente - The name of the client associated with the usuario.
 * @param {boolean} usuario.Status - The status of the usuario.
 * @param {string} usuario.perfil - The profile of the usuario.
 */
export const resetUsuario = (usuario) => {    // Reseta o formulário de usuário
  Object.assign(usuario, {  // Atribui valores padrão para as propriedades do usuário
    TotalRecords: 0,  // O número total de registros será redefinido como 0.
    id_usuario: null, // O ID do usuário será redefinido
    nome: '', // O nome do usuário será redefinido como uma string vazia.
    email: '',  // O e-mail do usuário será redefinido como uma string vazia.
    telefone: null, // O telefone do usuário será redefinido como nulo.
    celular: null,  // O celular do usuário será redefinido como nulo.
    senha: '',  // A senha do usuário será redefinida como uma string vazia.
    ativo: true,  // O status do usuário será redefinido como verdadeiro.
    deleted: false, // O status de exclusão do usuário será redefinido como falso.
    last_login: null,   // A data do último login do usuário será redefinida como
    id_planta: '',  // O ID da planta associada ao usuário será redefinido como uma string vazia.
    id_cliente: null, // O ID do cliente associado ao usuário será redefinido como
    role: '', // A função do usuário será redefinida como uma string vazia.
    nome_cliente: '', // O nome do cliente associado ao usuário será redefinido como uma string vazia.
    Status: false,  // O status do usuário será redefinido como falso.
    perfil: '', // O perfil do usuário será redefinido como uma string vazia.
  });
};
export const resetProdutoSelecionadoSetor = (produtoSelecionado) => {
  Object.assign(produtoSelecionado.value, {
    id_produto: '',  
    quantidade: '',   
    dias: 0, // O número de dias será redefinido como 0.
  });
};

export function prepareNomadData(filtros){
  const data_inicio = filtros.data_inicio
  ? DateTime.fromJSDate(filtros.data_inicio).startOf('day').toFormat("yyyy-MM-dd HH:mm:ss")
  : null;

const data_fim = filtros.data_fim
  ? DateTime.fromJSDate(filtros.data_fim).endOf('day').toFormat("yyyy-MM-dd HH:mm:ss")
  : DateTime.now().endOf('day').toFormat("yyyy-MM-dd HH:mm:ss");

const rawData = {
    ativacao: filtros.ativacao,
    evento: filtros.evento,
    status: filtros.status,
    id_dm: filtros.id_dm,
    tipo_retorno: filtros.tipo_retorno,
    qrCode_valido: filtros.qrCode_valido,
    data_inicio,
    data_fim
  };

  // Remove campos nulos/undefined do objeto antes de enviar
  const data = Object.fromEntries(
    Object.entries(rawData).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );

  return { data };
}

export function prepareNomadData2(filtros) {
  const data_inicio = filtros.data_inicio
  ? DateTime.fromJSDate(filtros.data_inicio).startOf('day').toFormat("yyyy-MM-dd HH:mm:ss")
  : null;

    const data_fim = filtros.data_fim
  ? DateTime.fromJSDate(filtros.data_fim).endOf('day').toFormat("yyyy-MM-dd HH:mm:ss")
  : DateTime.now().endOf('day').toFormat("yyyy-MM-dd HH:mm:ss");

  return {
    data: {
      data_inicio,
    data_fim
    }
  };
}

