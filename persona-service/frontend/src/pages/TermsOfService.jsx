import React from 'react';
import { Fade } from "react-awesome-reveal";

function TermsAndConditions() {
    return (
        <Fade duration={500} triggerOnce>

            <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
                <h1 className="text-3xl font-bold mb-6 text-center">Términos y Condiciones de Uso (PLACEHOLDER)</h1>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Información Relevante</h2>
                    <p className="mb-4">
                        Es requisito necesario para la adquisición de los productos que se ofrecen en este sitio,
                        que lea y acepte los siguientes Términos y Condiciones. El uso de nuestros servicios así como
                        la compra de nuestros productos implicará que usted ha leído y aceptado estos términos.
                    </p>
                    <p className="mb-4">
                        Algunas ofertas podrían estar sujetas a sus propios Términos y Condiciones si son creadas o gestionadas
                        por terceros. En algunos casos, será necesario el registro del usuario con datos personales y una contraseña.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Cuenta del Usuario</h2>
                    <p className="mb-4">
                        El usuario puede cambiar su contraseña en cualquier momento. No nos hacemos responsables si se entrega esta
                        información a terceros.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Compras y Transacciones</h2>
                    <p className="mb-4">
                        Todas las compras realizadas en este sitio web están sujetas a procesos de verificación que pueden incluir
                        validación de stock, forma de pago, factura, y otros requisitos. Los precios solo aplican en compras hechas
                        en este sitio.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Licencia</h2>
                    <p className="mb-4">
                        Este sitio concede una licencia para que los usuarios utilicen los productos vendidos de acuerdo a estos términos.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Uso No Autorizado</h2>
                    <p className="mb-4">
                        No se permite redistribuir nuestros productos, modificados o no, en ningún medio sin autorización expresa.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Propiedad</h2>
                    <p className="mb-4">
                        Todos los productos son propiedad de los proveedores del contenido. No puede declarar propiedad intelectual
                        sobre ninguno de ellos.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Política de Reembolso y Garantía</h2>
                    <p className="mb-4">
                        No se realizan reembolsos para productos no tangibles. Algunas excepciones pueden aplicar si la descripción
                        del producto no corresponde. Las garantías solo cubren fallos de fábrica bajo condiciones normales de uso.
                    </p>
                    <ul className="list-disc list-inside ml-4 mb-4">
                        <li>Uso según especificaciones técnicas del producto.</li>
                        <li>Condiciones ambientales recomendadas por el fabricante.</li>
                        <li>Uso para la función prevista.</li>
                        <li>Condiciones eléctricas dentro de lo especificado.</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Comprobación Antifraude</h2>
                    <p className="mb-4">
                        Las compras pueden ser aplazadas o suspendidas temporalmente para comprobaciones de seguridad.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Privacidad</h2>
                    <p className="mb-4">
                        Nos comprometemos a proteger su información personal. Los datos ingresados no serán entregados a terceros,
                        salvo requerimiento judicial. La suscripción a boletines es voluntaria.
                    </p>
                </section>

                <p className="text-sm text-gray-500">
                    Este documento puede ser modificado sin previo aviso. <br />
                    Estos términos y condiciones se han generado en terminosycondicionesdeusoejemplo.com.
                </p>
            </div>
        </Fade>
    );
}

export default TermsAndConditions;
