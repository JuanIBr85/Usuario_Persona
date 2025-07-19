function esJSON(obj) {
    return typeof obj === 'object' && 
            obj !== null && 
           !Array.isArray(obj);
}

//Convierte un error de FetchUtil en un mensaje string
function useFetchMessage(error, error_mesage_default = "Fetch Error") {
    const description = error;
    try {
        if (esJSON(description)) {
            let descriptionAlert = [];
            for (let key in description) {
                if(esJSON(description[key])){
                    descriptionAlert.push(useFetchMessage(description[key]));
                }else{
                    descriptionAlert.push(<><b>{key}</b>: {description[key]}<br/></>);
                }
            }
            return descriptionAlert
        }else{
            return error
        }

    } catch (err) {

    }
    return error_mesage_default
}

export default useFetchMessage;