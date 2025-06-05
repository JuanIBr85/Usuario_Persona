import React from "react";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link } from 'react-router-dom';
import { UserPlus } from "lucide-react";
import { formSubmitJson } from "@/utils/formUtils";
import { SimpleDialog, FetchErrorMessage } from "@/components/SimpleDialog";
import { AuthService } from "@/services/authService";
import Loading from "@/components/loading/Loading";
import AuthLayout from "@/components/authLayout/AuthLayout";

function Sign() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dialogMessage, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (event) => {
    const formData = await formSubmitJson(event);
    document.activeElement.blur();
    setIsLoading(true);
    AuthService
      .register(formData)
      .then((json) => {
        setMessage(`La cuenta ha sido creada correctamente. Por favor, verifique su correo electrónico para activar su cuenta.`);
        setIsOpen(true);
      }).catch((error) => {
        if (error.isJson) {
          if (error.data.error) {
            setMessage(FetchErrorMessage(error));
          } else {
            setMessage(error.data.message || "Error desconocido");
          }
        } else {
          setMessage(error.message);
        }
        setIsOpen(true);
      }).finally(()=>setIsLoading(false));
  }

  return (
    <>
      {isLoading && <Loading isFixed={true} />}
      <SimpleDialog
        title="Registro"
        description={dialogMessage}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      
      <AuthLayout
        title="Creación de cuenta"
        visualContent={<UserPlus className="text-white w-42 h-42" />}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
          <InputValidate
            id="email_usuario"
            type="email"
            placeholder="Email"
            labelText="Email"
            validateMessage="Email inválido"
            required
          />
          <InputValidate
            id="nombre_usuario"
            type="text"
            placeholder="Nombre de usuario"
            labelText="Nombre"
            validateMessage="El nombre es requerido"
            required
          />
          <InputValidate
            id="password"
            type="password"
            placeholder="Contraseña"
            labelText="Contraseña"
            validatePattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
            validateMessage="La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial."
            required
          />
          <Button variant="link" asChild className="p-0">
            <Link to="/login">¿Ya tienes una cuenta? Inicia sesión</Link>
          </Button>
          <Button type="submit" className="mt-4">Registrarse</Button>
        </form>
      </AuthLayout>
    </>
  );
}

export default Sign