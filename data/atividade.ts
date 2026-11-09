import {Ionicons } from '@expo/vector-icons';

export type Dificuldade = 'facil' | 'medio' | 'dificil';

export type Atividade = {
    id: string; 
    titulo: string;
    icone: keyof typeof Ionicons.glyphMap;
    dificuldade: Dificuldade;
    pontos: number;
    moedas: number;
};

export const ATIVIDADE: Atividade[] = [
     { id: 'comandos-basicos', titulo: 'Comandos Básicos', icone: 'arrow-forward', dificuldade: 'facil', pontos: 10, moedas: 1 },
    { id: 'repeticoes-loops', titulo: 'Repetições e Loops', icone: 'repeat', dificuldade: 'facil', pontos: 10, moedas: 1 },
    { id: 'condicionais', titulo: 'Condicionais', icone: 'help', dificuldade: 'medio', pontos: 20, moedas: 2 },
    { id: 'variaveis', titulo: 'Variáveis', icone: 'cube', dificuldade: 'medio', pontos: 20, moedas: 2 },
    { id: 'funcoes', titulo: 'Funções', icone: 'construct', dificuldade: 'dificil', pontos: 30, moedas: 3 },
];