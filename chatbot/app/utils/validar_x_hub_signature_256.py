import hmac
import hashlib
from app.config import SECRET_TOKEN
from flask import request
import logging
def validar_x_hub_signature_256() -> bool:
    
    header_signature = request.headers.get("X-Hub-Signature-256")
    logging.error("SIGN")
    if not header_signature:
        return False
    logging.error("SIGN pass")
    try:
        # Se espera que la cabecera tenga el formato 'sha256=...' 
        sha_name, signature = header_signature.split('=')
        logging.error("sha_name")
        if sha_name != 'sha256':
            return False
        logging.error("sha_name pass")
        logging.error("expected_signature")
        # Calcular la firma esperada
        
        mac = hmac.new(SECRET_TOKEN.encode(), msg=request.data, digestmod=hashlib.sha1)
        if not hmac.compare_digest(str(mac.hexdigest()), str(signature)):
            return False


        # Comparar de forma segura
        return True

    except (ValueError, AttributeError):
        logging.error("except pass")
        return False
