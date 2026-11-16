import { montarTrilha } from '../trilha';
import { LICOES } from '../../../data/licoes';

const ids = LICOES.map((licao) => licao.id);

describe('montarTrilha', () => {
  it('sem progresso libera só a primeira lição', () => {
    const trilha = montarTrilha(LICOES, []);
    expect(trilha.etapas.map((etapa) => etapa.status)).toEqual([
      'disponivel',
      'bloqueada',
      'bloqueada',
      'bloqueada',
      'bloqueada',
    ]);
    expect(trilha.concluidas).toBe(0);
    expect(trilha.total).toBe(5);
    expect(trilha.proxima?.licao.id).toBe(ids[0]);
  });

  it('concluir uma lição libera a seguinte e guarda estrelas e pontos', () => {
    const trilha = montarTrilha(LICOES, [{ atividade_id: ids[0], pontos: 8, estrelas: 2 }]);
    expect(trilha.etapas[0]).toMatchObject({ status: 'concluida', estrelas: 2, pontos: 8 });
    expect(trilha.etapas[1].status).toBe('disponivel');
    expect(trilha.etapas[2].status).toBe('bloqueada');
    expect(trilha.proxima?.indice).toBe(1);
  });

  it('com tudo concluído não há próxima lição', () => {
    const trilha = montarTrilha(
      LICOES,
      ids.map((id) => ({ atividade_id: id, pontos: 10, estrelas: 3 })),
    );
    expect(trilha.concluidas).toBe(5);
    expect(trilha.proxima).toBeNull();
  });

  it('ignora progresso de atividades que não existem e limita estrelas', () => {
    const trilha = montarTrilha(LICOES, [
      { atividade_id: 'removida', pontos: 99, estrelas: 3 },
      { atividade_id: ids[0], pontos: 5, estrelas: 9 },
    ]);
    expect(trilha.concluidas).toBe(1);
    expect(trilha.etapas[0].estrelas).toBe(3);
  });

  it('mantém concluída uma lição salva mesmo se a anterior não estiver (dados antigos)', () => {
    const trilha = montarTrilha(LICOES, [{ atividade_id: ids[2], pontos: 5, estrelas: 1 }]);
    expect(trilha.etapas.map((etapa) => etapa.status)).toEqual([
      'disponivel',
      'bloqueada',
      'concluida',
      'disponivel',
      'bloqueada',
    ]);
  });
});
