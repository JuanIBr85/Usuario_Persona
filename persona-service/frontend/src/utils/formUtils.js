export const formSubmitJson = async (event)=>{
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    const form = event.target; // Obtener el formulario desde el evento
    return await formJson(form); // Devolver el objeto JSON resultante
}

export const formJson = async (form)=>{
    const formData = new FormData(form); // Crear un objeto FormData a partir del formulario

    // Convertir FormData a objeto JSON
    const jsonData = {};
    for (let [key, value] of formData.entries()) {
        // Manejar campos múltiples (checkboxes, selects múltiples)
        if (jsonData[key]) {
            // Si ya existe, convertir a array
            if (Array.isArray(jsonData[key])) {
                jsonData[key].push(value);
            } else {
                jsonData[key] = [jsonData[key], value];
            }
        } else {
            jsonData[key] = value;
        }
    }

    return jsonData; // Devolver el objeto JSON resultante
}