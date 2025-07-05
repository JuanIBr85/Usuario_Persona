import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export function VerificarOTP({ formRef, onSubmit, loading }) {
  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid w-full items-center justify-center gap-4">
      <Label htmlFor="codigo" className="inline-block w-full text-center">Código de verificación</Label>
      <div className="relative">
        <InputOTP name="codigo" maxLength={6} containerClassName="justify-center">
          <InputOTPGroup>
            <InputOTPSlot className="bg-gray-100" index={0} />
            <InputOTPSlot className="bg-gray-100" index={1} />
            <InputOTPSlot className="bg-gray-100" index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot className="bg-gray-100" index={3} />
            <InputOTPSlot className="bg-gray-100" index={4} />
            <InputOTPSlot className="bg-gray-100" index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Verificando...' : 'Siguiente'}
      </Button>
    </form>
  );
}
