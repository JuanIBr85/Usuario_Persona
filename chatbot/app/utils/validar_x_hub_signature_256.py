import hmac
import hashlib
from app.config import SECRET_TOKEN
from flask import request
import logging

def validar_x_hub_signature_256():
  data = request.get_data()
  hmac_recieved = str(request.headers.get('X-Hub-Signature-256') or "").removeprefix('sha256=')
  digest = hmac.new(SECRET_TOKEN.encode('utf-8'), data, hashlib.sha256).hexdigest()
  return hmac.compare_digest(hmac_recieved, digest)