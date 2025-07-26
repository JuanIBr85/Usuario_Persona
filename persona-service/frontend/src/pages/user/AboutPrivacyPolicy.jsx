import React from 'react';
import { Fade } from "react-awesome-reveal";

function AboutPrivacyPolicy() {
    return (
        <Fade duration={500} triggerOnce>
            <div className="max-w-4xl mx-auto p-6 text-gray-800">
                <h1 className="text-3xl font-bold mb-6 text-center">Política de Privacidad</h1>

                <section className="mb-6">
                    <p>
                        Esta Política de Privacidad establece los términos en que el municipio de Coronel Suárez recopila, usa y protege la información proporcionada por los usuarios de la aplicación web del área de educación. Nos comprometemos con la seguridad de los datos de nuestros usuarios.
                        Al solicitar información personal con la cual usted pueda ser identificado, lo hacemos asegurando que se empleará de acuerdo con los términos de este documento. Esta Política puede cambiar con el tiempo, por lo que recomendamos revisarla periódicamente.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Datos Personales Recopilados</h2>
                    <p>
                        Al utilizar esta aplicación, se recopilarán los siguientes datos personales: nombre completo, Documento Nacional de Identidad (DNI), email, teléfono, domicilio y localidad.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Finalidad del Tratamiento de Datos</h2>
                    <ul className="list-disc list-inside ml-4 mb-4">
                        <li>Verificar la identidad de los usuarios para acceder a los servicios de la aplicación.</li>
                        <li>Generar informes y estadísticas para la gestión y mejora de los servicios educativos municipales.</li>
                        <li>Enviar notificaciones y comunicaciones relacionadas con los servicios ofrecidos por la aplicación.</li>
                        <li>Garantizar la seguridad y el correcto funcionamiento de la aplicación.</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Consentimiento del Usuario</h2>
                    <p>
                        Al registrarse y utilizar esta aplicación, usted otorga su consentimiento libre, expreso e informado para la recopilación y tratamiento de sus datos personales con las finalidades indicadas. Usted tiene derecho a revocar este consentimiento en cualquier momento, siguiendo los procedimientos establecidos para el ejercicio de sus derechos.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Derechos de los Usuarios</h2>
                    <p>
                        Usted tiene derecho a acceder, rectificar, actualizar y suprimir sus datos personales, de conformidad con los Artículos 14, 15 y 16 de la Ley N° 25.326. Para ejercer estos derechos, debe comunicarse con el área de educación del municipio de Coronel Suárez por los canales indicados en el apartado de contacto. Su solicitud será atendida en los plazos legales.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Seguridad de los Datos</h2>
                    <p>
                        El municipio de Coronel Suárez adoptará las medidas de seguridad necesarias para proteger sus datos personales contra la pérdida, acceso o tratamiento no autorizado, de acuerdo con el Artículo 9 de la Ley N° 25.326. Se implementarán medidas técnicas y organizativas para garantizar la confidencialidad e integridad de sus datos.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Transferencia y Conservación de Datos</h2>
                    <p>
                        Sus datos personales no serán transferidos a terceros sin su consentimiento, excepto en los casos en que la ley lo permita o exija. Los datos personales serán conservados durante el tiempo necesario para cumplir con las finalidades para las que fueron recopilados, o por obligaciones legales. Una vez cumplida la finalidad y expirados los plazos legales, los datos serán eliminados de forma segura.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Control de su Información Personal</h2>
                    <p>
                        Usted puede restringir la recopilación o el uso de su información personal en cualquier momento. Si ha aceptado recibir comunicaciones, puede cancelarlas posteriormente. No venderemos, cederemos ni distribuiremos su información sin su consentimiento, salvo requerimiento legal.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Contacto</h2>
                    <p>
                        Para cualquier consulta o inquietud relacionada con esta política o con el tratamiento de sus datos personales, puede comunicarse con el área de educación del municipio de Coronel Suárez a través de [mail o teléfono de contacto].
                    </p>
                </section>

                <footer className="text-sm text-gray-500 mt-10">
                    <p>
                        Esta Política de Privacidad se rige por las leyes de la República Argentina (Ley N° 25.326).
                    </p>
                </footer>
            </div>
        </Fade>
    );
}

export default AboutPrivacyPolicy;
