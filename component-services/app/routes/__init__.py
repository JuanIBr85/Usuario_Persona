from app.routes.api_gateway import bp as api_gateway_bp
from app.routes.static_routes import bp as static_routes_bp
from app.routes.component_routes import bp as component_bp
from app.routes.authenticate_request import authenticate_config

def register_blueprints(app):
    authenticate_config(app)
    app.register_blueprint(api_gateway_bp, url_prefix="/api")
    app.register_blueprint(static_routes_bp)
    app.register_blueprint(component_bp, url_prefix="/api/control")
    
