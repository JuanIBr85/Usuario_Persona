import React from "react";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-card px-4 pt-16 w-full mx-auto max-w-full px-lg:px-24  lg:px-8">
      <div className="grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Link
            to="/"
            aria-label="Ir a inicio"
            title="PRISMA"
            className="inline-flex items-center"
          >
            <svg fill="text-gray-800" className="w-1/12 " viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.485,16.857l10,6c.027.016.057.023.084.036s.057.026.087.038a.892.892,0,0,0,.688,0c.03-.012.058-.024.087-.038s.057-.02.084-.036l10-6a1,1,0,0,0,.3-1.438l-10-14c-.013-.018-.035-.024-.049-.04a.962.962,0,0,0-1.53,0c-.014.016-.036.022-.049.04l-10,14a1,1,0,0,0,.3,1.438ZM13,20.234V5.121L20.557,15.7ZM11,5.121V20.234L3.443,15.7Z" /></svg>
            <span className="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">
              PRISMA
            </span>
          </Link>
          <div className="mt-6 lg:max-w-sm">
            <p className="text-sm text-gray-800 ">
              Plataforma de Registro de Identidades, Servicios y Módulos Asociados
            </p>
            <p className="mt-4 text-sm text-gray-800">
              <a href="https://www.coronelsuarez.gob.ar">coronelsuarez.gob.ar</a>
            </p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-base font-bold tracking-wide text-gray-900 dark:text-gray-400">
            Contactos
          </p>
          <div className="flex">
            <p className="mr-1 text-gray-800 ">Teléfono:</p>
            <a
              href="tel:2926429200"
              aria-label="Nuestro teléfono"
              title="Nuestro teléfono"
              className="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800 mr-1"
            >
              +54 (2926) 429200
            </a>
            <a
              href="tel:2926429371"
              aria-label="Nuestro teléfono"
              title="Nuestro teléfono"
              className="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800 mr-1"
            >
              +54 (2926) 429371
            </a>
            <a
              href="tel:2926429372"
              aria-label="Nuestro teléfono"
              title="Nuestro teléfono"
              className="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800"
            >
              +54 (2926) 429372
            </a>
          </div>
          <div className="flex">
            <p className="mr-1 text-gray-800">Correo electrónico:</p>
            <a
              href="mailto:comunicaciones@coronelsuarez.gob.ar"
              aria-label="Nuestro correo"
              title="Nuestro correo"
              className="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800"
            >
              comunicaciones@coronelsuarez.gob.ar
            </a>
          </div>
          <div className="flex">
            <p className="mr-1 text-gray-800">Dirección:</p>
            <a
              href="https://www.openstreetmap.org/#map=20/-37.4445931/-61.9241133&layers=H"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nuestra dirección"
              title="Nuestra dirección"
              className="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800"
            >
              Av. Alsina 150 (7540) Coronel Suárez Buenos Aires - Argentina
            </a>
          </div>
        </div>
        <div>
          <span className="text-base font-bold tracking-wide text-gray-900 dark:text-gray-400">
            Redes sociales
          </span>
          <div className="flex items-center mt-1 space-x-3">
            <a
              href="https://www.instagram.com/suarezmunicipio/?hl=es"
              className="text-gray-500 transition-colors duration-300 hover:text-deep-purple-accent-400"
            >
              <svg viewBox="0 0 30 30" fill="currentColor" className="h-6">
                <circle cx="15" cy="15" r="4" />
                <path d="M19.999,3h-10C6.14,3,3,6.141,3,10.001v10C3,23.86,6.141,27,10.001,27h10C23.86,27,27,23.859,27,19.999v-10   C27,6.14,23.859,3,19.999,3z M15,21c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S18.309,21,15,21z M22,9c-0.552,0-1-0.448-1-1   c0-0.552,0.448-1,1-1s1,0.448,1,1C23,8.552,22.552,9,22,9z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/suarezmunicipio/?locale=es_LA"
              className="text-gray-500 transition-colors duration-300 hover:text-deep-purple-accent-400"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5">
                <path d="M22,0H2C0.895,0,0,0.895,0,2v20c0,1.105,0.895,2,2,2h11v-9h-3v-4h3V8.413c0-3.1,1.893-4.788,4.659-4.788 c1.325,0,2.463,0.099,2.795,0.143v3.24l-1.918,0.001c-1.504,0-1.795,0.715-1.795,1.763V11h4.44l-1,4h-3.44v9H22c1.105,0,2-0.895,2-2 V2C24,0.895,23.105,0,22,0z" />
              </svg>
            </a>
          </div>
          <Separator className="my-4" />
          <p className="mt-4 text-sm text-gray-500">
            Los contenidos de coronelsuarez.gob.ar están licenciados bajo  Creative Commons Reconocimiento 2.5 Argentina License      
          </p>
        </div>
      </div>
      <div className="flex flex-col-reverse justify-between pt-5 pb-10 border-t lg:flex-row">
        <ul className="flex flex-col mb-3 space-y-2 lg:mb-0 sm:space-y-0 sm:space-x-5 sm:flex-row">
          <li>
            <Link
              to="/faq"
              className="text-sm text-gray-600 transition-colors duration-300 hover:text-deep-purple-accent-400"
            >
              Preguntas frecuentes
            </Link>
          </li>
          <li>
            <Link
              to="/privacypolicy"
              className="text-sm text-gray-600 transition-colors duration-300 hover:text-deep-purple-accent-400"
            >
              Política de privacidad
            </Link>
          </li>
          <li>
            <Link
              to="/termsofservice"
              className="text-sm text-gray-600 transition-colors duration-300 hover:text-deep-purple-accent-400"
            >
              Términos y condiciones
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
