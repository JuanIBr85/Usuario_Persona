def initialize_routes(app):
    from routes.auth import auth_bp
    from routes.propuesta_educativa_route import propuesta_bp
    from routes.institucion_route import institucion_bp
    from routes.egresado_route import egresado_bp
    from routes.titulo_certificacion_route import titulo_bp
    from routes.tipo_propuesta_route import tipo_bp
    from routes.area_conocimiento_route import area_bp
 
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(propuesta_bp, url_prefix='/api/propuestas')
    app.register_blueprint(institucion_bp, url_prefix='/api/institucion')
    app.register_blueprint(egresado_bp, url_prefix = '/api/egresado')
    app.register_blueprint(titulo_bp, url_prefix='/api/certificaciones')
    app.register_blueprint(tipo_bp, url_prefix='/api/tipos-propuesta')
    app.register_blueprint(area_bp, url_prefix='/api/areas-conocimiento')
