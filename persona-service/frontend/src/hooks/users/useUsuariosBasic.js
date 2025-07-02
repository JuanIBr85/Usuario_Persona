import { useState, useEffect } from "react";
import { userService } from "@/services/userService";
import {traducirRateLimitMessage} from "@/utils/traductores";

export function useUsuariosBasic() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchUsuarios() {
            setLoading(true);
            setError("");
            try {
                const userData = await userService.getAllUsers();
                const basicUsers = Array.isArray(userData)
                    ? userData.map(u => ({
                        id: u.id,
                        nombre_usuario: u.nombre_usuario,
                        email_usuario: u.email_usuario,
                    }))
                    : [];
                setUsuarios(basicUsers);
            } catch (e) {
                setUsuarios([]);
                const rawMsg = e?.data?.message || e?.message || "Error desconocido.";
                const msg = traducirRateLimitMessage(rawMsg);
                setError(msg);
                console.error("Error obteniendo usuarios:", msg);
            }
            setLoading(false);
        }
        fetchUsuarios();
    }, []);

    return { usuarios, loading, error };
}