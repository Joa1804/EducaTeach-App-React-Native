type Fase = {
  id: number;
  titulo: string;
  descricao: string;
  status: 'concluido' | 'em-andamento' | 'bloqueado';
  estrelas?: number;
}

export const FASES: Fase[] = [
{
    id: 1,
    titulo: 'Movimento',
    descricao: 'Aprenda os comandos básicos',
    status: 'concluido',
    estrelas: 3,
},

{
    id: 2,
    titulo: 'Repetição',
    descricao: 'Aprenda a repetir comandos',
    status: 'em-andamento',
    estrelas: 2,
},

{
    id: 3,
    titulo: 'Condições',
    descricao: 'Aprenda a usar deciçoes',
    status: 'bloqueado',
},

{
    id: 4,
    titulo: 'Aprende a guardar informações',
    status: 'bloqueado',
    descricao: ""
},

{
    id: 5,
    titulo: 'Desafio Final',
    descricao: 'Coloque tudo em  prático',
    status: 'bloqueado', 
},

];