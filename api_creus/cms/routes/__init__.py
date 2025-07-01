def initialize_routes(app):
    from cms.routes.contacto_route import contacto_bp
    from cms.routes.horario_atencion_route import horario_atencion_bp
    from cms.routes.pagina_inicio_route import pagina_inicio_bp
    from cms.routes.publicacion_propuesta_route import publicacion_bp
    from cms.routes.categoria_route import categoria_bp
    from cms.routes.preguntas_frecuentes_route import faq_bp
    from cms.routes.bloque_seccion_route import bloque_bp
    from cms.routes.seccion_route import seccion_bp
    from cms.routes.imagen_route import imagen_bp
    from cms.routes.noticia_route import noticia_bp
    from cms.routes.solicitud_contacto_route import solicitud_contacto_bp

    app.register_blueprint(contacto_bp, url_prefix='/api/cms/contacto')
    app.register_blueprint(horario_atencion_bp, url_prefix='/api/cms/horario')
    app.register_blueprint(
        pagina_inicio_bp, url_prefix='/api/cms/pagina-inicio')
    app.register_blueprint(
        publicacion_bp, url_prefix='/api/cms/publicacion-propuesta')
    app.register_blueprint(categoria_bp, url_prefix='/api/cms/categorias')
    app.register_blueprint(faq_bp, url_prefix='/api/cms/preguntas-frecuentes')
    app.register_blueprint(bloque_bp, url_prefix='/api/cms/bloques')
    app.register_blueprint(seccion_bp, url_prefix='/api/cms/secciones')
    app.register_blueprint(imagen_bp, url_prefix='/api/cms/imagenes')
    app.register_blueprint(noticia_bp, url_prefix='/api/cms/noticias')
    app.register_blueprint(solicitud_contacto_bp, url_prefix='/api/cms/solicitudes-contacto')

