import { useCallback, useRef, useState } from 'react';
import { useUsuario } from '../context/UsuarioContext';
import { AuthError } from '../services/auth-service';

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 30_000;

type UseLogin = {
    email: string;
    senha: string;
    setEmail: (valor: string) => void;
    setSenha: (valor: string) => void;
    carregando: boolean;
    erro: string | null;
    enviar: () => Promise<void>;
};

/**
 * Estado e regras do formulário de login.
 * A navegação pós-login é feita pelo guard de rotas (Stack.Protected), não aqui.
 */
export function useLogin(): UseLogin {
    const { entrar } = useUsuario();

    const [email, setEmailState] = useState('');
    const [senha, setSenhaState] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    // Refs evitam duplo envio por toque rápido (o estado só atualiza no próximo render).
    const enviandoRef = useRef(false);
    const falhasRef = useRef(0);
    const bloqueadoAteRef = useRef(0);

    const setEmail = useCallback((valor: string) => {
        setEmailState(valor);
        setErro(null);
    }, []);

    const setSenha = useCallback((valor: string) => {
        setSenhaState(valor);
        setErro(null);
    }, []);

    const enviar = useCallback(async () => {
        if (enviandoRef.current) return;

        const restanteMs = bloqueadoAteRef.current - Date.now();
        if (restanteMs > 0) {
            setErro(`Muitas tentativas. Tente novamente em ${Math.ceil(restanteMs / 1000)} segundos.`);
            return;
        }

        enviandoRef.current = true;
        setCarregando(true);
        setErro(null);

        try {
            await entrar({ email, senha });
            falhasRef.current = 0;
        } catch (error: unknown) {
            if (error instanceof AuthError) {
                if (error.code === 'credenciais-invalidas') {
                    falhasRef.current += 1;

                    if (falhasRef.current >= MAX_TENTATIVAS) {
                        falhasRef.current = 0;
                        bloqueadoAteRef.current = Date.now() + BLOQUEIO_MS;
                    }
                }
                setErro(error.message);
            } else {
                console.error('Erro inesperado no login:', error);
                setErro('Não foi possível entrar agora. Tente novamente.');
            }
            // A senha nunca fica na tela depois de uma falha.
            setSenhaState('');
        } finally {
            enviandoRef.current = false;
            setCarregando(false);
        }
    }, [email, senha, entrar]);

    return { email, senha, setEmail, setSenha, carregando, erro, enviar };
}
