def initialize_routes(app):
    from cms.routes.contacto_route import contacto_bp
    from cms.routes.horario_atencion_route import horario_atencion_bp
    from cms.routes.pagina_inicio_route import pagina_inicio_bp

    app.register_blueprint(contacto_bp, url_prefix='/api/cms/contacto')
    app.register_blueprint(horario_atencion_bp, url_prefix='/api/cms/horario')
    app.register_blueprint(pagina_inicio_bp, url_prefix='/api/cms/pagina-inicio')