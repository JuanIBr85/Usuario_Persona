
export const ServiceURL = Object.freeze({
    auth: "http://localhost:5000",
    persona: "http://localhost:5001",
});

// Lista de métodos HTTP que podemos usar para comunicarnos con el servidor
export const HttpMethod = Object.freeze({
    GET: "GET",        // Para obtener datos (leer)
    POST: "POST",      // Para crear nuevos datos
    PUT: "PUT",        // Para actualizar datos completos
    DELETE: "DELETE",  // Para eliminar datos
    PATCH: "PATCH",    // Para actualizar datos parcialmente
    OPTIONS: "OPTIONS", // Para consultar qué métodos están disponibles
    HEAD: "HEAD",      // Para obtener solo los headers (sin contenido)
});

export class FetchError extends Error {
  constructor(mensaje, isJson, statusCode, data) {
    super(mensaje); 
    this.isJson = isJson; 
    this.statusCode = statusCode; 
    this.data = data; 
  }
}

// PARÁMETROS:
// - url: string - Ruta específica de la API a la que queremos hacer la petición
// - method: string - Tipo de petición HTTP (usa HttpMethod.GET, HttpMethod.POST, etc.)
// - headers: object - Headers adicionales para la petición (por defecto: {})
// - body: object - Datos a enviar en el cuerpo de la petición (solo para POST, PUT, PATCH)
// - useToken: boolean - Si incluir el token de autorización desde localStorage
// - returnJson: boolean - Si convertir la respuesta a JSON automáticamente (por defecto: true)
// - timeout: number - Tiempo máximo de espera en milisegundos (por defecto: 5000ms = 5 segundos)

// Objeto que contiene métodos para hacer peticiones con Fetch
export const fetchService = {
    
    // Método simplificado que usa automáticamente nuestra URL base
    useDefaultUrl: ({ url, method, headers = {}, body, useToken, returnJson = true, showError = true, timeout = 1000 * 5 }) => {
        // Simplemente llama al método fetch() pero agregando la URL base automáticamente
        return fetchService.fetch({
            url: `${ServiceURL.persona}/${url}`, // Combina la URL base con la ruta específica
            method, 
            headers, 
            body, 
            useToken, 
            returnJson, 
            timeout,
            showError
        });
    },

    // Método principal que hace las peticiones Fetch
    fetch: ({ url, method, headers = {}, body, useToken, returnJson = true, showError = true, timeout = 1000 * 20 }) => {
        
        // Creamos un controlador para poder cancelar la petición si es necesario
        const controller = new AbortController();
        
        // Configuramos un temporizador que cancela la petición si tarda mucho
        const timeoutId = setTimeout(() => {
            controller.abort(); // Cancela la petición
            console.warn(`Fetch [${url}] timeout.`); // Avisa que se canceló por timeout
        }, timeout);
        
        // Hacemos la petición Fetch
        return fetch(url, {
            signal: controller.signal, // Para poder cancelar la petición
            method: method,            // GET, POST, PUT, etc.
            headers: {
                "Content-Type": "application/json", 
                ...headers, 
                
                // Si useToken es true, agregamos el token de autorización
                ...(useToken && {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }),
            },
            // Si tenemos datos para enviar, los convertimos a JSON; si no, enviamos undefined
            body: body ? JSON.stringify(body) : undefined,
        })
        .then(async (response) => {
            // Si la respuesta no es exitosa (status 200-299), lanzamos un error
            if (!response.ok) {
                let errorData = undefined;
                let isJson = false;
                const responseClone = response.clone();
                try {
                    errorData = await response.json();
                    isJson = true;
                } catch(e) {
                    errorData = await responseClone.text();
                }


                 // Obtenemos el mensaje de error
                throw new FetchError(
                    `Fetch [${url}] error: ${response.status} ${response.statusText}`, 
                    isJson, 
                    response.status, 
                    errorData
                );
            }
            
            // Si returnJson es true, convertimos la respuesta a JSON; si no, devolvemos la respuesta tal como está
            return returnJson ? response.json() : response;
        })
        .catch((error) => {
            if(showError)console.error(`Fetch [${url}] error:`, error);
            
            if(error instanceof FetchError) {
                // Si ya es un FetchError, lo volvemos a lanzar
                throw error;
            }

            throw new FetchError(
                `Fetch [${url}] error: ${error.message}`, 
                false, 
                error.statusCode || 500, 
                error.data || null
            ); 
        })
        .finally(() => {
            // Limpia el temporizador, sin importar si la petición fue exitosa o no
            clearTimeout(timeoutId);
        });
    },
};