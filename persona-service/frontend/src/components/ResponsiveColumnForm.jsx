import { cn } from "@/lib/utils";

// Componente que permite crear columnas responsivas para formularios
export default function ResponsiveColumnForm({ children, className }) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
            {children}
        </div>
    );
}