import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { buscarUsuario, type Usuario } from '../db/database';
import type { LoginInput } from '../lib/validation/auth-schemas';
import { login, logout, restaurarSessao } from '../services/auth-service';

export type StatusSessao = 'carregando' | 'autenticado' | 'anonimo';

type UsuarioContextType = {
    usuario: Usuario | null;
    status: StatusSessao;
    /** Autentica e abre a sessão. Lança `AuthError` com mensagem pronta para a UI. */
    entrar: (dados: LoginInput) => Promise<Usuario>;
    sair: () => Promise<void>;
    /** Relê o usuário do banco (ex.: depois de ganhar pontos). */
    recarregarUsuario: () => Promise<void>;
};

const UsuarioContext = createContext<UsuarioContextType | null>(null);

export function UsuarioProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [status, setStatus] = useState<StatusSessao>('carregando');

    // Id atual sem depender do estado no fechamento das callbacks.
    const usuarioIdRef = useRef<number | null>(null);

    const aplicarUsuario = useCallback((novo: Usuario | null) => {
        usuarioIdRef.current = novo?.id ?? null;
        setUsuario(novo);
        setStatus(novo ? 'autenticado' : 'anonimo');
    }, []);

    useEffect(() => {
        let ativo = true;

        restaurarSessao()
            .then((restaurado) => {
                if (ativo) aplicarUsuario(restaurado);
            })
            .catch((error: unknown) => {
                console.error('Falha ao restaurar a sessão:', error);
                if (ativo) aplicarUsuario(null);
            });

        return () => {
            ativo = false;
        };
    }, [aplicarUsuario]);

    const entrar = useCallback(
        async (dados: LoginInput) => {
            const autenticado = await login(dados);
            aplicarUsuario(autenticado);
            return autenticado;
        },
        [aplicarUsuario]
    );

    const sair = useCallback(async () => {
        try {
            await logout();
        } catch (error: unknown) {
            console.error('Falha ao encerrar a sessão:', error);
        } finally {
            // Mesmo com erro no banco, o usuário sai do app.
            aplicarUsuario(null);
        }
    }, [aplicarUsuario]);

    const recarregarUsuario = useCallback(async () => {
        const id = usuarioIdRef.current;
        if (id === null) return;

        const atualizado = await buscarUsuario(id);

        // Ignora a resposta se o usuário saiu (ou trocou de conta) enquanto a consulta rodava.
        if (usuarioIdRef.current !== id) return;

        if (!atualizado) {
            // A conta deixou de existir: encerra a sessão em vez de manter dados velhos.
            await sair();
            return;
        }

        aplicarUsuario(atualizado);
    }, [aplicarUsuario, sair]);

    const valor = useMemo<UsuarioContextType>(
        () => ({ usuario, status, entrar, sair, recarregarUsuario }),
        [usuario, status, entrar, sair, recarregarUsuario]
    );

    return <UsuarioContext.Provider value={valor}>{children}</UsuarioContext.Provider>;
}

export function useUsuario(): UsuarioContextType {
    const contexto = useContext(UsuarioContext);

    if (!contexto) {
        throw new Error('useUsuario precisa estar dentro de <UsuarioProvider>');
    }

    return contexto;
}

