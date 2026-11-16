import {
  MARCADOR_LACUNA,
  type Exercicio,
  type ExercicioCompletarCodigo,
  type ExercicioMultiplaEscolha,
  type ExercicioOrdenarLinhas,
  type ExercicioPseudocodigo,
} from './schemas';

export type RespostaMultiplaEscolha = { tipo: 'multipla-escolha'; opcaoId: string };
export type RespostaCompletarCodigo = {
  tipo: 'completar-codigo';
  /** Valor colocado em cada lacuna, na ordem do código (`null` = vazia). */
  preenchimento: readonly (string | null)[];
};
export type RespostaOrdenarLinhas = { tipo: 'ordenar-linhas'; ordem: readonly string[] };
export type RespostaPseudocodigo = { tipo: 'escrever-pseudocodigo'; texto: string };

export type Resposta =
  RespostaMultiplaEscolha | RespostaCompletarCodigo | RespostaOrdenarLinhas | RespostaPseudocodigo;

export type RequisitoAvaliado = {
  id: string;
  descricao: string;
  atendido: boolean;
};

export type ResultadoCorrecao = {
  correta: boolean;
  /** Resposta esperada, pronta para exibir no feedback. */
  respostaEsperada: string;
  /** Índices das lacunas erradas (completar código). */
  lacunasErradas?: readonly number[];
  /** Checklist dos requisitos (escrever pseudocódigo). */
  requisitos?: readonly RequisitoAvaliado[];
};

/** Tamanho mínimo, em caracteres úteis, de um pseudocódigo para ser avaliado. */
export const TAMANHO_MINIMO_PSEUDOCODIGO = 10;

/**
 * Deixa o texto comparável: minúsculo, sem acentos, aspas e setas padronizadas,
 * sem espaços sobrando no fim das linhas e com quebras de linha `\n`.
 */
