import {
  collection,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';

import type { NuvemProgresso, ProgressoNuvem } from '../sync/tipos';
import {
  COLECAO_RANKING,
  COLECAO_USUARIOS,
  SUBCOLECAO_PROGRESSO,
  lerDocumentos,
  progressoConverter,
  rankingConverter,
} from './modelos';

export class PerfilRankingAusenteError extends Error {
  constructor() {
    super('O perfil do ranking ainda não existe na nuvem.');
    this.name = 'PerfilRankingAusenteError';
  }
}

function refRanking(db: Firestore, uid: string) {
  return doc(db, COLECAO_RANKING, uid).withConverter(rankingConverter);
}

function refProgresso(db: Firestore, uid: string, atividadeId: string) {
  return doc(db, COLECAO_USUARIOS, uid, SUBCOLECAO_PROGRESSO, atividadeId).withConverter(
    progressoConverter,
  );
}

/** Implementação da porta de sincronização sobre o Firestore (SDK modular). */
export function criarNuvemFirestore(db: Firestore): NuvemProgresso {
  return {
    async garantirPerfilRanking(uid, nome) {
      const ref = refRanking(db, uid);
      const nomeLimpo = nome.trim().slice(0, 80) || 'Aluno';

      // Transação: duas sincronizações simultâneas não criam o documento duas vezes.
      await runTransaction(db, async (transacao) => {
        const atual = await transacao.get(ref);

        if (!atual.exists()) {
          transacao.set(doc(db, COLECAO_RANKING, uid), {
            nome: nomeLimpo,
            pontos: 0,
            ultimaLicao: null,
            atualizadoEm: serverTimestamp(),
          });
          return;
        }

        if (atual.data().nome !== nomeLimpo) {
          transacao.update(doc(db, COLECAO_RANKING, uid), {
            nome: nomeLimpo,
            atualizadoEm: serverTimestamp(),
          });
        }
      });
    },

    async buscarProgresso(uid) {
      const consulta = await getDocs(
        collection(db, COLECAO_USUARIOS, uid, SUBCOLECAO_PROGRESSO).withConverter(
          progressoConverter,
        ),
      );

      return lerDocumentos(consulta.docs).map<ProgressoNuvem>(({ id, dados }) => ({
        atividadeId: id,
        pontos: dados.pontos,
        estrelas: dados.estrelas,
      }));
    },

    async enviarProgresso(uid, progresso) {
      const ref = refProgresso(db, uid, progresso.atividadeId);
      const rankingRef = refRanking(db, uid);

      // Lê o estado atual da nuvem e grava progresso + ranking juntos (atômico),
      // como as Security Rules exigem.
      await runTransaction(db, async (transacao) => {
        const [atual, ranking] = [await transacao.get(ref), await transacao.get(rankingRef)];

        if (!ranking.exists()) {
          throw new PerfilRankingAusenteError();
        }

        const anterior = atual.exists() ? atual.data() : null;
        const pontosAnteriores = anterior?.pontos ?? 0;
        const pontos = Math.max(pontosAnteriores, progresso.pontos);
        const estrelas = Math.max(anterior?.estrelas ?? 0, progresso.estrelas);

        if (anterior && pontos === anterior.pontos && estrelas === anterior.estrelas) {
          return;
        }

        transacao.set(doc(db, COLECAO_USUARIOS, uid, SUBCOLECAO_PROGRESSO, progresso.atividadeId), {
          pontos,
          estrelas,
          atualizadoEm: serverTimestamp(),
        });

        const ganho = pontos - pontosAnteriores;

        if (ganho > 0) {
          transacao.update(doc(db, COLECAO_RANKING, uid), {
            pontos: ranking.data().pontos + ganho,
            ultimaLicao: progresso.atividadeId,
            atualizadoEm: serverTimestamp(),
          });
        }
      });
    },
  };
}
