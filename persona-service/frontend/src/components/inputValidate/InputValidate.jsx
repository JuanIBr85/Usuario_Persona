import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'
import { EyeOff, Eye, EyeClosed } from 'lucide-react'
/**
 * Componente de input con validación personalizada y funcionalidad para mostrar/ocultar contraseñas.
 *
 * @param {string} id - Identificador único del input, también se utiliza como nombre (`name`) del campo.
 * @param {string} type - Tipo del input, por ejemplo: "text", "email", "password", etc.
 * @param {string} placeholder - Texto que se muestra como marcador de posición dentro del input.
 * @param {string} labelText - Texto de la etiqueta que se muestra encima del input.
 * @param {string} validatePattern - Expresión regular usada para validar el contenido del input.
 * @param {string} validationMessage - Mensaje que se mostrará debajo del input si la validación falla.
 * @param {Object} props - Props adicionales que serán pasadas al componente <Input>.
 * @param {string} containerClassName - Clases adicionales para el contenedor del input.
 */
export default function InputValidate({ id, type, placeholder, labelText, validatePattern, validationMessage, value = "", containerClassName, onChange, required, iconInput, cleanRegex = /[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s\-_.,'()]/g, cleanEmailRegex = /[^a-zA-Z0-9@._-]/g, cleanTelRegex = /[^0-9\s\-\(\)\+]/g, cleanUrlRegex = /[^a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]/g, isCleanValue = true, ...props }) {
    //Este estado sirve para indicar si hubo un error en la validacion del input
    const [error, setError] = React.useState(false)
    //Este estado sirve para indicar si debe o no ocultar la contraseña
    const [showPassword, setShowPassword] = React.useState(false);

    const [internalValue, setInternalValue] = React.useState(value || '')

    const [isInit, setIsInit] = React.useState(false);

    const handleBlur = (event) => {
        const input = event.target

        let value = input.value?.trim();

        if (isCleanValue) {
            switch (type) {
                case "email":
                    value = value?.replace(cleanEmailRegex, '');
                    break;
                case "tel":
                    value = value?.replace(cleanTelRegex, '');
                    break;
                case "url":
                    value = value?.replace(cleanUrlRegex, '');
                    break;
                default:
                    value = value?.replace(cleanRegex, '');
                    break;
            }
        }
        input.value = value;
        setInternalValue(value);
        if (input.checkValidity()) {
            setError(false)
        }
    }

    useEffect(() => {
        setInternalValue(value)
        setIsInit(value !== undefined);
    }, [value]);

    //Este evento se llama cuando el input es invalido
    const handleInvalid = (event) => {
        //event.preventDefault()
        setError(true)
    }

    const handleOnChange = (event) => {
        if (!isInit) return;
        const input = event.target
        setInternalValue(input.value)

        //Si el patron del input es diferente al del validatePattern
        //Tambien si el type difiere de la que se le dio al input al principio exceptuando  si es en el caso q se cambie password a text
        if (validatePattern && (input.pattern !== validatePattern) 
            || (input.type !== type && !(type === "password" && input.type === "text"))
            || (required && (input.required !== required))
        ) {
            //Forzamos el patron de nuevo, en caso de que no se pueda recargar la pagina
            input.pattern = validatePattern;
            input.type = type;
            setInternalValue("");
            input.value = "";
            alert(`No, eso no funcionara, Atras espiritu del mal`)
            //Recargamos la pagina para que se aplique el nuevo patron
            window.location.reload();
        }

        //Esto solo quita el error si el input es invalido
        if (input.checkValidity()) {
            setError(false)
        }

        if (onChange) {
            onChange(event)
        }
    }

    return (
        <div className={`grid w-full items-center gap-1.5 ${containerClassName}`}>
            <Label htmlFor={id}>{labelText}{required && <span className="text-destructive">*</span>}</Label>
            <div className="relative">
                <Input
                    onInvalid={handleInvalid}
                    onChange={handleOnChange}
                    type={(showPassword) ? "text" : type}
                    id={id}
                    name={id}
                    placeholder={placeholder}
                    pattern={validatePattern}
                    data-validation-message={validationMessage}
                    value={internalValue}
                    onBlur={handleBlur}

                    required={required}
                    {...props} />
                {//Si el input es de tipo contraseña mostrara un boton para ver/ocultar la contraseña
                    type === "password" ? <a className="absolute right-2 top-1.5 text-gray-500 hover:text-gray-700 cursor-pointer select-none" onClick={() => setShowPassword(v => !v)}>{showPassword ? <Eye /> : <EyeClosed />}</a> : iconInput && <div className='absolute right-2 top-1.5'>{iconInput}</div>
                }
            </div>

            {//Si ocurre un error en la validacion del input mostrara el error debajo del input
                error ? <p className="text-destructive text-xs ml-2">{validationMessage}</p> : undefined
            }

        </div>
    );
}