import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useUsuario } from '../context/UsuarioContext';
import { buscarProgresso, type Progresso } from '../db/database';

type UseProgresso = {
    progresso: Progresso[];
    carregando: boolean;
    erro: string | null;
};

/** Progresso do usuário da sessão, recarregado sempre que a tela ganha foco. */
export function useProgresso(): UseProgresso {
    const { usuario } = useUsuario();
    const usuarioId = usuario?.id ?? null;

    const [progresso, setProgresso] = useState<Progresso[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

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
        }, [usuarioId])
    );

    return { progresso, carregando, erro };
}
