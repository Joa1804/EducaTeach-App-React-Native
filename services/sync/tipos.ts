/** Melhor resultado de uma lição como fica guardado na nuvem. */
export type ProgressoNuvem = {
  atividadeId: string;
  pontos: number;
  estrelas: number;
};

/**
 * Porta de saída da sincronização (Dependency Inversion): a regra de negócio
 * não conhece o Firestore, e os testes usam uma implementação em memória.
 */
export interface NuvemProgresso {
  /** Cria (com 0 pontos) ou atualiza o nome do aluno no ranking. */
  garantirPerfilRanking(uid: string, nome: string): Promise<void>;
  buscarProgresso(uid: string): Promise<ProgressoNuvem[]>;
  /**
   * Envia o resultado de uma lição. A nuvem guarda o melhor entre o que já
   * tinha e o enviado, e soma ao ranking só a diferença de pontos.
   */
  enviarProgresso(uid: string, progresso: ProgressoNuvem): Promise<void>;
}
