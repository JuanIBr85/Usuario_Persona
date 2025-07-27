import React from "react";
import { Fade } from "react-awesome-reveal";
import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight } from 'lucide-react';
import ResponsiveColumnForm from "@/components/ResponsiveColumnForm";
import { isAdmin } from "@/context/AuthContext";

/**
 * Preguntas Frecuentes para PRISMA
 *
 * Este componente muestra las preguntas y respuestas clave sobre el sistema PRISMA,
 * cubriendo desde la creación de cuentas, inicio de sesión, gestión de personas y administración, hasta recuperación de contraseña y monitoreo de servicios.
 */

const { VITE_MANUAL_USUARIO, VITE_MANUAL_ADMINISTRADOR } = import.meta.env;

const faqs = [
  {
    question: "¿Qué es P.R.I.S.M.A?",
    answer:
      "P.R.I.S.M.A es una plataforma que centraliza y simplifica la interacción de los ciudadanos con servicios municipales, educativos y administrativos. Permite gestionar tu identidad, acceder a trámites y servicios, y recibir notificaciones desde un solo lugar."
  },
  {
    question: "¿Cómo creo una cuenta en P.R.I.S.M.A?",
    answer:
      "Debes acceder al sitio oficial, hacer clic en '¿No tienes una cuenta? Regístrate', completar el formulario con tu email, nombre de usuario y contraseña segura. Luego, recibirás un código por correo electrónico para verificar tu cuenta e ingresarlo en la plataforma."
  },
  {
    question: "¿Cómo debe ser mi contraseña?",
    answer:
      "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un símbolo."
  },
  {
    question: "¿Qué hago si no recibo el código de verificación?",
    answer:
      "Utiliza la opción '¿No te llegó el código? Reenviar'. Se enviará un nuevo código a tu correo electrónico registrado."
  },
  {
    question: "¿Cómo inicio sesión?",
    answer:
      "Ingresa tu correo electrónico y contraseña en la página principal. Si accedes desde un dispositivo nuevo, se te solicitará una verificación adicional (2FA) a través de tu correo."
  },
  {
    question: "Olvidé mi contraseña, ¿cómo la recupero?",
    answer:
      "Haz clic en '¿Olvidaste tu contraseña?'. Ingresa tu correo electrónico y sigue los pasos para recibir un código de verificación. Luego, ingresa el código y crea una nueva contraseña segura."
  },
  {
    question: "¿Qué sucede la primera vez que inicio sesión?",
    answer:
      "Se te pedirá que ingreses tu tipo y número de documento para vincular tu usuario con tu perfil personal. Si tus datos ya existen y el email coincide, la vinculación es automática. Si el email no coincide o no lo reconoces, deberás completar datos personales para que un administrador valide tu identidad."
  },
  {
    question: "¿Qué tipo de datos debo cargar en mi perfil?",
    answer:
      "Debes ingresar nombre, apellido, fecha de nacimiento, teléfono y email de contacto, además de domicilio (calle, número, código postal) y, si lo deseas, datos adicionales."
  },
  {
    question: "¿Qué puedo hacer desde el panel de administración?",
    answer:
      "Puedes gestionar personas (ver, editar, eliminar, crear nuevas), administrar roles y permisos de usuarios, visualizar registros y estadísticas, y controlar los servicios activos en la plataforma."
  },
  {
    question: "¿Cómo gestiono roles y permisos?",
    answer:
      "Puedes crear nuevos roles, asignarles permisos específicos y luego asignar uno o varios roles a los usuarios registrados. Así controlas quién puede acceder a cada funcionalidad."
  },
  {
    question: "¿Qué es la gestión de servicios y monitoreo en P.R.I.S.M.A?",
    answer:
      "Permite controlar e instalar microservicios, monitorear sus endpoints, ver el estado de cada servicio, analizar disponibilidad y errores, y gestionar acciones de mantenimiento."
  },
  {
    question: "¿Qué hago si un servicio muestra estado de error o no está disponible?",
    answer:
      "Verifica la URL configurada del microservicio, asegúrate de que esté en línea y revisa los detalles del error en la herramienta de monitoreo. Si el problema persiste, contacta con el área técnica para soporte."
  },
  {
    question: "¿Dónde puedo consultar mis registros o actividad?",
    answer:
      "En la sección 'Registros', puedes visualizar estadísticas mensuales y diarias sobre personas registradas y actividad general, facilitando la auditoría y seguimiento."
  },
  {
    question: "¿A dónde acudir si tengo problemas o dudas?",
    answer:
      "Contacta al área de soporte o administración mediante los canales oficiales que figuran en la plataforma."
  }
];

function Faq() {
  return (
    <Fade duration={500} triggerOnce>
      <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
        <h1 className="text-3xl font-bold mb-8 text-center">Preguntas Frecuentes (FAQ)</h1>
        <ResponsiveColumnForm className={isAdmin() ? "m-4" : "m-4 flex flex-col items-center"}>
          <Button className="px-6 py-3 text-lg md:px-8 md:py-4 md:text-xl" asChild><a
            href={`/${VITE_MANUAL_USUARIO}`} target="_blank"
            rel="noopener noreferrer"
            download={VITE_MANUAL_USUARIO}> Descargar manual de usuario<SquareArrowOutUpRight /></a>
          </Button>
          {isAdmin() && (
            <Button className="px-6 py-3 text-lg md:px-8 md:py-4 md:text-xl" asChild><a
            href={`/${VITE_MANUAL_ADMINISTRADOR}`} target="_blank"
            rel="noopener noreferrer"
            download={VITE_MANUAL_ADMINISTRADOR}> Descargar manual de Administrador<SquareArrowOutUpRight /></a>
          </Button>
          )}
        </ResponsiveColumnForm>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx}>
              <h2 className="text-xl font-semibold mb-2">{faq.question}</h2>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </Fade>
  );
}

export default Faq;