import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RotateCcwKey } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { SimpleDialog, FetchErrorMessage } from "@/components/SimpleDialog";
import Loading from "@/components/loading/Loading";
import AuthLayout from "@/components/authLayout/AuthLayout";
import { AuthService } from "@/services/authService";

const ResetPassword = () => {
  // Navegación y ubicación actual para recuperar el email
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para controlar el diálogo de confirmación o error
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Obtenemos el email del estado de navegación o del sessionStorage
  const email =
    location.state?.email || sessionStorage.getItem("email_para_reset") || "";

  // Obtenemos el token guardado en sessionStorage (recibido al verificar OTP)
  const token = location.state?.token || sessionStorage.getItem("reset_token");

  // Manejador del envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevenir comportamiento por defecto

    // Extraemos los datos del formulario
    const formData = new FormData(event.target);
    const password = formData.get("password");
    const confirm = formData.get("confirm_password");

    setIsLoading(true); // Activar estado de carga

    try {
      // Enviamos la nueva contraseña al backend
      await AuthService.resetPassword(
        {
          email: email,
          password: password,
          confirm_password: confirm,
        },
        token
      );

      // Si todo salió bien, mostramos mensaje y marcamos como exitoso
      setDialogMessage("Contraseña actualizada correctamente.");
      setIsSuccess(true);
      sessionStorage.removeItem("reset_token"); // Eliminamos el token ya usado
      sessionStorage.removeItem("email_para_reset");
    } catch (error) {
      console.error("Error:", error);

      const mensaje =
        error?.data?.message || error?.message || "Ocurrió un error inesperado.";

      setDialogMessage(mensaje);
    } finally {
      // Cerramos el loading y abrimos el diálogo
      setIsLoading(false);
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Muestra una pantalla de carga superpuesta si está activo */}
      {isLoading && <Loading isFixed />}

      {/* Diálogo de éxito o error luego de intentar cambiar la contraseña */}
      <SimpleDialog
        title="Recuperar contraseña"
        description={dialogMessage}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        actionHandle={
          isSuccess ? () => setTimeout(() => navigate("/auth/login"), 500) : undefined
        }
      />

      {/* Layout visual reutilizable para formularios de autenticación */}
      <AuthLayout
        title="Restablecer contraseña"
        visualContent={<RotateCcwKey className="text-white w-42 h-42" />}
      >
        {/* Formulario principal */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
          {/* Campo para nueva contraseña con validación */}
          <InputValidate
            id="password"
            name="password"
            type="password"
            placeholder="Nueva contraseña"
            labelText="Nueva contraseña"
            validatePattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
            validationMessage="Debe tener al menos 8 caracteres, mayúscula, minúscula, número y un símbolo."
            required
          />
          {/* Campo para confirmar contraseña */}
          <InputValidate
            id="confirm_password"
            name="confirm_password"
            type="password"
            placeholder="Confirmar contraseña"
            labelText="Confirmar contraseña"
            validationMessage="Debe repetir la contraseña."
            required
          />
          {/* Botón para enviar el formulario */}
          <Button type="submit" className="mt-4">
            Cambiar contraseña
          </Button>
        </form>
      </AuthLayout>
    </>
  );
};

export default ResetPassword;
