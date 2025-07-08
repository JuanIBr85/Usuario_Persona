from flask import Blueprint, jsonify
from app.services.endpoints_search_service import EndpointsSearchService

bp = Blueprint("routes2", __name__, cli_group="routes2")
