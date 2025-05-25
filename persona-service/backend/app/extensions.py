from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
from flask_jwt_extended import JWTManager
from config import SQLALCHEMY_DATABASE_URI


engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=True, future=True)
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

jwt = JWTManager()

