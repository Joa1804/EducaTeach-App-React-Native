import { ATIVIDADE } from '../atividade';
import { LICOES, buscarLicao } from '../licoes';
import { corrigirExercicio, type Resposta } from '../../lib/licoes/correcao';
import { trilhaSchema, type Exercicio } from '../../lib/licoes/schemas';

/** Monta a resposta certa de cada exercício a partir do próprio conteúdo. */
function respostaCorreta(exercicio: Exercicio): Resposta {
  switch (exercicio.tipo) {
    case 'multipla-escolha':
      return { tipo: 'multipla-escolha', opcaoId: exercicio.respostaCorretaId };
    case 'completar-codigo':
      return { tipo: 'completar-codigo', preenchimento: exercicio.respostas };
    case 'ordenar-linhas':
      return { tipo: 'ordenar-linhas', ordem: exercicio.linhas.map((linha) => linha.id) };
    case 'escrever-pseudocodigo':
      return { tipo: 'escrever-pseudocodigo', texto: exercicio.solucaoExemplo };
  }
}

const TODOS_EXERCICIOS = LICOES.flatMap((licao) =>
  licao.exercicios.map((exercicio) => ({ licao: licao.id, exercicio })),
);

describe('conteúdo da trilha', () => {
  it('passa na validação do schema', () => {
    expect(() => trilhaSchema.parse(LICOES)).not.toThrow();
  });

  it('tem 5 lições com ids únicos', () => {
    const ids = LICOES.map((licao) => licao.id);
    expect(ids).toHaveLength(5);
    expect(new Set(ids).size).toBe(5);
  });

  it('não repete ids de exercício entre lições', () => {
    const ids = TODOS_EXERCICIOS.map(({ exercicio }) => exercicio.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('usa os quatro tipos de exercício', () => {
    const tipos = new Set(TODOS_EXERCICIOS.map(({ exercicio }) => exercicio.tipo));
    expect([...tipos].sort()).toEqual([
      'completar-codigo',
      'escrever-pseudocodigo',
      'multipla-escolha',
      'ordenar-linhas',
    ]);
  });

  it('expõe as mesmas lições como atividades pontuáveis', () => {
    expect(ATIVIDADE.map((atividade) => atividade.id)).toEqual(LICOES.map((licao) => licao.id));
  });

  it('classifica as lições por dificuldade, com pontos de acordo', () => {
    expect(LICOES.map((licao) => [licao.id, licao.dificuldade, licao.pontos])).toEqual([
      ['comandos-basicos', 'facil', 50],
      ['variaveis', 'facil', 50],
      ['condicionais', 'medio', 100],
      ['repeticoes-loops', 'medio', 100],
      ['funcoes', 'dificil', 150],
    ]);
  });

  it('encontra lição por id e devolve null para id desconhecido', () => {
    expect(buscarLicao('funcoes')?.titulo).toBe('Funções');
    expect(buscarLicao('nao-existe')).toBeNull();
  });

  it.each(TODOS_EXERCICIOS.map(({ licao, exercicio }) => [`${licao}/${exercicio.id}`, exercicio]))(
    '%s aceita a própria resposta correta',
    (_nome, exercicio) => {
      expect(corrigirExercicio(exercicio, respostaCorreta(exercicio)).correta).toBe(true);
    },
  );
});

describe('correção dos pseudocódigos da trilha com respostas reais de alunos', () => {
  function exercicio(id: string): Exercicio {
    const encontrado = TODOS_EXERCICIOS.find((item) => item.exercicio.id === id)?.exercicio;
    if (!encontrado) throw new Error(`Exercício ${id} não existe.`);
    return encontrado;
  }

  const corrigir = (id: string, texto: string) =>
    corrigirExercicio(exercicio(id), { tipo: 'escrever-pseudocodigo', texto }).correta;

  it.each([
    ['cb-escrever-cor', 'Escreva("Qual sua cor?")\nLeia(cor)\nEscreva("Você gosta de ", cor)'],
    ['va-escrever-soma', 'leia a, b\nescreva a + b'],
    ['va-escrever-soma', 'leia(b)\nleia(a)\nresultado <- b + a\nescreva(resultado)'],
    [
      'co-escrever-temperatura',
      'leia temp\nse (temp > 30) entao\n escreva("calor")\nsenão\n escreva("agradável")\nfim se',
    ],
    [
      're-escrever-contagem',
      'i <- 1\nenquanto i <= 10 faca\n  escreva i\n  i <- i + 1\nfimenquanto',
    ],
    ['re-escrever-contagem', 'i <- 1\nrepita\n  escreva i\n  i <- i + 1\nate i > 10'],
    ['fu-escrever-quadrado', 'funcao quadrado(n: inteiro): inteiro\n  retorne n * n\nfim funcao'],
  ])('%s aceita uma variação válida', (id, texto) => {
    expect(corrigir(id, texto)).toBe(true);
  });

  it.each([
    // Usa a cor antes de ler.
    ['cb-escrever-cor', 'escreva "Sua cor é ", cor\nleia cor'],
    // Subtrai em vez de somar.
    ['va-escrever-soma', 'leia a\nleia b\nescreva a - b'],
    // Condição invertida.
    [
      'co-escrever-temperatura',
      'leia temp\nse temp < 30 entao\n escreva "Calor"\nsenao\n escreva "Agradável"\nfimse',
    ],
    // Sem laço: só escreve os números.
    ['re-escrever-contagem', 'escreva 1, 2, 3, 4, 5, 6, 7, 8, 9, 10'],
    // Esquece o retorne.
    ['fu-escrever-quadrado', 'funcao quadrado(n)\n  escreva n * n\nfimfuncao'],
  ])('%s recusa uma resposta errada', (id, texto) => {
    expect(corrigir(id, texto)).toBe(false);
  });
});