export function normalizarTexto(texto: string): string {
  return (
    texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/\r\n?/g, '\n')
      .replace(/[“”«»]/g, '"')
      .replace(/[‘’`´]/g, "'")
      // Atribuição: aceita `←` e `:=` como sinônimos de `<-`.
      .replace(/←|:=/g, '<-')
      .replace(/[ \t]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .trim()
  );
}

function normalizarFicha(valor: string): string {
  return valor.trim().replace(/\s+/g, ' ');
}

/** Monta o código com as lacunas preenchidas (lacuna vazia continua `___`). */
export function preencherCodigo(codigo: string, preenchimento: readonly (string | null)[]): string {
  const partes = codigo.split(MARCADOR_LACUNA);
  return partes.reduce(
    (acumulado, parte, indice) =>
      indice === 0 ? parte : `${acumulado}${preenchimento[indice - 1] ?? MARCADOR_LACUNA}${parte}`,
    '',
  );
}

function corrigirMultiplaEscolha(
  exercicio: ExercicioMultiplaEscolha,
  resposta: RespostaMultiplaEscolha,
): ResultadoCorrecao {
  const correta = exercicio.opcoes.find((opcao) => opcao.id === exercicio.respostaCorretaId);
  return {
    correta: resposta.opcaoId === exercicio.respostaCorretaId,
    respostaEsperada: correta?.texto ?? '',
  };
}

function corrigirCompletarCodigo(
  exercicio: ExercicioCompletarCodigo,
  resposta: RespostaCompletarCodigo,
): ResultadoCorrecao {
  const lacunasErradas = exercicio.respostas.flatMap((esperada, indice) => {
    const dada = resposta.preenchimento[indice];
    return dada !== null &&
      dada !== undefined &&
      normalizarFicha(dada) === normalizarFicha(esperada)
      ? []
      : [indice];
  });

  return {
    correta: lacunasErradas.length === 0,
    lacunasErradas,
    respostaEsperada: preencherCodigo(exercicio.codigo, exercicio.respostas),
  };
}

function mesmaOrdem(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((valor, indice) => valor === b[indice]);
}

function corrigirOrdenarLinhas(
  exercicio: ExercicioOrdenarLinhas,
  resposta: RespostaOrdenarLinhas,
): ResultadoCorrecao {
  const principal = exercicio.linhas.map((linha) => linha.id);
  const aceitas = [principal, ...exercicio.ordensAlternativas];

  return {
    correta: aceitas.some((ordem) => mesmaOrdem(ordem, resposta.ordem)),
    respostaEsperada: exercicio.linhas
      .map((linha) => `${'  '.repeat(linha.recuo)}${linha.texto}`)
      .join('\n'),
  };
}

/** Posição da primeira ocorrência do padrão a partir de `inicio`, ou `-1`. */
function primeiraOcorrencia(padrao: string, texto: string, inicio: number): number {
  try {
    const regex = new RegExp(padrao, 'gm');
    regex.lastIndex = inicio;
    const encontrado = regex.exec(texto);
    return encontrado ? encontrado.index : -1;
  } catch {
    // O schema já garante regex válida; isto só protege contra conteúdo não validado.
    return -1;
  }
}

/** Remove comentários (`//` até o fim da linha) para não contarem como código. */
function removerComentarios(texto: string): string {
  return texto.replace(/\/\/[^\n]*/g, '');
}

function corrigirPseudocodigo(
  exercicio: ExercicioPseudocodigo,
  resposta: RespostaPseudocodigo,
): ResultadoCorrecao {
  const texto = normalizarTexto(removerComentarios(resposta.texto));
  const suficiente = texto.replace(/\s/g, '').length >= TAMANHO_MINIMO_PSEUDOCODIGO;

  const posicoes = new Map<string, number>();
  const requisitos = exercicio.requisitos.map<RequisitoAvaliado>((requisito) => {
    // Com `depoisDe`, procura uma ocorrência posterior ao requisito anterior. Se o
    // anterior não foi atendido, avalia este de forma independente para o checklist
    // não acusar dois erros por causa de um só (a resposta já estará errada).
    const anterior = requisito.depoisDe ? (posicoes.get(requisito.depoisDe) ?? -1) : -1;
    const inicio = anterior === -1 ? 0 : anterior + 1;
    const posicao = suficiente ? primeiraOcorrencia(requisito.padrao, texto, inicio) : -1;
    posicoes.set(requisito.id, posicao);

    return {
      id: requisito.id,
      descricao: requisito.descricao,
      atendido: posicao !== -1,
    };
  });

  return {
    correta: requisitos.every((requisito) => requisito.atendido),
    requisitos,
    respostaEsperada: exercicio.solucaoExemplo,
  };
}

/**
 * Corrige a resposta de um exercício. Função pura: não depende de estado nem de UI,
 * o que permite testá-la isoladamente e reutilizá-la (ex.: num backend no futuro).
 * Uma resposta de tipo diferente do exercício é sempre considerada errada.
 */
export function corrigirExercicio(exercicio: Exercicio, resposta: Resposta): ResultadoCorrecao {
  switch (exercicio.tipo) {
    case 'multipla-escolha':
      return resposta.tipo === 'multipla-escolha'
        ? corrigirMultiplaEscolha(exercicio, resposta)
        : { correta: false, respostaEsperada: '' };
    case 'completar-codigo':
      return resposta.tipo === 'completar-codigo'
        ? corrigirCompletarCodigo(exercicio, resposta)
        : { correta: false, respostaEsperada: '' };
    case 'ordenar-linhas':
      return resposta.tipo === 'ordenar-linhas'
        ? corrigirOrdenarLinhas(exercicio, resposta)
        : { correta: false, respostaEsperada: '' };
    case 'escrever-pseudocodigo':
      return resposta.tipo === 'escrever-pseudocodigo'
        ? corrigirPseudocodigo(exercicio, resposta)
        : { correta: false, respostaEsperada: '' };
  }
}

/** Diz se a resposta está completa o bastante para habilitar o botão "Verificar". */
export function respostaCompleta(exercicio: Exercicio, resposta: Resposta | null): boolean {
  if (!resposta || resposta.tipo !== exercicio.tipo) return false;

  switch (resposta.tipo) {
    case 'multipla-escolha':
      return resposta.opcaoId.length > 0;
    case 'completar-codigo':
      return (
        exercicio.tipo === 'completar-codigo' &&
        resposta.preenchimento.length === exercicio.respostas.length &&
        resposta.preenchimento.every((valor) => valor !== null)
      );
    case 'ordenar-linhas':
      return (
        exercicio.tipo === 'ordenar-linhas' && resposta.ordem.length === exercicio.linhas.length
      );
    case 'escrever-pseudocodigo':
      return resposta.texto.replace(/\s/g, '').length >= TAMANHO_MINIMO_PSEUDOCODIGO;
  }
}
