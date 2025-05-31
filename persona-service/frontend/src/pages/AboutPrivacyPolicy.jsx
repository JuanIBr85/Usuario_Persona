import React from 'react';
import { Fade } from "react-awesome-reveal";

function AboutPrivacyPolicy() {
    return (
        <Fade duration={500} triggerOnce>

            <div className="max-w-4xl mx-auto p-6 text-gray-800">
                <h1 className="text-3xl font-bold mb-6 text-center">Política de Privacidad (PLACEHOLDER)</h1>

                <section className="mb-6">
                    <p>
                        La presente Política de Privacidad establece los términos en que usamos y protegemos la información proporcionada por los usuarios al utilizar nuestro sitio web. Nos comprometemos con la seguridad de los datos de nuestros usuarios.
                        Al solicitar información personal con la cual usted pueda ser identificado, lo hacemos asegurando que se empleará de acuerdo con los términos de este documento. Esta Política puede cambiar con el tiempo, por lo que recomendamos revisarla periódicamente.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Información que es recogida</h2>
                    <p>
                        Podemos recopilar información personal como nombre, correo electrónico, e información demográfica. También podríamos requerir información específica para procesar pedidos o realizar entregas y facturación.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Uso de la información recogida</h2>
                    <p>
                        Utilizamos la información para brindar el mejor servicio posible, mantener un registro de usuarios y pedidos, y mejorar nuestros productos y servicios. Podemos enviar correos electrónicos periódicos con ofertas especiales, nuevos productos u otra información relevante. Usted puede cancelar la suscripción en cualquier momento.
                    </p>
                    <p className="mt-2">
                        Estamos comprometidos con mantener su información segura, usando sistemas actualizados y avanzados para evitar accesos no autorizados.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Cookies</h2>
                    <p>
                        Utilizamos cookies para analizar el tráfico web y mejorar la experiencia del usuario. Puede aceptar o rechazar cookies desde la configuración de su navegador. Rechazar cookies puede limitar el uso de algunos servicios del sitio.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Enlaces a Terceros</h2>
                    <p>
                        Nuestro sitio puede contener enlaces a otros sitios de interés. No tenemos control sobre dichos sitios, por lo tanto no somos responsables de sus políticas de privacidad. Le recomendamos consultarlas directamente.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Control de su información personal</h2>
                    <p>
                        Usted puede restringir la recopilación o el uso de su información personal en cualquier momento. Si ha aceptado recibir correos, puede cancelarlos posteriormente. No venderemos, cederemos ni distribuiremos su información sin su consentimiento, salvo requerimiento legal.
                    </p>
                    <p className="mt-2">
                        Nos reservamos el derecho de cambiar los términos de esta Política de Privacidad en cualquier momento.
                    </p>
                </section>

                <footer className="text-sm text-gray-500 mt-10">
                    <p>Esta política de privacidad fue generada en <a href="https://politicadeprivacidadplantilla.com" className="underline text-blue-600">politicadeprivacidadplantilla.com</a>.</p>
                </footer>
            </div>
        </Fade>
    );
}

export default AboutPrivacyPolicy;
