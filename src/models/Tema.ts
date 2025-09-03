import type Postagem from "./Postagem";

export default interface Tema {
    descricao: string | number | readonly string[] | undefined; 
    id: number;
    descrição: string;
    postagem?: Postagem[] | null;
}