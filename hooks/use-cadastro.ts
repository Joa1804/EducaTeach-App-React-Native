import { useCallback, useRef, useState } from 'react';
import { EmailJaCadastradoError } from '../db/database';
import type { CadastroInput } from '../lib/validation/auth-schemas';
import { AuthError, cadastrar } from '../services/auth-service';

type UseCadastro = {
    carregando: boolean;
    erro: string | null;
    limparErro: () => void;
    /** Retorna true quando a conta foi criada. */
    enviar: (dados: CadastroInput) => Promise<boolean>;
};

export function useCadastro(): UseCadastro {
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const enviandoRef = useRef(false);

    const limparErro = useCallback(() => setErro(null), []);

    const enviar = useCallback(async (dados: CadastroInput) => {
        if (enviandoRef.current) return false;

        enviandoRef.current = true;
        setCarregando(true);
        setErro(null);

        try {
            await cadastrar(dados);
            return true;
        } catch (error: unknown) {
            if (error instanceof AuthError || error instanceof EmailJaCadastradoError) {
                setErro(error.message);
            } else {
                console.error('Erro ao cadastrar usuário:', error);
                setErro('Não foi possível criar a conta agora. Tente novamente.');
            }
            return false;
        } finally {
            enviandoRef.current = false;
            setCarregando(false);
        }
    }, []);

    return { carregando, erro, limparErro, enviar };
}
