from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="component-services",
    version="0.2.68",
    description="Servicio de componentes",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=find_packages(include=["common", "common.*"]),
    include_package_data=True,
    install_requires=[
        "Flask==3.1.1",
        "Werkzeug==3.1.3",
        "PyYAML>=6.0.0",
        "marshmallow==4.0.0",
        "requests==2.32.3",
        "cachetools==6.1.0"
    ],
)
