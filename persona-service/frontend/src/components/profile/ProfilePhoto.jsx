import React from 'react';
import { Camera } from "lucide-react";

/**
 * Componente para mostrar y actualizar la foto de perfil
 * @param {Object} props - Propiedades del componente
 * @param {string} props.photoUrl - URL de la foto de perfil actual
 * @param {Function} props.onPhotoChange - Función para manejar el cambio de foto
 * @returns {JSX.Element} Componente de foto de perfil
 */
const ProfilePhoto = ({ photoUrl, onPhotoChange }) => (
  <div className="flex flex-col items-center mb-6">
    <div className="relative">
      <img
        className="w-24 h-24 object-cover rounded-full border-4 border-indigo-600 shadow-md"
        src={photoUrl}
        alt="Foto de perfil"
      />
      <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 cursor-pointer hover:bg-indigo-700 transition">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={onPhotoChange} 
        />
        <Camera className="h-4 w-4" />
      </label>
    </div>
  </div>
);

export default ProfilePhoto;
