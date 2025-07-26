
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
} from "@/components/ui/select"
import { useState, useEffect } from "react"

function SimpleSelect({
    name,
    label,
    value,
    onValueChange,
    id,
    required,
    placeholder,
    className,
    children,
    ...props
}) {

    useEffect(() => {
        if (name) {
            alert(`SimpleSelect: ${name} - la propiedad name no es valida, use id en su lugar`);
        }
    }, [name])

    const [internalValue, setInternalValue] = useState(value);
    useEffect(() => {
        setInternalValue(value)
    }, [value]);

    return (
        <div className="grid w-full items-center gap-1.5 relative">
            <Label htmlFor={id}>{label}{required && <span className="text-destructive">*</span>}</Label>
            <div className="relative overflow-hidden w-full">
                <Select id={id} name={id} value={internalValue} className={className} onValueChange={(e) => {
                    setInternalValue(e);
                    onValueChange && onValueChange(e);
                }} required={required} {...props}>
                    <SelectTrigger className="w-full max-w-full">
                        <SelectValue placeholder={placeholder} className="truncate" />
                    </SelectTrigger>
                    <SelectContent
                        className="min-w-[var(--radix-select-trigger-width)] max-w-none z-50"
                        position="popper"
                        align="start">
                        {children}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export default SimpleSelect;
