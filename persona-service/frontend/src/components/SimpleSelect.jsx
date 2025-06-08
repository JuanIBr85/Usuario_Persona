
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
} from "@/components/ui/select"


function SimpleSelect({
    name,
    label,
    value,
    onChange,
    id,
    required,
    placeholder,
    children,
    ...props
}) {
    return (
        <div className="grid w-full items-center gap-1.5 ">
            <Label htmlFor={name}>{label}</Label>
            <div className="relative">
                <Select id={id} name={name} value={value} onChange={onChange} required={required} {...props}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {children}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export default SimpleSelect;
