import { Button } from "@/components/ui/button"

export default function FormServicios({ subscribedServices }) {
    return (
        <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Servicios Suscritos</h2>
            <ul className="space-y-2">
                {subscribedServices.map((service) => (
                    <li
                        key={service}
                        className="flex items-center justify-between bg-gray-100 dark:bg-[var(--muted)]  rounded-lg px-4 py-2"
                    >
                        <span className="text-gray-700 dark:text-gray-100">{service}</span>
                        <Button variant="link" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 p-0 h-auto">
                            Ver detalles
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}