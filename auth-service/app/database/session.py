from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from app.models.base_model import Base

DATABASE_URL = "sqlite:///auth.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

#Base = declarative_base()