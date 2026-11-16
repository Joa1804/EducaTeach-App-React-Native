import {
  criarEstadoInicial,
  exercicioAtual,
  reduzirLicao,
  type EstadoLicao,
} from '../sessao-licao';
import { multiplaEscolhaSchema, type Exercicio } from '../schemas';

function multipla(id: string): Exercicio {
  return multiplaEscolhaSchema.parse({
    id,
    tipo: 'multipla-escolha',
    enunciado: `Pergunta ${id}`,
    opcoes: [
      { id: 'certa', texto: 'Certa' },
      { id: 'errada', texto: 'Errada' },
    ],
    respostaCorretaId: 'certa',
    explicacao: '...',
  });
}

const EXERCICIOS = [multipla('e1'), multipla('e2'), multipla('e3')];

function responder(estado: EstadoLicao, certa: boolean): EstadoLicao {
  const verificado = reduzirLicao(estado, {
    tipo: 'verificar',
    resposta: { tipo: 'multipla-escolha', opcaoId: certa ? 'certa' : 'errada' },
  });
  return reduzirLicao(verificado, { tipo: 'continuar' });
}

describe('reduzirLicao', () => {
  it('começa no primeiro exercício', () => {
    const estado = criarEstadoInicial(EXERCICIOS);
    expect(estado.fase).toBe('respondendo');
    expect(exercicioAtual(estado)?.id).toBe('e1');
  });

  it('mostra feedback e avança ao acertar', () => {
    const inicial = criarEstadoInicial(EXERCICIOS);
    const verificado = reduzirLicao(inicial, {
      tipo: 'verificar',
      resposta: { tipo: 'multipla-escolha', opcaoId: 'certa' },
    });
    expect(verificado.fase).toBe('feedback');
    expect(verificado.ultimoResultado?.correta).toBe(true);
    expect(verificado.acertados).toBe(1);

    const seguinte = reduzirLicao(verificado, { tipo: 'continuar' });
    expect(exercicioAtual(seguinte)?.id).toBe('e2');
    expect(seguinte.rodada).toBe(1);
    expect(seguinte.ultimoResultado).toBeNull();
  });

  it('manda o exercício errado para o fim da fila', () => {
    const estado = responder(criarEstadoInicial(EXERCICIOS), false);
    expect(estado.fila).toEqual(['e2', 'e3', 'e1']);
    expect(estado.errados).toEqual(['e1']);
    expect(estado.totalErros).toBe(1);
  });

  it('só termina depois de acertar todos e conta cada erro distinto uma vez', () => {
    let estado = criarEstadoInicial(EXERCICIOS);
    estado = responder(estado, false); // e1 errado
    estado = responder(estado, true); // e2
    estado = responder(estado, true); // e3
    estado = responder(estado, false); // e1 errado de novo
    expect(estado.fase).toBe('respondendo');
    estado = responder(estado, true); // e1 enfim certo

    expect(estado.fase).toBe('concluida');
    expect(estado.acertados).toBe(3);
    expect(estado.errados).toEqual(['e1']);
    expect(estado.totalErros).toBe(2);
    expect(exercicioAtual(estado)).toBeNull();
  });

  it('ignora verificar duas vezes seguidas (duplo toque)', () => {
    const verificado = reduzirLicao(criarEstadoInicial(EXERCICIOS), {
      tipo: 'verificar',
      resposta: { tipo: 'multipla-escolha', opcaoId: 'errada' },
    });
    const repetido = reduzirLicao(verificado, {
      tipo: 'verificar',
      resposta: { tipo: 'multipla-escolha', opcaoId: 'certa' },
    });
    expect(repetido).toBe(verificado);
  });

  it('ignora continuar sem ter verificado', () => {
    const inicial = criarEstadoInicial(EXERCICIOS);
    expect(reduzirLicao(inicial, { tipo: 'continuar' })).toBe(inicial);
  });

  it('reinicia do zero mudando a rodada', () => {
    const andamento = responder(criarEstadoInicial(EXERCICIOS), false);
    const reiniciado = reduzirLicao(andamento, { tipo: 'reiniciar' });
    expect(reiniciado.fila).toEqual(['e1', 'e2', 'e3']);
    expect(reiniciado.errados).toEqual([]);
    expect(reiniciado.rodada).toBeGreaterThan(andamento.rodada);
  });

  it('lição sem exercícios já nasce concluída', () => {
    expect(criarEstadoInicial([]).fase).toBe('concluida');
  });
});
