import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Componente de input con validación personalizada y funcionalidad para mostrar/ocultar contraseñas.
 *
 * @param {string} id - Identificador único del input, también se utiliza como nombre (`name`) del campo.
 * @param {string} type - Tipo del input, por ejemplo: "text", "email", "password", etc.
 * @param {string} placeholder - Texto que se muestra como marcador de posición dentro del input.
 * @param {string} labelText - Texto de la etiqueta que se muestra encima del input.
 * @param {string} validatePattern - Expresión regular usada para validar el contenido del input.
 * @param {string} validateMessage - Mensaje que se mostrará debajo del input si la validación falla.
 * @param {Object} props - Props adicionales que serán pasadas al componente <Input>.
 */
export default function InputValidate({ id, type, placeholder, labelText, validatePattern, validateMessage, ...props }) {
    //Este estado sirve para indicar si hubo un error en la validacion del input
    const [error, setError] = React.useState(false)
    //Este estado sirve para indicar si debe o no ocultar la contraseña
    const [showPassword, setShowPassword] = React.useState(false)

    //Este evento se llama cuando el input es invalido
    const handleInvalid = (event) => {
        //event.preventDefault()
        setError(true)
    }

    const handleOnChange = (event) => {
        const input = event.target

        //Esto solo quita el error si el input es invalido
        if (input.checkValidity()) {
            setError(false)
        }
    }

    return (
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor={id}>{labelText}</Label>
            <div className="relative">
                <Input
                    onInvalid={handleInvalid}
                    onChange={handleOnChange}
                    type={(showPassword) ? "text" : type}
                    id={id}
                    name={id}
                    placeholder={placeholder}
                    pattern={validatePattern}
                    {...props} />
                {//Si el input es de tipo contraseña mostrara un boton para ver/ocultar la contraseña
                    type === "password" ? <a className="absolute right-2 top-1.5 text-gray-500 hover:text-gray-700 cursor-pointer select-none" onClick={() => setShowPassword(v => !v)}>@</a> : undefined
                }
            </div>
            
            {//Si ocurre un error en la validacion del input mostrara el error debajo del input
                error ? <p className="text-destructive text-xs ml-2">{validateMessage}</p> : undefined
            }

        </div>
    );
}