import { useEffect, useState } from 'react'

const profileColors = [
  '#1e3a8a', // Azul índigo oscuro
  '#7c2d12', // Naranja oscuro
  '#166534', // Verde esmeralda oscuro
  '#7c1d6f', // Magenta oscuro
  '#0f172a', // Gris carbón
  '#991b1b', // Rojo carmesí
  '#1e40af', // Azul cobalto
  '#9333ea', // Púrpura vibrante
  '#059669', // Verde azulado
  '#dc2626', // Rojo intenso
  '#2563eb', // Azul brillante
  '#16a34a', // Verde hierba
  '#ea580c', // Naranja quemado
  '#7c3aed', // Violeta profundo
  '#0369a1', // Azul océano
  '#be123c', // Rosa intenso
  '#15803d', // Verde bosque
  '#a21caf', // Fucsia oscuro
  '#1d4ed8', // Azul real
  '#b91c1c', // Rojo ladrillo
  '#065f46', // Verde pino
  '#86198f', // Púrpura magenta
  '#1e40af', // Azul marino
  '#dc2626', // Rojo cereza
  '#047857', // Verde jade
  '#6b21a8', // Púrpura real
  '#1e3a8a', // Azul medianoche
  '#92400e', // Café tostado
  '#134e4a', // Verde azulado oscuro
  '#581c87', // Púrpura imperial
  '#0c4a6e', // Azul petróleo
  '#a16207', // Dorado oscuro
  '#14532d', // Verde militar
  '#701a75', // Magenta real
  '#1e40af', // Azul zafiro
  '#dc2626', // Rojo rubí
  '#064e3b', // Verde musgo
  '#6b21a8', // Violeta intenso
  '#0369a1', // Azul acero
  '#b45309', // Ámbar oscuro
  '#115e59', // Verde turquesa
  '#7e22ce', // Púrpura amatista
  '#1e40af', // Azul profundo
  '#dc2626', // Rojo granate
  '#166534', // Verde selva
  '#86198f', // Rosa magenta
  '#1d4ed8', // Azul eléctrico
  '#b91c1c', // Rojo vino
  '#047857', // Verde aguamarina
  '#6b21a8'  // Púrpura bizantino
];
const ProfileNick = ({ firstName, lastName }) => {
  const [nick, setNick] = useState({
    name: '',
    color: ''
  });

  useEffect(() => {
    const _name = (firstName ? firstName[0].toUpperCase() : "?").charCodeAt(0);
    const _lastName = (lastName ? lastName[0]?.toUpperCase() : "?").charCodeAt(0);

    //Aleatoriedad, mucho mejor que mi implementacion, seguro!!!
    // rota bits de a 5 posiciones y XOR con b
    const rotated = ((_name << 5) | (_name >>> 3)) >>> 0;
    const seed = (rotated ^ _lastName) % profileColors.length;
    setNick({
      name: `${_name}${_lastName}`,
      color: profileColors[seed]
    });
  }, [firstName, lastName]);

  return (
    <div className="flex flex-col items-center mb-8 h-28 justify-center">
      <div className='select-none w-24 h-24 object-cover rounded-full shadow-lg flex items-center justify-center' style={{ backgroundColor: nick.color, boxShadow: '0px 0px 10px rgba(0,0,0,0.75)' }}>
        <span className='text-5xl font-bold text-white'>{nick.name}</span>
      </div>
    </div >
  );
};

export default ProfileNick;