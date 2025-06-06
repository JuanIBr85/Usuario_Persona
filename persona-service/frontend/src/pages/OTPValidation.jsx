import React from "react";
import { Button } from "@/components/ui/button";
import InputValidate from "@/components/inputValidate/InputValidate";
import { Link } from 'react-router-dom';
import { ShieldCheck } from "lucide-react";
import { formSubmitJson } from "@/utils/formUtils";
import { SimpleDialog, FetchErrorMessage } from "@/components/SimpleDialog";
import { AuthService } from "@/services/authService";
import Loading from "@/components/loading/Loading";
import AuthLayout from "@/components/authLayout/AuthLayout";
import { Label } from "@/components/ui/label";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";

function OTPValidation() {
    const navigate = useNavigate();
    const {authData} = useAuthContext();
    const location = useLocation();
    const toRedirect = location.state?.from || "/";
    const email = location.state?.email || authData.user.email_usuario || "";

    const [isOpen, setIsOpen] = React.useState(false);
    const [dialogMessage, setMessage] = React.useState("");
    const [isOK, setIsOK] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (event) => {
        const formData = await formSubmitJson(event);
        document.activeElement.blur();
        setIsLoading(true);
        AuthService
            .validateOtp({formData, email: email})
            .then((json) => {
                setMessage(`Se ha verificado correctamente el código de verificación.`);
                setIsOK(true);
            }).catch((error) => {
                console.log(error.data)
                if (error.isJson) {
                    if (error.data.error) {
                        setMessage(FetchErrorMessage(error));
                    } else {
                        setMessage(error.data.message || "Error desconocido");
                    }
                } else {
                    setMessage(error.message);
                }
            }).finally(() => { setIsLoading(false); setIsOpen(true); });
    }

    return (
        <>
            {isLoading && <Loading isFixed={true} />}
            <SimpleDialog
                title="Login"
                description={dialogMessage}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                actionHandle={isOK ? () => setTimeout(() => navigate(toRedirect), 200) : undefined}
            />

            <AuthLayout
                title="Verificación de dos factores"
                visualContent={<ShieldCheck className="text-white w-42 h-42" />}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="otp">Código de verificación</Label>
                        <div className="relative">
                            <InputOTP name="otp" maxLength={6} containerClassName="justify-center">
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
                    </div>
                    <Button variant="link" asChild className="p-0 mt-4">
                        <Link>¿No te llegó el código? reenviar</Link>
                    </Button>
                    <Button type="submit" className="mt-4">Validar</Button>
                </form>

            </AuthLayout>
        </>
    );
}

export default OTPValidation;
