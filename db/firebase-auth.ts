import type { FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

/** Web: o `getAuth` padrão já persiste a sessão no IndexedDB do navegador. */
export function criarAuth(app: FirebaseApp): Auth {
  return getAuth(app);
}
