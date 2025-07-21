import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'
import { EyeOff, Eye, EyeClosed } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext';

// Calcular fecha máxima para mayores de 17 años
const seventeenYearsAgo = new Date();
seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
const maxDate = seventeenYearsAgo.toISOString().slice(0, 10);
const minDate = "1905-01-01"

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
export default function InputValidate({ id, type, placeholder, labelText, validatePattern, validationMessage, value = "", containerClassName, onChange, required = false, iconInput, cleanRegex = /[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s\-_.,'()]/g, cleanEmailRegex = /[^a-zA-Z0-9@._-]/g, cleanTelRegex = /[^0-9\s\-\(\)\+]/g, cleanUrlRegex = /[^a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]/g, isCleanValue = true, maxLength = 50, min, max, name, ...props }) {
    //Este estado sirve para indicar si hubo un error en la validacion del input
    const [error, setError] = React.useState(false)
    //Este estado sirve para indicar si debe o no ocultar la contraseña
    const [showPassword, setShowPassword] = React.useState(false);
    const inputRef = React.useRef(null)

    const [validateTimeout, setValidateTimeout] = React.useState(null);

    const [internalMin, setInternalMin] = React.useState(min || (type === "date" ? minDate : min));
    const [internalMax, setInternalMax] = React.useState(max || (type === "date" ? maxDate : max));
    const [internalPattern, setInternalPattern] = React.useState(validatePattern || (type === "email" ? "^[^\\s@]+@[^\\s@]+\\.[a-zA-Z]{2,}$" : validatePattern));
    const [internalValue, setInternalValue] = React.useState(value || '');

    const [isInit, setIsInit] = React.useState(false);

    const { removeAuthData } = useAuthContext();

    useEffect(() => {
        if (name) {
            alert(`InputValidate: ${name} - la propiedad name no es valida, use id en su lugar`);
        }
    }, [name])

    useEffect(() => {
        setInternalMin(min || (type === "date" ? minDate : undefined));
        setInternalMax(max || (type === "date" ? maxDate : undefined));
    }, [min, max]);

    useEffect(() => {
        if (!validatePattern) return;
        setInternalPattern(validatePattern);
        if (inputRef.current) inputRef.current.pattern = validatePattern;
        if (isInit) handleBlur({ target: inputRef.current });
    }, [validatePattern]);

    function cleanValue(input) {
        let value = input.value?.trim();

        if (isCleanValue) {
            switch (type) {
                case "email":
                    value = value?.replace(cleanEmailRegex, '');
                    break;
                case "tel":
                    value = value?.replace(cleanTelRegex, '');

                    if (value.startsWith("0")) {
                        value = value.replace("0", "");
                    }
                    if (value.length === 12 && value.substring(4, 6) === "15") {
                        value = value.substring(0, 4) + value.substring(6);
                    }

                    if (value.length === 10 && !value.startsWith("+549")) {
                        value = `+549${value}`;
                    }
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
    }

    function validateValue(input) {
        /*switch (type) {
            case "email":
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                //obtengo el ultimo elemento del email
                const domain = value.split(".").pop();
                if (domain.length < 2 || !emailPattern.test(value)) {
                    setError(true);
                    return;
                }
                break;
        }*/

        if (input.checkValidity()) {
            setError(false)
        }
    }

    const handleBlur = (event) => {
        const input = event.target;
        if (!input) return;

        cleanValue(input);

        validateValue(input);
        if(onChange){
            onChange(event);
        }
    }

    useEffect(() => {
        if (!inputRef.current) return;
        const input = inputRef.current;
        const oldCheck = HTMLInputElement.prototype.checkValidity.bind(input);

        inputRef.current.checkValidity = () => {
            if (internalPattern) {
                input.pattern = internalPattern;
            }
            //Si el patron del input es diferente al del validatePattern
            if ((type && (input.type !== type && !(type === "password" && input.type === "text")))
                //Si el required difiere de la que se le dio al input al principio
                || (required && (input.required !== required))
                //Si el id o name difiere de la que se le dio al input al principio
                || (id && (input.id !== id || input.name !== id))
                //Si el maxlength difiere de la que se le dio al input al principio
                || (maxLength && (input.maxLength !== maxLength))
                //Si el min difiere de la que se le dio al input al principio
                || (min && (input.min !== internalMin))
                //Si el max difiere de la que se le dio al input al principio
                || (max && (input.max !== internalMax))
            ) {
                console.warn(`
                    El input ${input.id} ha sido alterado
                    ${input.type !== type && !(type === "password" && input.type === "text") ? `El tipo del input es ${input.type}` : ""}
                    ${required && (input.required !== required) ? `El required del input es ${input.required}` : ""}
                    ${id && (input.id !== id || input.name !== id) ? `El id del input es ${input.id}` : ""} - ${input.id} !== ${id} || ${input.name} !== ${id}
                    ${maxLength && (input.maxLength !== maxLength) ? `El maxlength del input es ${input.maxLength}` : ""}
                    ${min && (input.min !== internalMin) ? `El min del input es ${input.min}` : ""}
                    ${max && (input.max !== internalMax) ? `El max del input es ${input.max}` : ""}
                `)
                //Forzamos el patron de nuevo, en caso de que no se pueda recargar la pagina
                input.type = type;
                setInternalValue("");
                input.value = "";
                removeAuthData("Alteracion de formularios");
                alert(`No, eso no funcionara, Atras espiritu del mal`);
                //Recargamos la pagina para que se aplique el nuevo patron
                window.location.href = "/auth/login";
            }

            return oldCheck();
        }

    }, [inputRef, internalPattern]);

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

        if (validateTimeout) {
            clearTimeout(validateTimeout);
        }
        setValidateTimeout(setTimeout(() => {
            validateValue(input);
        }, 500));

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
                    pattern={internalPattern}
                    data-validation-message={validationMessage}
                    value={internalValue}
                    onBlur={handleBlur}
                    ref={inputRef}
                    maxLength={maxLength}
                    min={internalMin}
                    max={internalMax}
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