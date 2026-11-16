import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp,
  setLogLevel,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';

import { criarNuvemFirestore } from '../services/firebase/nuvem-firestore';
import { buscarRankingGlobal } from '../services/firebase/ranking-global';

let ambiente: RulesTestEnvironment;

function firestoreDe(uid: string): Firestore {
  return ambiente.authenticatedContext(uid).firestore() as unknown as Firestore;
}

/** Cria dados ignorando as regras (estado inicial dos cenários). */
async function semRegras(acao: (db: Firestore) => Promise<void>): Promise<void> {
  await ambiente.withSecurityRulesDisabled(async (contexto) => {
    await acao(contexto.firestore() as unknown as Firestore);
  });
}

async function criarPerfil(uid: string, nome: string, pontos = 0): Promise<void> {
  await semRegras((db) =>
    setDoc(doc(db, 'ranking', uid), {
      nome,
      pontos,
      ultimaLicao: null,
      atualizadoEm: serverTimestamp(),
    }),
  );
}

beforeAll(async () => {
  // As negações esperadas geram avisos de PERMISSION_DENIED; só erros interessam.
  setLogLevel('error');
  const [host, porta] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':');
  ambiente = await initializeTestEnvironment({
    projectId: 'demo-educateach',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8'),
      host,
      port: Number(porta),
    },
  });
});

afterEach(async () => {
  await ambiente.clearFirestore();
});

afterAll(async () => {
  await ambiente.cleanup();
});

describe('regras de ranking/{uid}', () => {
  it('só alunos logados leem o ranking', async () => {
    await criarPerfil('ana', 'Ana');

    await assertSucceeds(getDoc(doc(firestoreDe('bia'), 'ranking', 'ana')));
    await assertFails(
      getDoc(
        doc(
          ambiente.unauthenticatedContext().firestore() as unknown as Firestore,
          'ranking',
          'ana',
        ),
      ),
    );
  });

  it('o aluno cria o próprio perfil só com 0 pontos e sem campos extras', async () => {
    const db = firestoreDe('ana');
    const base = { nome: 'Ana', ultimaLicao: null, atualizadoEm: serverTimestamp() };

    await assertFails(setDoc(doc(db, 'ranking', 'ana'), { ...base, pontos: 500 }));
    await assertFails(
      setDoc(doc(db, 'ranking', 'ana'), { ...base, pontos: 0, email: 'ana@exemplo.com' }),
    );
    await assertFails(setDoc(doc(db, 'ranking', 'bia'), { ...base, pontos: 0 }));
    await assertSucceeds(setDoc(doc(db, 'ranking', 'ana'), { ...base, pontos: 0 }));
  });

  it('não aceita somar pontos sem o progresso da lição', async () => {
    await criarPerfil('ana', 'Ana');

    await assertFails(
      updateDoc(doc(firestoreDe('ana'), 'ranking', 'ana'), {
        pontos: 150,
        ultimaLicao: 'funcoes',
        atualizadoEm: serverTimestamp(),
      }),
    );
  });

  it('permite trocar o nome sem mexer nos pontos', async () => {
    await criarPerfil('ana', 'Ana', 0);

    await assertSucceeds(
      updateDoc(doc(firestoreDe('ana'), 'ranking', 'ana'), {
        nome: 'Ana Souza',
        atualizadoEm: serverTimestamp(),
      }),
    );
  });

  it('ninguém apaga perfis nem altera o dos outros', async () => {
    await criarPerfil('ana', 'Ana');

    await assertFails(deleteDoc(doc(firestoreDe('ana'), 'ranking', 'ana')));
    await assertFails(
      updateDoc(doc(firestoreDe('bia'), 'ranking', 'ana'), {
        nome: 'Hackeado',
        atualizadoEm: serverTimestamp(),
      }),
    );
  });
});

