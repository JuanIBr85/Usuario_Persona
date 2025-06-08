from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="component-services",
    version="0.1.0",
    description="Servicio de componentes",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=find_packages(include=['common', 'common.*']),
    include_package_data=True,
    install_requires=[
        "Flask==2.3.3",
        "Flask-SQLAlchemy==3.1.1",
        "Flask-Migrate==4.0.5",
        "Flask-JWT-Extended==4.5.2",
        "Flask-Cors==4.0.0",
        "python-dotenv==1.0.0",
        "marshmallow==3.20.1",
        "marshmallow-sqlalchemy==0.29.0",
        "python-dateutil==2.8.2",
        "requests==2.31.0",
        "Werkzeug==2.3.7",
        "gunicorn==21.2.0"
    ]
)
