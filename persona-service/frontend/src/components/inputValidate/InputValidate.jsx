import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


export default function InputValidate({ id, type, placeholder, labelText, validatePattern, validateMessage, ...props }) {
    const [error, setError] = React.useState(false)

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
            <Input
                onInvalid={handleInvalid}
                onChange={handleOnChange}
                type={type}
                id={id}
                name={id}
                placeholder={placeholder}
                pattern={validatePattern}
                {...props} />
            {error ? <p className="text-destructive text-sm ml-2">{validateMessage}</p> : undefined}

        </div>
    );
}