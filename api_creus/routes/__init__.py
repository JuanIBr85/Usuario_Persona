def initialize_routes(app):
    from routes.auth import auth_bp
    from routes.propuesta_educativa_route import propuesta_bp
    from routes.institucion_route import institucion_bp
    from routes.egresado_route import egresado_bp
    from routes.titulo_certificacion_route import titulo_bp
    from routes.tipo_propuesta_route import tipo_bp
    from routes.area_conocimiento_route import area_bp
    from routes.preinscripcion_route import preinscripcion_bp
    from routes.convenio_route import convenio_bp
    from routes.archivo_route import archivo_bp
    from routes.historial_route import historial_bp
    from routes.cohorte_route import cohorte_bp
    from routes.estado_route import estado_bp
    from routes.modalidad_route import modalidad_bp
    from routes.coordinador_route import coordinador_bp
    from routes.sede_creus_route import sede_creus_bp

 
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(propuesta_bp, url_prefix='/api/propuestas')
    app.register_blueprint(institucion_bp, url_prefix='/api/institucion')
    app.register_blueprint(egresado_bp, url_prefix = '/api/egresado')
    app.register_blueprint(titulo_bp, url_prefix='/api/certificaciones')
    app.register_blueprint(tipo_bp, url_prefix='/api/tipos-propuesta')
    app.register_blueprint(area_bp, url_prefix='/api/areas-conocimiento')
    app.register_blueprint(preinscripcion_bp, url_prefix = '/api/preinscripcion')
    app.register_blueprint(convenio_bp, url_prefix='/api/convenio')
    app.register_blueprint(archivo_bp, url_prefix='/api/archivos')
    app.register_blueprint(historial_bp, url_prefix='/api/historial')
    app.register_blueprint(cohorte_bp, url_prefix='/api/cohorte')
    app.register_blueprint(estado_bp, url_prefix='/api/estados')
    app.register_blueprint(modalidad_bp, url_prefix='/api/modalidad')
    app.register_blueprint(coordinador_bp, url_prefix='/api/coordinador')
    app.register_blueprint(sede_creus_bp, url_prefix='/api/sede-creus')
