import { useState, useContext, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import type Postagem from "../../../models/Postagem";
import type Tema from "../../../models/Tema";
import { ClipLoader } from "react-spinners";
import type { formToJSON } from "axios";
import { atualizar, buscar, cadastrar } from "../../../services/Service";
 
function FormPostagem() {
 
    const navigate = useNavigate();
 
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [temas, setTemas] = useState<Tema[]>([]);
    const [tema, setTema] = useState<Tema>({ id: 0, descricao: "" });
    const [postagem, setPostagem] = useState<Postagem>({} as Postagem);
 
    const { usuario, handleLogout } = useContext(AuthContext);
    const token = usuario.token ?? "";
    const authHeader = token.startsWith("Bearer") ? token : `Bearer ${token}`;
 
    const { id } = useParams<{ id: string }>();
 
    async function buscarPostagemPorId(id: string) {
        try {
            await buscar(`/postagens/${id}`, setPostagem, {
                headers: { Authorization: authHeader },
            });
        } catch (error: any) {
            if (String(error).includes("401")) handleLogout();
        }
    }
 
    async function buscarTemas() {
        try {
            await buscar("/temas", setTemas, {
                headers: { Authorization: authHeader },
            });
        } catch (e: any) {
            // fallback para APIs que expõem no singular
            const status = e?.response?.status || 0;
            if (status === 404) {
                await buscar("/tema", setTemas, {
                    headers: { Authorization: authHeader },
                });
            } else if (status === 401) {
                handleLogout();
            } else {
                console.error("Erro ao buscar temas:", e);
                alert("Não foi possível carregar os temas.");
            }
        }
    }
 
    useEffect(() => {
        if (!token) {
            alert("Você precisa estar logado!");
            navigate("/");
        }
    }, [token, navigate]);
 
    useEffect(() => {
        buscarTemas();
        if (id !== undefined) buscarPostagemPorId(id);
    }, [id, authHeader]);
 
    useEffect(() => {
        setPostagem((prev) => ({ ...prev, tema }));
    }, [tema]);
 
    useEffect(() => {
        if (postagem?.tema?.id) setTema(postagem.tema);
    }, [postagem]);
 
    function atualizarEstado(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setPostagem((prev) => ({
            ...prev,
            [name]: value,
            tema,
            usuario,
        }));
    }
 
    function retornar() {
        navigate("/postagens");
    }
 
    async function gerarNovaPostagem(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
 
        try {
            if (id !== undefined) {
                await atualizar(`/postagens`, postagem, setPostagem, {
                    headers: { Authorization: authHeader },
                });
                alert("A Postagem foi atualizada com sucesso!");
            } else {
                await cadastrar(`/postagens`, postagem, setPostagem, {
                    headers: { Authorization: authHeader },
                });
                alert("A Postagem foi cadastrada com sucesso!");
            }
            retornar();
        } catch (error: any) {
            if (String(error).includes("401")) handleLogout();
            else alert(id ? "Erro ao atualizar a postagem." : "Erro ao cadastrar a postagem.");
        } finally {
            setIsLoading(false);
        }
    }
 
    const carregandoTema = !tema.id;
 
    return (
        <div className="container flex flex-col mx-auto items-center">
            <h1 className="text-4xl text-center my-8">
                {id !== undefined ? "Editar Postagem" : "Cadastrar Postagem"}
            </h1>
 
            <form className="flex flex-col w-1/2 gap-4" onSubmit={gerarNovaPostagem}>
                <div className="flex flex-col gap-2">
                    <label htmlFor="titulo">Título da Postagem</label>
                    <input
                        type="text"
                        placeholder="Título"
                        name="titulo"
                        required
                        className="border-2 border-slate-700 rounded p-2"
                        value={postagem.titulo ?? ""}
                        onChange={atualizarEstado}
                    />
                </div>
 
                <div className="flex flex-col gap-2">
                    <label htmlFor="texto">Texto da Postagem</label>
                    <input
                        type="text"
                        placeholder="Texto"
                        name="texto"
                        required
                        className="border-2 border-slate-700 rounded p-2"
                        value={postagem.texto ?? ""}
                        onChange={atualizarEstado}
                    />
                </div>
 
                <div className="flex flex-col gap-2">
                    <p>Tema da Postagem</p>
                    <select
                        name="tema"
                        id="tema"
                        className="border p-2 border-slate-800 rounded"
                        value={tema.id || ""}
                        onChange={(e) => {
                            const idSelecionado = Number(e.target.value);
                            const selecionado = temas.find((t) => t.id === idSelecionado);
                            if (selecionado) setTema(selecionado);
                        }}
                    >
                        <option value="" disabled>
                            Selecione um Tema
                        </option>
                        {temas.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.descricao}
                            </option>
                        ))}
                    </select>
                </div>
 
                <button
                    type="submit"
                    className="rounded disabled:bg-slate-200 bg-indigo-400 hover:bg-indigo-800 text-white font-bold w-1/2 mx-auto py-2 flex justify-center"
                    disabled={carregandoTema}
                >
                    {isLoading ? <ClipLoader color="#ffffff" size={24} /> : <span>{id === undefined ? "Cadastrar" : "Atualizar"}</span>}
                </button>
            </form>
        </div>
    );
}
 
export default FormPostagem;
 