import { useCallback, useRef, useState } from 'react';
import { useUsuario } from '../context/UsuarioContext';
import { registrarConclusao } from '../db/database';
import type { Atividade } from '../data/atividade';

export type ResultadoConclusao = {
    primeiraVez: boolean;
    pontosGanhos: number;
};

type UseConcluirAtividade = {
    salvando: boolean;
    erro: string | null;
    /**
     * Registra a conclusão para o usuário da sessão e atualiza pontos/moedas no contexto.
     * `pontosObtidos` é a pontuação da tentativa (padrão: pontuação máxima da atividade).
     * Retorna `null` se não houver sessão, se já houver um envio em andamento ou em caso de erro.
     */
    concluir: (atividade: Atividade, pontosObtidos?: number) => Promise<ResultadoConclusao | null>;
};

export function useConcluirAtividade(): UseConcluirAtividade {
    const { usuario, recarregarUsuario } = useUsuario();
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const salvandoRef = useRef(false);

    const usuarioId = usuario?.id ?? null;

    const concluir = useCallback(
        async (atividade: Atividade, pontosObtidos?: number) => {
            if (usuarioId === null || salvandoRef.current) return null;

            // Nunca aceita pontuação negativa ou acima do máximo da atividade.
            const pontos = Math.min(
                atividade.pontos,
                Math.max(0, Math.round(pontosObtidos ?? atividade.pontos))
            );

            salvandoRef.current = true;
            setSalvando(true);
            setErro(null);

            try {
                const resultado = await registrarConclusao(
                    usuarioId,
                    atividade.id,
                    pontos,
                    atividade.moedas
                );
                await recarregarUsuario();
                return resultado;
            } catch (error: unknown) {
                console.error('Erro ao registrar conclusão:', error);
                setErro('Não foi possível salvar seu progresso. Tente novamente.');
                return null;
            } finally {
                salvandoRef.current = false;
                setSalvando(false);
            }
        },
        [usuarioId, recarregarUsuario]
    );

    return { salvando, erro, concluir };
}
