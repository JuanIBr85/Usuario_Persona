import React from 'react';

const Resumen = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Resumen de tu perfil</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-medium">Datos Personales</h4>
        <p>Nombre: [Nombre]</p>
        <p>Apellido: [Apellido]</p>
        <p>Documento: [Tipo] [Número]</p>
        <p>Fecha de Nacimiento: [Fecha]</p>
      </div>
      <div>
        <h4 className="font-medium">Contacto</h4>
        <p>Email: [email]</p>
        <p>Teléfono: [teléfono]</p>
        <p>Celular: [celular]</p>
      </div>
      <div>
        <h4 className="font-medium">Domicilio</h4>
        <p>[Calle] [Número]</p>
        <p>[Localidad], [Provincia]</p>
        <p>Código Postal: [Código Postal]</p>
      </div>
    </div>
  </div>
);

export default Resumen;
