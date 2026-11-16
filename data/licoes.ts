import { trilhaSchema, type Licao, type LicaoEntrada } from '../lib/licoes/schemas';

/**
 * Conteúdo da trilha "Fundamentos de Programação", em pseudocódigo no estilo
 * Portugol (leia, escreva, se/senao, enquanto, para, funcao).
 *
 * Os padrões dos exercícios de escrever pseudocódigo são aplicados ao texto
 * normalizado (minúsculo e sem acentos), então devem ser escritos assim também.
 * O teste `data/__tests__/licoes.test.ts` valida todo o conteúdo pelo schema e
 * confere que cada solução de exemplo passa na própria correção.
 */
const re = String.raw;

const ENTRADA: LicaoEntrada[] = [
  {
    id: 'comandos-basicos',
    titulo: 'Comandos Básicos',
    descricao: 'Sequência, entrada e saída',
    icone: 'arrow-forward',
    dificuldade: 'facil',
    moedas: 1,
    exercicios: [
      {
        id: 'cb-sequencia',
        tipo: 'multipla-escolha',
        enunciado: 'O que este algoritmo mostra na tela?',
        codigo: 'escreva "1"\nescreva "3"\nescreva "2"',
        opcoes: [
          { id: 'a', texto: '1 3 2' },
          { id: 'b', texto: '1 2 3' },
          { id: 'c', texto: '3 2 1' },
          { id: 'd', texto: 'Nada, dá erro' },
        ],
        respostaCorretaId: 'a',
        explicacao:
          'Os comandos são executados de cima para baixo, um de cada vez. A ordem das linhas é a ordem da saída.',
      },
      {
        id: 'cb-completar-entrada',
        tipo: 'completar-codigo',
        enunciado: 'Complete o algoritmo que pergunta a idade e mostra a resposta.',
        codigo: '___ "Digite sua idade:"\n___ idade\nescreva "Você tem ", idade, " anos"',
        respostas: ['escreva', 'leia'],
        opcoes: ['leia', 'escreva', 'se', 'fim'],
        explicacao:
          '"escreva" mostra uma mensagem na tela e "leia" guarda o que o usuário digitar numa variável.',
      },
      {
        id: 'cb-ordenar-saudacao',
        tipo: 'ordenar-linhas',
        enunciado: 'Coloque em ordem o algoritmo que cumprimenta o usuário pelo nome.',
        linhas: [
          { id: 'l1', texto: 'inicio' },
          { id: 'l2', texto: 'escreva "Qual é o seu nome?"', recuo: 1 },
          { id: 'l3', texto: 'leia nome', recuo: 1 },
          { id: 'l4', texto: 'escreva "Olá, ", nome', recuo: 1 },
          { id: 'l5', texto: 'fim' },
        ],
        explicacao:
          'Primeiro perguntamos, depois lemos a resposta e só então podemos usá-la. Usar "nome" antes do "leia" não funcionaria.',
      },
      {
        id: 'cb-escrever-cor',
        tipo: 'escrever-pseudocodigo',
        enunciado:
          'Escreva um algoritmo que pergunte a cor favorita do usuário, guarde a resposta na variável cor e depois mostre uma mensagem usando essa cor.',
        palavrasChave: ['escreva', 'leia', 'cor', '"'],
        requisitos: [
          { id: 'perguntar', descricao: 'Fazer a pergunta com escreva', padrao: re`\bescreva\b` },
          {
            id: 'ler',
            descricao: 'Ler a resposta com leia cor',
            padrao: re`\bleia\s*\(?\s*cor\b`,
            depoisDe: 'perguntar',
          },
          {
            id: 'mostrar',
            descricao: 'Mostrar a variável cor depois de lê-la',
            padrao: re`\bescreva\b[^\n]*\bcor\b`,
            depoisDe: 'ler',
          },
        ],
        solucaoExemplo:
          'escreva "Qual é a sua cor favorita?"\nleia cor\nescreva "Sua cor favorita é ", cor',
        explicacao:
          'Todo programa interativo segue o padrão: mostrar uma pergunta, ler a resposta e usar o valor lido.',
      },
    ],
  },
  {
    id: 'variaveis',
    titulo: 'Variáveis',
    descricao: 'Guardar e atualizar informações',
    icone: 'cube',
    dificuldade: 'facil',
    moedas: 1,
    exercicios: [
      {
        id: 'va-valor-final',
        tipo: 'multipla-escolha',
        enunciado: 'Qual valor é mostrado no final?',
        codigo: 'x <- 5\nx <- x + 2\nescreva x',
        opcoes: [
          { id: 'a', texto: '5' },
          { id: 'b', texto: '7' },
          { id: 'c', texto: '2' },
          { id: 'd', texto: 'x + 2' },
        ],
        respostaCorretaId: 'b',
        explicacao:
          'A seta "<-" guarda um valor na variável. Na segunda linha o valor antigo de x (5) é somado a 2 e o resultado (7) substitui o anterior.',
      },
      {
        id: 'va-troca',
        tipo: 'completar-codigo',
        enunciado: 'Complete a troca dos valores de a e b usando a variável auxiliar.',
        codigo: 'aux <- a\na <- ___\nb <- ___',
        respostas: ['b', 'aux'],
        opcoes: ['a', 'b', 'aux', '0'],
        explicacao:
          'Guardamos o valor de a em aux antes de sobrescrevê-lo. Depois a recebe b e b recebe o valor antigo de a, que está em aux.',
      },
      {
        id: 'va-ordenar-media',
        tipo: 'ordenar-linhas',
        enunciado: 'Organize o algoritmo que calcula a média de duas notas.',
        linhas: [
          { id: 'l1', texto: 'leia nota1' },
          { id: 'l2', texto: 'leia nota2' },
          { id: 'l3', texto: 'media <- (nota1 + nota2) / 2' },
          { id: 'l4', texto: 'escreva media' },
        ],
        ordensAlternativas: [['l2', 'l1', 'l3', 'l4']],
        explicacao:
          'As duas notas precisam ser lidas antes do cálculo, e a média só pode ser mostrada depois de calculada. A ordem das leituras entre si não importa.',
      },
      {
        id: 'va-tipo',
        tipo: 'multipla-escolha',
        enunciado: 'Qual é o melhor tipo para guardar o nome de uma pessoa?',
        opcoes: [
          { id: 'a', texto: 'inteiro' },
          { id: 'b', texto: 'real' },
          { id: 'c', texto: 'caractere (texto)' },
          { id: 'd', texto: 'logico' },
        ],
        respostaCorretaId: 'c',
        explicacao:
          'Textos usam o tipo caractere. Inteiro e real são para números e lógico guarda apenas verdadeiro ou falso.',
      },
      {
        id: 'va-escrever-soma',
        tipo: 'escrever-pseudocodigo',
        enunciado: 'Leia dois números nas variáveis a e b e mostre a soma deles.',
        palavrasChave: ['leia', 'escreva', '<-', '+'],
        requisitos: [
          { id: 'ler-a', descricao: 'Ler o valor de a', padrao: re`\bleia\b[^\n]*\ba\b` },
          { id: 'ler-b', descricao: 'Ler o valor de b', padrao: re`\bleia\b[^\n]*\bb\b` },
          {
            id: 'somar',
            descricao: 'Calcular a + b',
            padrao: re`\ba\s*\+\s*b\b|\bb\s*\+\s*a\b`,
            depoisDe: 'ler-b',
          },
          {
            id: 'mostrar',
            descricao: 'Mostrar o resultado com escreva',
            padrao: re`\bescreva\b`,
            depoisDe: 'ler-b',
          },
        ],
        solucaoExemplo: 'leia a\nleia b\nsoma <- a + b\nescreva soma',
        explicacao:
          'Você pode guardar a soma numa variável (soma <- a + b) ou mostrar direto (escreva a + b). O importante é ler antes de calcular.',
      },
    ],
  },
  {
    id: 'condicionais',
    titulo: 'Condicionais',
    descricao: 'Tomar decisões com se/senao',
    icone: 'git-branch',
    dificuldade: 'medio',
    moedas: 2,
    exercicios: [
      {
        id: 'co-saida',
        tipo: 'multipla-escolha',
        enunciado: 'O que é mostrado quando idade vale 16?',
        codigo:
          'idade <- 16\nse idade >= 18 entao\n  escreva "Maior de idade"\nsenao\n  escreva "Menor de idade"\nfimse',
        opcoes: [
          { id: 'a', texto: 'Maior de idade' },
          { id: 'b', texto: 'Menor de idade' },
          { id: 'c', texto: 'As duas mensagens' },
          { id: 'd', texto: 'Nenhuma mensagem' },
        ],
        respostaCorretaId: 'b',
        explicacao:
          '16 >= 18 é falso, então o bloco do "se" é pulado e só o bloco do "senao" é executado.',
      },
      {
        id: 'co-completar-nota',
        tipo: 'completar-codigo',
        enunciado: 'Complete para aprovar quem tirou 7 ou mais.',
        codigo: 'se nota ___ 7 entao\n  escreva "Aprovado"\n___\n  escreva "Reprovado"\nfimse',
        respostas: ['>=', 'senao'],
        opcoes: ['>=', '<', 'senao', 'enquanto'],
        explicacao:
          '">=" significa "maior ou igual", então 7 também aprova. O "senao" cobre todos os outros casos.',
      },
      {
        id: 'co-intervalo',
        tipo: 'multipla-escolha',
        enunciado: 'Qual condição verifica se x está entre 1 e 10, incluindo os dois?',
        opcoes: [
          { id: 'a', texto: 'x >= 1 e x <= 10' },
          { id: 'b', texto: 'x >= 1 ou x <= 10' },
          { id: 'c', texto: 'x > 1 e x < 10' },
          { id: 'd', texto: 'x = 1 e x = 10' },
        ],
        respostaCorretaId: 'a',
        explicacao:
          'Com "e" as duas partes precisam ser verdadeiras. Com "ou" qualquer número passaria, e ">"/"<" deixariam 1 e 10 de fora.',
      },
      {
        id: 'co-ordenar-par',
        tipo: 'ordenar-linhas',
        enunciado: 'Monte o algoritmo que diz se um número é par ou ímpar.',
        linhas: [
          { id: 'l1', texto: 'leia n' },
          { id: 'l2', texto: 'se n % 2 = 0 entao' },
          { id: 'l3', texto: 'escreva "Par"', recuo: 1 },
          { id: 'l4', texto: 'senao' },
          { id: 'l5', texto: 'escreva "Ímpar"', recuo: 1 },
          { id: 'l6', texto: 'fimse' },
        ],
        explicacao:
          '"%" é o resto da divisão. Se o resto por 2 é zero, o número é par; caso contrário, é ímpar.',
      },
      {
        id: 'co-escrever-temperatura',
        tipo: 'escrever-pseudocodigo',
        enunciado:
          'Leia a temperatura na variável temp. Se for maior que 30, escreva "Calor"; senão, escreva "Agradável".',
        palavrasChave: ['leia', 'se', 'entao', 'senao', 'fimse', 'escreva'],
        requisitos: [
          { id: 'ler', descricao: 'Ler a variável temp', padrao: re`\bleia\s*\(?\s*temp\b` },
          {
            id: 'condicao',
            descricao: 'Testar se temp > 30',
            padrao: re`\bse\b[^\n]*(\btemp\s*>\s*30\b|\b30\s*<\s*temp\b)`,
            depoisDe: 'ler',
          },
          {
            id: 'calor',
            descricao: 'Escrever "Calor" dentro do se',
            padrao: re`\bescreva\b[^\n]*\bcalor\b`,
            depoisDe: 'condicao',
          },
          { id: 'senao', descricao: 'Usar senao', padrao: re`\bsenao\b`, depoisDe: 'calor' },
          {
            id: 'agradavel',
            descricao: 'Escrever "Agradável" no senao',
            padrao: re`\bescreva\b[^\n]*\bagradavel\b`,
            depoisDe: 'senao',
          },
          {
            id: 'fechar',
            descricao: 'Fechar com fimse',
            padrao: re`\bfim\s*se\b`,
            depoisDe: 'agradavel',
          },
        ],
        solucaoExemplo:
          'leia temp\nse temp > 30 entao\n  escreva "Calor"\nsenao\n  escreva "Agradável"\nfimse',
        explicacao:
          'A estrutura completa é: se <condição> entao ... senao ... fimse. Só um dos dois blocos é executado.',
      },
    ],
  },
  {
    id: 'repeticoes-loops',
    titulo: 'Repetições e Loops',
    descricao: 'Repetir comandos com para e enquanto',
    icone: 'repeat',
    dificuldade: 'medio',
    moedas: 2,
    exercicios: [
      {
        id: 're-para',
        tipo: 'multipla-escolha',
        enunciado: 'O que este laço mostra?',
        codigo: 'para i de 1 ate 3 faca\n  escreva i\nfimpara',
        opcoes: [
          { id: 'a', texto: '1 2 3' },
          { id: 'b', texto: '0 1 2' },
          { id: 'c', texto: '1 2' },
          { id: 'd', texto: '3' },
        ],
        respostaCorretaId: 'a',
        explicacao: 'O "para" começa em 1 e vai até 3 incluindo o 3, somando 1 a cada volta.',
      },
      {
        id: 're-completar-regressiva',
        tipo: 'completar-codigo',
        enunciado: 'Complete a contagem regressiva 3, 2, 1.',
        codigo: 'n <- 3\n___ n > 0 faca\n  escreva n\n  n <- n ___ 1\nfimenquanto',
        respostas: ['enquanto', '-'],
        opcoes: ['enquanto', 'se', '+', '-'],
        explicacao:
          'O "enquanto" repete enquanto a condição for verdadeira. Diminuir n a cada volta garante que o laço termine.',
      },
      {
        id: 're-quantas-vezes',
        tipo: 'multipla-escolha',
        enunciado: 'Quantas vezes "Oi" é mostrado?',
        codigo: 'i <- 0\nenquanto i < 5 faca\n  escreva "Oi"\n  i <- i + 2\nfimenquanto',
        opcoes: [
          { id: 'a', texto: '2 vezes' },
          { id: 'b', texto: '3 vezes' },
          { id: 'c', texto: '5 vezes' },
          { id: 'd', texto: 'Infinitas vezes' },
        ],
        respostaCorretaId: 'b',
        explicacao:
          'i vale 0, 2 e 4 dentro do laço. Quando chega a 6, a condição i < 5 fica falsa.',
      },
      {
        id: 're-ordenar-soma',
        tipo: 'ordenar-linhas',
        enunciado: 'Organize o algoritmo que soma os números de 1 a 5.',
        linhas: [
          { id: 'l1', texto: 'soma <- 0' },
          { id: 'l2', texto: 'para i de 1 ate 5 faca' },
          { id: 'l3', texto: 'soma <- soma + i', recuo: 1 },
          { id: 'l4', texto: 'fimpara' },
          { id: 'l5', texto: 'escreva soma' },
        ],
        explicacao:
          'A soma começa em zero antes do laço, acumula dentro dele e só é mostrada depois que o laço termina.',
      },
      {
        id: 're-escrever-contagem',
        tipo: 'escrever-pseudocodigo',
        enunciado: 'Use um laço de repetição para mostrar os números de 1 a 10.',
        palavrasChave: ['para', 'de', 'ate', 'faca', 'escreva', 'fimpara'],
        requisitos: [
          {
            id: 'laco',
            descricao: 'Usar um laço (para, enquanto ou repita)',
            padrao: re`\b(para|enquanto|repita)\b`,
          },
          { id: 'limite', descricao: 'Ir até 10', padrao: re`\b(10|11)\b` },
          {
            id: 'mostrar',
            descricao: 'Mostrar o número com escreva dentro do laço',
            padrao: re`\bescreva\b`,
            depoisDe: 'laco',
          },
          {
            id: 'fechar',
            descricao: 'Fechar o laço (fimpara, fimenquanto ou ate)',
            padrao: re`\bfim\s*(para|enquanto)\b|^\s*ate\b`,
            depoisDe: 'mostrar',
          },
        ],
        solucaoExemplo: 'para i de 1 ate 10 faca\n  escreva i\nfimpara',
        explicacao:
          'Com "para" o contador é atualizado sozinho. Com "enquanto" você precisa iniciar o contador antes e somar 1 dentro do laço.',
      },
    ],
  },
  {
    id: 'funcoes',
    titulo: 'Funções',
    descricao: 'Criar e reutilizar blocos de código',
    icone: 'construct',
    dificuldade: 'dificil',
    moedas: 3,
    exercicios: [
      {
        id: 'fu-retorno',
        tipo: 'multipla-escolha',
        enunciado: 'O que é mostrado na tela?',
        codigo: 'funcao dobro(n)\n  retorne n * 2\nfimfuncao\n\nescreva dobro(4)',
        opcoes: [
          { id: 'a', texto: '4' },
          { id: 'b', texto: '6' },
          { id: 'c', texto: '8' },
          { id: 'd', texto: 'dobro(4)' },
        ],
        respostaCorretaId: 'c',
        explicacao:
          'Ao chamar dobro(4), o parâmetro n recebe 4 e a função devolve 4 * 2 = 8, que é mostrado pelo escreva.',
      },
      {
        id: 'fu-completar-area',
        tipo: 'completar-codigo',
        enunciado: 'Complete a função que calcula a área de um retângulo e a chamada dela.',
        codigo: 'funcao area(base, altura)\n  ___ base * altura\nfimfuncao\n\nescreva ___(3, 4)',
        respostas: ['retorne', 'area'],
        opcoes: ['retorne', 'escreva', 'area', 'leia'],
        explicacao:
          '"retorne" devolve o valor para quem chamou a função. Para usá-la, chamamos pelo nome passando os argumentos.',
      },
      {
        id: 'fu-ordenar-maior',
        tipo: 'ordenar-linhas',
        enunciado: 'Monte a função que devolve o maior entre dois números.',
        linhas: [
          { id: 'l1', texto: 'funcao maior(a, b)' },
          { id: 'l2', texto: 'se a > b entao', recuo: 1 },
          { id: 'l3', texto: 'retorne a', recuo: 2 },
          { id: 'l4', texto: 'senao', recuo: 1 },
          { id: 'l5', texto: 'retorne b', recuo: 2 },
          { id: 'l6', texto: 'fimse', recuo: 1 },
          { id: 'l7', texto: 'fimfuncao' },
        ],
        explicacao:
          'A função recebe os parâmetros na primeira linha, decide qual valor retornar e é fechada com fimfuncao.',
      },
      {
        id: 'fu-vantagem',
        tipo: 'multipla-escolha',
        enunciado: 'Qual é a principal vantagem de usar funções?',
        opcoes: [
          { id: 'a', texto: 'Deixar o programa mais rápido sempre' },
          { id: 'b', texto: 'Reaproveitar código sem repeti-lo' },
          { id: 'c', texto: 'Dispensar o uso de variáveis' },
          { id: 'd', texto: 'Evitar qualquer erro no programa' },
        ],
        respostaCorretaId: 'b',
        explicacao:
          'Uma função escrita uma vez pode ser chamada quantas vezes for preciso, deixando o código menor e mais fácil de manter.',
      },
      {
        id: 'fu-escrever-quadrado',
        tipo: 'escrever-pseudocodigo',
        enunciado: 'Crie uma função chamada quadrado que recebe n e retorna n vezes n.',
        palavrasChave: ['funcao', 'retorne', '*', 'fimfuncao'],
        requisitos: [
          {
            id: 'declarar',
            descricao: 'Declarar funcao quadrado(n)',
            padrao: re`\bfuncao\s+quadrado\s*\(\s*n\b[^)\n]*\)`,
          },
          {
            id: 'retornar',
            descricao: 'Retornar n * n',
            padrao: re`\bretorne\s*\(?\s*(n\s*\*\s*n|n\s*\^\s*2)\b`,
            depoisDe: 'declarar',
          },
          {
            id: 'fechar',
            descricao: 'Fechar com fimfuncao',
            padrao: re`\bfim\s*funcao\b`,
            depoisDe: 'retornar',
          },
        ],
        solucaoExemplo: 'funcao quadrado(n)\n  retorne n * n\nfimfuncao',
        explicacao:
          'Uma função tem nome, parâmetros entre parênteses, um retorne com o resultado e o fechamento fimfuncao.',
      },
    ],
  },
];

/**
 * Lições validadas. O conteúdo é estático e coberto por testes, então um erro
 * aqui é de desenvolvimento e deve falhar cedo (no CI), não em produção.
 */
export const LICOES: readonly Licao[] = trilhaSchema.parse(ENTRADA);

export function buscarLicao(id: string): Licao | null {
  return LICOES.find((licao) => licao.id === id) ?? null;
}
