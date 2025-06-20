from app.utils.email_util import generar_codigo_otp, enviar_codigo_por_email_persona

class OtpService:
    #genera y envia codigo otp

    def solicitar_otp(self, persona) -> str:
    
        codigo = generar_codigo_otp()
        enviar_codigo_por_email_persona(persona, codigo)
        return codigo