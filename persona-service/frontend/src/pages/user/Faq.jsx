import React from "react";
import { Fade } from "react-awesome-reveal";

/**
 * Preguntas Frecuentes para PRISMA
 *
 * Este componente muestra las preguntas y respuestas clave sobre el sistema PRISMA,
 * cubriendo gestión de personas, usuarios, roles, registros, servicios y monitoreo.
 */

const faqs = [
  {
    question: "¿Qué es PRISMA?",
    answer:
      "PRISMA es un sistema centralizado para la gestión de personas, usuarios, permisos y servicios, pensado para organizaciones (Como el municipio de Coronel Suárez) que requieren control granular, trazabilidad y administración de su información."
  },
  {
    question: "¿Cómo se registran personas y usuarios en PRISMA?",
    answer:
      "Las personas pueden ser registradas manualmente desde el panel de administración o importadas desde otros servicios. Los usuarios se registran mediante el módulo de autenticación, y luego pueden ser vinculados a una persona existente, ya sea automáticamente o de forma manual."
  },
  {
    question: "¿Cómo funciona la vinculación automática de personas a usuarios?",
    answer:
      "Cuando se registra un usuario, PRISMA busca coincidencias de email entre los usuarios y las personas ya registradas. Si encuentra coincidencia, la vinculación se realiza automáticamente. Si no hay coincidencia, la asignación puede hacerse manualmente desde el panel."
  },
  {
    question: "¿Qué puedo gestionar desde el Panel de Administración?",
    answer:
      "Desde el Panel de Administración puedes gestionar personas (creación, edición, eliminación y vinculación a usuarios), administrar roles y permisos, consultar registros (logs) del sistema y controlar servicios activos."
  },
  {
    question: "¿Cómo puedo consultar los registros del sistema?",
    answer:
      "En la sección 'Registros' puedes visualizar estadísticas mensuales, diarias y acumuladas sobre las personas registradas, así como detalles sobre personas activas, inactivas, vinculadas y no vinculadas a usuarios. Esto facilita la auditoría y el seguimiento de la información cargada en PRISMA."
  },
  {
    question: "¿Qué funcionalidades avanzadas tiene la gestión de personas?",
    answer:
      "Además de crear y editar personas, puedes filtrarlas por nombre, apellido, documento o estado, editar datos desde un modal, ver detalles completos y eliminar registros. También puedes identificar rápidamente personas sin usuario asociado o inactivas."
  },
  {
    question: "¿Cómo se gestionan los roles y permisos?",
    answer:
      "En la sección 'Roles' puedes crear nuevos roles, asignarles permisos específicos y asignar roles a usuarios. Esto permite un control preciso sobre quién puede acceder a cada funcionalidad dentro de PRISMA."
  },
  {
    question: "¿Qué es la Gestión de Servicios en PRISMA?",
    answer:
      "La gestión de servicios permite controlar y administrar los microservicios activos, instalar nuevos servicios ingresando su URL, y desactivar servicios cuando sea necesario. También puedes acceder al monitoreo de endpoints para ver el estado de cada servicio."
  },
  {
    question: "¿Cómo funciona el monitoreo de servicios y endpoints?",
    answer:
      "PRISMA detecta y muestra los servicios registrados, la cantidad de endpoints encontrados, su estado, fecha de inicio, errores y disponibilidad. Esto permite a los administradores identificar rápidamente problemas o caídas y tomar acciones correctivas."
  },
  {
    question: "¿Qué hago si un servicio muestra estado de error o no está disponible?",
    answer:
      "Verifica la URL configurada del microservicio, asegúrate de que el servicio esté en línea y funcionando, y revisa los detalles del error en la herramienta de monitoreo. Si el problema persiste, contacta con el área técnica para soporte."
  }
];

function Faq() {
  return (
    <Fade duration={500} triggerOnce>
      <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
        <h1 className="text-3xl font-bold mb-8 text-center">Preguntas Frecuentes (FAQ)</h1>
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