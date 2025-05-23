import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


export default function InputValidate({ id, type, placeholder, labelText, validatePattern, validateMessage, ...props }) {
    const [error, setError] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)

    const handleInvalid = (event) => {
        //event.preventDefault()
        setError(true)
    }

    const handleOnChange = (event) => {
        const input = event.target

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
                {
                    type === "password" ? <a className="absolute right-2 top-1.5 text-gray-500 hover:text-gray-700 cursor-pointer select-none" onClick={() => setShowPassword(v => !v)}>@</a> : undefined
                }
            </div>
            {error ? <p className="text-destructive text-xs ml-2">{validateMessage}</p> : undefined}

        </div>
    );
}