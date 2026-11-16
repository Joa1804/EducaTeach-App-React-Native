import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type Firestore,
} from 'firebase/firestore';

import { limiteSeguro, type LinhaRanking, type ResumoRanking } from '../../lib/ranking/tipos';
import { COLECAO_RANKING, lerDocumentos, rankingConverter, type RegistroRanking } from './modelos';

function paraLinha(id: string, dados: RegistroRanking): LinhaRanking {
  return { id, nome: dados.nome, avatar: 'padrao', pontos: dados.pontos };
}

/** Mesma ordem do ranking local: pontos, depois nome, depois id. */
function compararLinhas(a: LinhaRanking, b: LinhaRanking): number {
  return (
    b.pontos - a.pontos ||
    a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }) ||
    a.id.localeCompare(b.id)
  );
}

/**
 * Ranking de todos os alunos, lido do Firestore com o mesmo formato do
 * ranking local. Usa só consultas paginadas (`limit`) e agregações de
 * contagem, que custam pouco mesmo com muitos alunos.
 */
export async function buscarRankingGlobal(
  db: Firestore,
  uid: string,
  limite: number,
): Promise<ResumoRanking> {
  const colecao = collection(db, COLECAO_RANKING).withConverter(rankingConverter);

  const [lideresSnap, totalSnap, meuSnap] = await Promise.all([
    getDocs(
      query(
        colecao,
        orderBy('pontos', 'desc'),
        orderBy('nome', 'asc'),
        limit(limiteSeguro(limite)),
      ),
    ),
    getCountFromServer(colecao),
    getDoc(doc(colecao, uid)),
  ]);

  const lideres = lerDocumentos(lideresSnap.docs)
    .map(({ id, dados }) => paraLinha(id, dados))
    .sort(compararLinhas);
  const total = totalSnap.data().count;

  if (!meuSnap.exists()) {
    return { lideres, total, usuario: null };
  }

  const linha = paraLinha(meuSnap.id, meuSnap.data());
  const acimaDeMim = query(colecao, where('pontos', '>', linha.pontos));

  const [melhoresSnap, acimaSnap] = await Promise.all([
    getCountFromServer(acimaDeMim),
    getDocs(query(acimaDeMim, orderBy('pontos', 'asc'), orderBy('nome', 'desc'), limit(1))),
  ]);

  const [acima] = lerDocumentos(acimaSnap.docs);

  return {
    lideres,
    total,
    usuario: {
      linha,
      posicao: melhoresSnap.data().count + 1,
      acima: acima ? paraLinha(acima.id, acima.dados) : null,
    },
  };
}
