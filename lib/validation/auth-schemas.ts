import { z } from 'zod';

const email = z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail.')
    .max(254, 'E-mail muito longo.')
    .pipe(z.email('Por favor, insira um e-mail válido.'))
    .transform((valor) => valor.toLowerCase());

export const TAMANHO_MINIMO_SENHA = 6;
const TAMANHO_MAXIMO_SENHA = 128;

export const loginSchema = z.object({
    email,
    senha: z
        .string()
        .min(1, 'Informe sua senha.')
        .max(TAMANHO_MAXIMO_SENHA, 'Senha muito longa.'),
});

export const cadastroSchema = z
    .object({
        nome: z
            .string()
            .trim()
            .min(2, 'Informe seu nome completo.')
            .max(80, 'Nome muito longo.'),
        email,
        senha: z
            .string()
            .min(TAMANHO_MINIMO_SENHA, `A senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`)
            .max(TAMANHO_MAXIMO_SENHA, 'Senha muito longa.'),
        confirmarSenha: z.string(),
    })
    .refine((dados) => dados.senha === dados.confirmarSenha, {
        message: 'As senhas não coincidem.',
        path: ['confirmarSenha'],
    });

export type LoginInput = z.input<typeof loginSchema>;
export type LoginDados = z.output<typeof loginSchema>;
export type CadastroInput = z.input<typeof cadastroSchema>;
export type CadastroDados = z.output<typeof cadastroSchema>;

/** Retorna a primeira mensagem de erro do Zod, para exibir na UI. */
export function primeiraMensagem(erro: z.ZodError): string {
    return erro.issues[0]?.message ?? 'Dados inválidos.';
}