describe('regras de usuarios/{uid}/progresso/{licao}', () => {
  async function gravarJunto(
    db: Firestore,
    uid: string,
    licao: string,
    progresso: { pontos: number; estrelas: number },
    ranking: { pontos: number; ultimaLicao: string },
  ): Promise<void> {
    const lote = writeBatch(db);
    lote.set(doc(db, 'usuarios', uid, 'progresso', licao), {
      ...progresso,
      atualizadoEm: serverTimestamp(),
    });
    lote.update(doc(db, 'ranking', uid), { ...ranking, atualizadoEm: serverTimestamp() });
    await lote.commit();
  }

  it('aceita progresso e ranking juntos, com a diferença exata', async () => {
    await criarPerfil('ana', 'Ana');

    await assertSucceeds(
      gravarJunto(
        firestoreDe('ana'),
        'ana',
        'variaveis',
        { pontos: 40, estrelas: 2 },
        {
          pontos: 40,
          ultimaLicao: 'variaveis',
        },
      ),
    );
  });

  it('recusa pontos acima do máximo da lição', async () => {
    await criarPerfil('ana', 'Ana');

    await assertFails(
      gravarJunto(
        firestoreDe('ana'),
        'ana',
        'variaveis',
        { pontos: 51, estrelas: 3 },
        {
          pontos: 51,
          ultimaLicao: 'variaveis',
        },
      ),
    );
  });

  it('recusa ranking que soma mais do que o progresso ganhou', async () => {
    await criarPerfil('ana', 'Ana');

    await assertFails(
      gravarJunto(
        firestoreDe('ana'),
        'ana',
        'variaveis',
        { pontos: 50, estrelas: 3 },
        {
          pontos: 150,
          ultimaLicao: 'variaveis',
        },
      ),
    );
  });

  it('recusa progresso que ganha pontos sem atualizar o ranking', async () => {
    await criarPerfil('ana', 'Ana');

    await assertFails(
      setDoc(doc(firestoreDe('ana'), 'usuarios', 'ana', 'progresso', 'variaveis'), {
        pontos: 50,
        estrelas: 3,
        atualizadoEm: serverTimestamp(),
      }),
    );
  });

  it('recusa lição desconhecida, pontos menores e progresso de outra pessoa', async () => {
    await criarPerfil('ana', 'Ana', 50);
    await semRegras((db) =>
      setDoc(doc(db, 'usuarios', 'ana', 'progresso', 'variaveis'), {
        pontos: 50,
        estrelas: 3,
        atualizadoEm: serverTimestamp(),
      }),
    );
    const db = firestoreDe('ana');

    await assertFails(
      gravarJunto(
        db,
        'ana',
        'licao-inventada',
        { pontos: 10, estrelas: 1 },
        {
          pontos: 60,
          ultimaLicao: 'licao-inventada',
        },
      ),
    );
    await assertFails(
      setDoc(doc(db, 'usuarios', 'ana', 'progresso', 'variaveis'), {
        pontos: 10,
        estrelas: 3,
        atualizadoEm: serverTimestamp(),
      }),
    );
    await assertFails(getDoc(doc(firestoreDe('bia'), 'usuarios', 'ana', 'progresso', 'variaveis')));
    await assertFails(deleteDoc(doc(db, 'usuarios', 'ana', 'progresso', 'variaveis')));
  });

  it('nega qualquer outro caminho', async () => {
    await assertFails(setDoc(doc(firestoreDe('ana'), 'qualquer', 'coisa'), { a: 1 }));
  });
});

