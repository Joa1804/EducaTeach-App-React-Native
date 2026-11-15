import {
    autenticar,
    buscarUsuarioPorSessao,
    cadastrarUsuario,
    criarSessao,
    encerrarSessao,
    type Usuario,
} from '../db/database';
import {
    cadastroSchema,
    loginSchema,
    primeiraMensagem,
    type CadastroInput,
    type LoginInput,
} from '../lib/validation/auth-schemas';
import { apagarToken, lerToken, salvarToken } from './session-storage';

export type AuthErrorCode = 'dados-invalidos' | 'credenciais-invalidas';

/** Erro de regra de negócio da autenticação, com mensagem pronta para a UI. */
export class AuthError extends Error {
    readonly code: AuthErrorCode;

    constructor(code: AuthErrorCode, mensagem: string) {
        super(mensagem);
        this.name = 'AuthError';
        this.code = code;
    }
}

/** Valida os dados, confere a senha e abre uma sessão persistida no aparelho. */
export async function login(input: LoginInput): Promise<Usuario> {
    const validacao = loginSchema.safeParse(input);

    if (!validacao.success) {
        throw new AuthError('dados-invalidos', primeiraMensagem(validacao.error));
    }

    const { email, senha } = validacao.data;
    const usuario = await autenticar(email, senha);

    if (!usuario) {
        throw new AuthError('credenciais-invalidas', 'E-mail ou senha incorretos.');
    }

    const { token } = await criarSessao(usuario.id);
    await salvarToken(token);

    return usuario;
}

/** Cria a conta (senha com hash). Não abre sessão: o usuário volta para o login. */
export async function cadastrar(input: CadastroInput): Promise<number> {
    const validacao = cadastroSchema.safeParse(input);

    if (!validacao.success) {
        throw new AuthError('dados-invalidos', primeiraMensagem(validacao.error));
    }

    const { nome, email, senha } = validacao.data;

    return cadastrarUsuario(nome, email, senha);
}

/** Restaura a sessão salva no aparelho. Token vencido ou inválido é descartado. */
export async function restaurarSessao(): Promise<Usuario | null> {
    const token = await lerToken();

    if (!token) return null;

    const usuario = await buscarUsuarioPorSessao(token);

    if (!usuario) {
        await apagarToken();
    }

    return usuario;
}

/** Encerra a sessão no banco e no aparelho. Mesmo se o banco falhar, o token local é apagado. */
export async function logout(): Promise<void> {
    const token = await lerToken();

    try {
        if (token) {
            await encerrarSessao(token);
        }
    } finally {
        await apagarToken();
    }
}
