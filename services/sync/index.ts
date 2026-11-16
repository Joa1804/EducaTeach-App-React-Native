import type { Usuario } from '../../db/database';
import { firebaseHabilitado, getFirestoreDb } from '../../db/firebase';
import { criarNuvemFirestore } from '../firebase/nuvem-firestore';
import { sincronizarProgressoUnico, type ResultadoSincronizacao } from './sincronizar-progresso';

/**
 * Sincroniza o progresso do usuário com o Firestore, se o Firebase estiver
 * configurado e o perfil tiver conta vinculada. Devolve `null` quando não há
 * o que sincronizar (modo local). Erros de rede são propagados.
 */
export async function sincronizarUsuario(
  usuario: Pick<Usuario, 'id' | 'nome' | 'firebase_uid'>,
): Promise<ResultadoSincronizacao | null> {
  if (!usuario.firebase_uid || !firebaseHabilitado()) return null;

  return sincronizarProgressoUnico(
    { usuarioId: usuario.id, uid: usuario.firebase_uid, nome: usuario.nome },
    criarNuvemFirestore(getFirestoreDb()),
  );
}

/** Versão "dispare e esqueça": nunca rejeita, só registra o erro. */
export function sincronizarEmSegundoPlano(
  usuario: Pick<Usuario, 'id' | 'nome' | 'firebase_uid'>,
): void {
  sincronizarUsuario(usuario).catch((error: unknown) => {
    console.warn('Sincronização adiada (sem conexão ou erro na nuvem):', error);
  });
}