describe('adaptador do Firestore com as regras ativas', () => {
  it('cria o perfil, envia progresso e não conta a mesma lição duas vezes', async () => {
    const nuvem = criarNuvemFirestore(firestoreDe('ana'));

    await nuvem.garantirPerfilRanking('ana', 'Ana');
    await nuvem.enviarProgresso('ana', { atividadeId: 'condicionais', pontos: 75, estrelas: 2 });
    await nuvem.enviarProgresso('ana', { atividadeId: 'condicionais', pontos: 75, estrelas: 2 });
    await nuvem.enviarProgresso('ana', { atividadeId: 'condicionais', pontos: 40, estrelas: 1 });
    await nuvem.enviarProgresso('ana', { atividadeId: 'condicionais', pontos: 100, estrelas: 3 });
    await nuvem.enviarProgresso('ana', { atividadeId: 'funcoes', pontos: 150, estrelas: 3 });

    const ranking = await getDoc(doc(firestoreDe('ana'), 'ranking', 'ana'));
    expect(ranking.data()).toMatchObject({ nome: 'Ana', pontos: 250, ultimaLicao: 'funcoes' });
    await expect(nuvem.buscarProgresso('ana')).resolves.toEqual(
      expect.arrayContaining([
        { atividadeId: 'condicionais', pontos: 100, estrelas: 3 },
        { atividadeId: 'funcoes', pontos: 150, estrelas: 3 },
      ]),
    );
  });

  it('melhora só as estrelas sem mexer no ranking', async () => {
    const nuvem = criarNuvemFirestore(firestoreDe('ana'));
    await nuvem.garantirPerfilRanking('ana', 'Ana');
    await nuvem.enviarProgresso('ana', { atividadeId: 'variaveis', pontos: 50, estrelas: 2 });

    await nuvem.enviarProgresso('ana', { atividadeId: 'variaveis', pontos: 50, estrelas: 3 });

    const snaps = await getDocs(collection(firestoreDe('ana'), 'usuarios', 'ana', 'progresso'));
    expect(snaps.docs[0]?.data()).toMatchObject({ pontos: 50, estrelas: 3 });
    const ranking = await getDoc(doc(firestoreDe('ana'), 'ranking', 'ana'));
    expect(ranking.data()?.pontos).toBe(50);
  });

  it('garantirPerfilRanking atualiza o nome e mantém os pontos', async () => {
    await criarPerfil('ana', 'Ana', 0);
    const nuvem = criarNuvemFirestore(firestoreDe('ana'));
    await nuvem.enviarProgresso('ana', { atividadeId: 'variaveis', pontos: 50, estrelas: 3 });

    await nuvem.garantirPerfilRanking('ana', 'Ana Souza');

    const ranking = await getDoc(doc(firestoreDe('ana'), 'ranking', 'ana'));
    expect(ranking.data()).toMatchObject({ nome: 'Ana Souza', pontos: 50 });
  });

  it('enviar sem perfil no ranking falha de forma explícita', async () => {
    const nuvem = criarNuvemFirestore(firestoreDe('ana'));

    await expect(
      nuvem.enviarProgresso('ana', { atividadeId: 'variaveis', pontos: 50, estrelas: 3 }),
    ).rejects.toThrow('O perfil do ranking ainda não existe na nuvem.');
  });

  it('buscarRankingGlobal ordena, posiciona com empates e acha quem está acima', async () => {
    await criarPerfil('ana', 'Ana', 300);
    await criarPerfil('bia', 'Bia', 200);
    await criarPerfil('caio', 'Caio', 200);
    await criarPerfil('davi', 'Davi', 50);

    const resumo = await buscarRankingGlobal(firestoreDe('davi'), 'davi', 2);

    expect(resumo.total).toBe(4);
    expect(resumo.lideres.map((linha) => [linha.id, linha.pontos])).toEqual([
      ['ana', 300],
      ['bia', 200],
    ]);
    expect(resumo.usuario).toMatchObject({
      linha: { id: 'davi', nome: 'Davi', pontos: 50 },
      posicao: 4,
      acima: { pontos: 200 },
    });

    const lider = await buscarRankingGlobal(firestoreDe('ana'), 'ana', 10);
    expect(lider.usuario).toMatchObject({ posicao: 1, acima: null });
  });

  it('usuário sem perfil no ranking recebe só os líderes', async () => {
    await criarPerfil('ana', 'Ana', 100);

    const resumo = await buscarRankingGlobal(firestoreDe('novo'), 'novo', 10);

    expect(resumo.usuario).toBeNull();
    expect(resumo.lideres).toHaveLength(1);
  });
});
