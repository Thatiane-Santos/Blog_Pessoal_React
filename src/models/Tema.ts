import type Postagem from "./Postagem";

export default interface Tema { 
    id: number;
    descrição: string;
    postagem?: Postagem[] | null;
}