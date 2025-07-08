import InputValidate from "@/components/inputValidate/InputValidate";
import { Button } from "@/components/ui/button";

export function VerificarEmail({ formRef, email, onSubmit, onEmailIncorrecto, loading }) {
  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      <InputValidate
        type="email"
        labelText="¿Es este tu email?"
        value={email}
        containerClassName="sm:col-span-3"
        readOnly
      />
      <InputValidate
        id="email_confirmado"
        name="email_confirmado"
        type="email"
        labelText="Escribe tu email"
        placeholder={email}
        containerClassName="sm:col-span-3"
        validatePattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        validationMessage="Por favor, ingresa un correo electrónico válido."
        required
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Verificando...' : 'Siguiente'}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full" 
        onClick={onEmailIncorrecto}
        disabled={loading}
      >
        No es mi correo / Ya no uso ese correo
      </Button>
    </form>
  );
}
