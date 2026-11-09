import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { buscarUsuario, type Usuario } from '../db/database';


type UsuarioContexttype = {
    usuario: Usuario | null;
    entrar: (Usuario: Usuario) => void;
    sair: () => void;
    recarregarUsuario: () => Promise<void>;
}

const UsuarioContext = createContext<UsuarioContexttype | null>(null);

export function Usuarioprovidor({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
 
    const entrar = useCallback((novo: Usuario) => setUsuario(novo), []);
    const sair = useCallback(() => setUsuario(null), []); 


    const recarregarUsuario = useCallback(async () => {
        if (!usuario) return;

        const atualizado = await buscarUsuario(usuario.id);

        if (atualizado) setUsuario(atualizado);
    }, [usuario]);

    return (
        <UsuarioContext.Provider value = {{ usuario, entrar, sair, recarregarUsuario }}>
            {children}
        </UsuarioContext.Provider>
    );
}


export function useUsuario() {
    const contexto = useContext(UsuarioContext);

    if (!contexto) {
        throw new Error('useUsuario precisa estar dentro de <UsuarioProvider>');
    }

    return contexto;
}