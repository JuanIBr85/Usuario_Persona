import React from 'react';
import { Fade } from "react-awesome-reveal";

function TermsAndConditions() {
    return (
        <Fade duration={500} triggerOnce>
            <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Términos y Condiciones de Uso
                </h1>

                <section className="mb-6">
                    <p className="mb-4">
                        Los siguientes términos y condiciones rigen el uso de la aplicación web desarrollada para el área de educación del municipio de Coronel Suárez. Al acceder y utilizar esta aplicación, usted acepta estos términos y condiciones en su totalidad.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Propiedad Intelectual</h2>
                    <p className="mb-4">
                        Todos los contenidos de esta aplicación (textos, imágenes, logotipos, etc.) son propiedad del municipio de Coronel Suárez o de terceros que han autorizado su uso. Queda prohibida su reproducción total o parcial sin autorización expresa.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Responsabilidad del Usuario</h2>
                    <p className="mb-4">
                        El usuario se compromete a utilizar la aplicación de forma responsable y de acuerdo con la ley y los presentes términos y condiciones. Está prohibido realizar actividades que puedan dañar la aplicación, interferir con su funcionamiento o vulnerar los derechos de otros usuarios. El usuario es responsable de la exactitud de los datos que proporciona.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Exclusión de Responsabilidad</h2>
                    <p className="mb-4">
                        El municipio de Coronel Suárez no se hace responsable por los daños o perjuicios que puedan derivarse del uso incorrecto o indebido de la aplicación, de interrupciones en el servicio o de la presencia de virus u otros elementos dañinos.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Modificaciones</h2>
                    <p className="mb-4">
                        El municipio de Coronel Suárez se reserva el derecho de modificar los presentes términos y condiciones en cualquier momento, publicando las modificaciones en la aplicación. El uso continuado de la aplicación después de la publicación de las modificaciones implicará la aceptación de las mismas.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Contacto</h2>
                    <p className="mb-4">
                        Para cualquier consulta o inquietud relacionada con los presentes términos y condiciones, puede comunicarse con el área de educación del municipio de Coronel Suárez a través de [mail o teléfono de contacto].
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Ley Aplicable</h2>
                    <p className="mb-4">
                        Los presentes términos y condiciones se rigen por las leyes de la República Argentina (Ley N° 25.326 Ley de Protección de Datos Personales).
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Aceptación de los Términos</h2>
                    <p className="mb-4">
                        Al acceder y utilizar esta aplicación, usted manifiesta haber leído, comprendido y aceptado los presentes términos y condiciones en su totalidad.
                    </p>
                </section>
            </div>
        </Fade>
    );
}

export default TermsAndConditions;
