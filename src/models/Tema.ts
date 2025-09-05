import type { JSX } from "react/jsx-runtime";
import type Postagem from "./Postagem";

export default interface Tema {
    map(arg0: (tema: any) => JSX.Element): import("react").ReactNode;
    descricao: string | number | readonly string[] | undefined; 
    id: number;
    descrição: string;
    postagem?: Postagem[] | null;
}