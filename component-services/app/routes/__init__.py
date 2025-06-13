from app.routes.api_gateway import bp as api_gateway_bp

def register_blueprints(app):
    app.register_blueprint(api_gateway_bp)
