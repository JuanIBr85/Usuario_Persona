from app.models import UsuarioLog
from common.utils.component_request import ComponentRequest
from sqlalchemy.orm import Session

def log_usuario_accion(session: Session, usuario_id: int, accion: str, detalles_opcionales: str = ""):
    """
    Registra una acción del usuario en la tabla `UsuarioLog`.

    Esta función almacena en la base de datos un registro con:
    - El ID del usuario.
    - La acción realizada (por ejemplo: "Login exitoso", "Modificación de contraseña", etc.).
    - Detalles adicionales opcionales.
    - La IP del cliente y el user agent (obtenidos desde el componente `ComponentRequest`).

    Args:
        session (Session): Sesión activa de SQLAlchemy.
        usuario_id (int): ID del usuario que ejecuta la acción.
        accion (str): Descripción corta de la acción realizada.
        detalles_opcionales (str, opcional): Información extra que se desee incluir (por ejemplo: email modificado, datos sensibles anonimizados, etc.).

    Notas:
        - Se realiza un `commit()` automático dentro de esta función.
        - Si no se puede obtener IP o user-agent, se registra como `"desconocida"` o `"desconocido"` respectivamente.

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
