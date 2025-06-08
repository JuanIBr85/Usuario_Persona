from app.routes.api_gateway import bp as api_gateway_bp
from app.routes.static_routes import bp as static_routes_bp
from common.routes.service_route import bp as service_bp

def register_blueprints(app):
    app.register_blueprint(api_gateway_bp)
    app.register_blueprint(static_routes_bp)
    app.register_blueprint(service_bp)