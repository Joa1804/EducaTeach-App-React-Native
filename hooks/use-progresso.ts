import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useUsuario } from '../context/UsuarioContext';
import { buscarProgresso, type Progresso } from '../db/database';

type UseProgresso = {
    progresso: Progresso[];
    carregando: boolean;
    erro: string | null;
    /** Busca o progresso de novo (ex.: botão "Tentar novamente"). */
    recarregar: () => void;
};

/** Progresso do usuário da sessão, recarregado sempre que a tela ganha foco. */
export function useProgresso(): UseProgresso {
    const { usuario } = useUsuario();
    const usuarioId = usuario?.id ?? null;

    const [progresso, setProgresso] = useState<Progresso[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    // Mudar a versão recria o callback do foco e dispara uma nova busca.
    const [versao, setVersao] = useState(0);

    const recarregar = useCallback(() => setVersao((atual) => atual + 1), []);

    useFocusEffect(
        useCallback(() => {
            if (usuarioId === null) {
                setProgresso([]);
                setCarregando(false);
                return undefined;
            }

            let ativo = true;
            setCarregando(true);

            buscarProgresso(usuarioId)
                .then((linhas) => {
                    if (!ativo) return;
                    setProgresso(linhas);
                    setErro(null);
                })
                .catch((error: unknown) => {
                    console.error('Erro ao carregar progresso:', error);
                    if (ativo) setErro('Não foi possível carregar seu progresso.');
                })
                .finally(() => {
                    if (ativo) setCarregando(false);
                });

            return () => {
                ativo = false;
            };
            // `versao` entra nas dependências só para permitir recarregar manualmente.
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [usuarioId, versao])
    );

    return { progresso, carregando, erro, recarregar };
}
