import type * as DatabaseModule from '../../../db/database';
import type * as SyncModule from '../sincronizar-progresso';
import type { NuvemProgresso, ProgressoNuvem } from '../tipos';

/** Nuvem em memória com a mesma regra do Firestore: guarda o melhor e soma a diferença. */
class NuvemFalsa implements NuvemProgresso {
  ranking = new Map<string, { nome: string; pontos: number }>();
  progresso = new Map<string, Map<string, ProgressoNuvem>>();
  falharEnvioDe = new Set<string>();
  envios: ProgressoNuvem[] = [];

  async garantirPerfilRanking(uid: string, nome: string) {
    const atual = this.ranking.get(uid);
    this.ranking.set(uid, { nome, pontos: atual?.pontos ?? 0 });
  }

  async buscarProgresso(uid: string) {
    return [...(this.progresso.get(uid)?.values() ?? [])];
  }

  async enviarProgresso(uid: string, enviado: ProgressoNuvem) {
    if (this.falharEnvioDe.has(enviado.atividadeId)) throw new Error('rede caiu');
    this.envios.push(enviado);
    const doUsuario = this.progresso.get(uid) ?? new Map<string, ProgressoNuvem>();
    const anterior = doUsuario.get(enviado.atividadeId);
    const pontos = Math.max(anterior?.pontos ?? 0, enviado.pontos);
    doUsuario.set(enviado.atividadeId, {
      atividadeId: enviado.atividadeId,
      pontos,
      estrelas: Math.max(anterior?.estrelas ?? 0, enviado.estrelas),
    });
    this.progresso.set(uid, doUsuario);
    const ranking = this.ranking.get(uid);
    if (!ranking) throw new Error('perfil ausente');
    ranking.pontos += pontos - (anterior?.pontos ?? 0);
  }
}

function carregar() {
  jest.resetModules();
  return {
    database: jest.requireActual<typeof DatabaseModule>('../../../db/database'),
    sync: jest.requireActual<typeof SyncModule>('../sincronizar-progresso'),
  };
}

describe('sincronizarProgresso', () => {
  let database: typeof DatabaseModule;
  let sync: typeof SyncModule;
  let nuvem: NuvemFalsa;
  let conta: SyncModule.ContaSincronizavel;

  beforeEach(async () => {
    ({ database, sync } = carregar());
    nuvem = new NuvemFalsa();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const usuario = await database.vincularContaFirebase({
      uid: 'uid-ana',
      nome: 'Ana',
      email: 'ana@exemplo.com',
    });
    conta = { usuarioId: usuario.id, uid: 'uid-ana', nome: 'Ana' };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('cria o perfil no ranking e envia o progresso pendente', async () => {
    await database.registrarConclusao(conta.usuarioId, 'comandos-basicos', 50, 1, 3);
    await database.registrarConclusao(conta.usuarioId, 'condicionais', 75, 2, 2);

    const resultado = await sync.sincronizarProgresso(conta, nuvem);

    expect(resultado).toEqual({ recebidas: 0, enviadas: 2, falhas: 0 });
    expect(nuvem.ranking.get('uid-ana')).toEqual({ nome: 'Ana', pontos: 125 });
    await expect(database.buscarProgressoPendente(conta.usuarioId)).resolves.toEqual([]);
  });

  it('não envia de novo o que já foi sincronizado', async () => {
    await database.registrarConclusao(conta.usuarioId, 'comandos-basicos', 50, 1, 3);
    await sync.sincronizarProgresso(conta, nuvem);
    nuvem.envios = [];

    const resultado = await sync.sincronizarProgresso(conta, nuvem);

    expect(resultado.enviadas).toBe(0);
    expect(nuvem.envios).toEqual([]);
    expect(nuvem.ranking.get('uid-ana')?.pontos).toBe(50);
  });

  it('traz o progresso de outro aparelho e envia só as melhorias locais', async () => {
    nuvem.progresso.set(
      'uid-ana',
      new Map([
        ['funcoes', { atividadeId: 'funcoes', pontos: 150, estrelas: 3 }],
        ['variaveis', { atividadeId: 'variaveis', pontos: 20, estrelas: 1 }],
      ]),
    );
    nuvem.ranking.set('uid-ana', { nome: 'Ana', pontos: 170 });
    await database.registrarConclusao(conta.usuarioId, 'variaveis', 50, 1, 3);

    const resultado = await sync.sincronizarProgresso(conta, nuvem);

    expect(resultado).toEqual({ recebidas: 2, enviadas: 1, falhas: 0 });
    expect(nuvem.envios).toEqual([{ atividadeId: 'variaveis', pontos: 50, estrelas: 3 }]);
    expect(nuvem.ranking.get('uid-ana')?.pontos).toBe(200);
    await expect(database.buscarUsuario(conta.usuarioId)).resolves.toMatchObject({ pontos: 200 });
  });

  it('ignora lições desconhecidas e limita pontos ao máximo da lição', async () => {
    nuvem.progresso.set(
      'uid-ana',
      new Map([
        ['licao-removida', { atividadeId: 'licao-removida', pontos: 999, estrelas: 3 }],
        ['comandos-basicos', { atividadeId: 'comandos-basicos', pontos: 999, estrelas: 9 }],
      ]),
    );

    await sync.sincronizarProgresso(conta, nuvem);

    await expect(database.buscarProgresso(conta.usuarioId)).resolves.toEqual([
      expect.objectContaining({ atividade_id: 'comandos-basicos', pontos: 50, estrelas: 3 }),
    ]);
  });

  it('uma lição que falha continua pendente sem impedir as outras', async () => {
    await database.registrarConclusao(conta.usuarioId, 'comandos-basicos', 50, 1, 3);
    await database.registrarConclusao(conta.usuarioId, 'variaveis', 50, 1, 3);
    nuvem.falharEnvioDe.add('comandos-basicos');

    const resultado = await sync.sincronizarProgresso(conta, nuvem);

    expect(resultado).toEqual({ recebidas: 0, enviadas: 1, falhas: 1 });
    await expect(database.buscarProgressoPendente(conta.usuarioId)).resolves.toEqual([
      expect.objectContaining({ atividade_id: 'comandos-basicos' }),
    ]);

    nuvem.falharEnvioDe.clear();
    await expect(sync.sincronizarProgresso(conta, nuvem)).resolves.toMatchObject({ enviadas: 1 });
    expect(nuvem.ranking.get('uid-ana')?.pontos).toBe(100);
  });

  it('sem conexão para criar o perfil, rejeita e mantém tudo pendente', async () => {
    await database.registrarConclusao(conta.usuarioId, 'comandos-basicos', 50, 1, 3);
    jest.spyOn(nuvem, 'garantirPerfilRanking').mockRejectedValueOnce(new Error('offline'));

    await expect(sync.sincronizarProgresso(conta, nuvem)).rejects.toThrow('offline');
    await expect(database.buscarProgressoPendente(conta.usuarioId)).resolves.toHaveLength(1);
  });

  it('chamadas simultâneas da mesma conta compartilham uma única sincronização', async () => {
    await database.registrarConclusao(conta.usuarioId, 'comandos-basicos', 50, 1, 3);
    const espiao = jest.spyOn(nuvem, 'garantirPerfilRanking');

    const [a, b] = await Promise.all([
      sync.sincronizarProgressoUnico(conta, nuvem),
      sync.sincronizarProgressoUnico(conta, nuvem),
    ]);

    expect(a).toBe(b);
    expect(espiao).toHaveBeenCalledTimes(1);
    expect(nuvem.envios).toHaveLength(1);
  });
});
