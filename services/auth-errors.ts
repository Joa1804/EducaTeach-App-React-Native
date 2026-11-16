export type AuthErrorCode =
  | 'dados-invalidos'
  | 'credenciais-invalidas'
  | 'sem-conexao'
  | 'muitas-tentativas'
  | 'indisponivel';

/** Erro de regra de negócio da autenticação, com mensagem pronta para a UI. */
export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, mensagem: string) {
    super(mensagem);
    this.name = 'AuthError';
    this.code = code;
  }
}

export const MENSAGEM_CREDENCIAIS_INVALIDAS = 'E-mail ou senha incorretos.';
