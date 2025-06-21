from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="component-services",
    version="0.2.40",
    description="Servicio de componentes",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=find_packages(include=["common", "common.*"]),
    include_package_data=True,
    install_requires=[
        "blinker==1.9.0",
        "certifi==2025.4.26",
        "charset-normalizer==3.4.2",
        "click==8.2.0",
        "colorama==0.4.6",
        "Flask==3.1.1",
        "flask-cors==6.0.0",
        "Flask-JWT-Extended==4.7.1",
        "Flask-SQLAlchemy==3.1.1",
        "greenlet==3.2.2",
        "idna==3.10",
        "itsdangerous==2.2.0",
        "Jinja2==3.1.6",
        "MarkupSafe==3.0.2",
        "marshmallow==4.0.0",
        "PyJWT==2.10.1",
        "PyMySQL==1.1.1",
        "python-dotenv==1.1.0",
        "requests==2.32.3",
        "SQLAlchemy==2.0.41",
        "typing_extensions==4.13.2",
        "urllib3==2.4.0",
        "Werkzeug==3.1.3",
        "pyyaml",
    ],
)
