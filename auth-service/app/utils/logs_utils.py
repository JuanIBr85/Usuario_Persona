from app.models import UsuarioLog
from common.utils.component_request import ComponentRequest
from sqlalchemy.orm import Session

def log_usuario_accion(session: Session, usuario_id: int, accion: str, detalles_opcionales: str = ""):
    """
    Registra una acción del usuario en la tabla UsuarioLog.
    """
    ip = ComponentRequest.get_ip() or "desconocida"
    user_agent = ComponentRequest.get_user_agent() or "desconocido"

    detalles = f"{detalles_opcionales}\nIP: {ip}\nUser-Agent: {user_agent}".strip()

    log = UsuarioLog(
        usuario_id=usuario_id,
        accion=accion,
        detalles=detalles
    )
    session.add(log)
    session.commit()
