from common.routes.service_route import bp 

def component_service(app):
    app.register_blueprint(bp, url_prefix='/component_service')
    print("Component service registrado")
