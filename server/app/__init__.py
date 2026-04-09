import os
from pathlib import Path

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from .config import Config
from .extensions import db, migrate


def _resolve_sqlite_database_url(uri: str) -> str:
    """
    Relative sqlite URLs (e.g. sqlite:///server/data/x.db) are resolved by SQLite/SQLAlchemy
    against the process **current working directory**. Running `python run.py` from `server/`
    vs repo root then points at different paths and often yields "unable to open database file".

    Fix: resolve relative paths against `server/` and the repo root, preferring a path that
    already exists on disk.
    """
    uri = (uri or "").strip()
    if not uri.lower().startswith("sqlite:"):
        return uri
    # Unix absolute path uses four slashes: sqlite:////tmp/db.sqlite
    if uri.lower().startswith("sqlite:////"):
        return uri
    if not uri.startswith("sqlite:///"):
        return uri

    rel = uri[len("sqlite:///") :].replace("\\", "/")
    path = Path(rel)
    if path.is_absolute():
        return "sqlite:///" + path.resolve().as_posix()

    server_root = Path(__file__).resolve().parent.parent
    repo_root = server_root.parent
    for base in (server_root, repo_root, Path.cwd()):
        candidate = (base / rel).resolve()
        if candidate.is_file():
            return "sqlite:///" + candidate.as_posix()

    # New DB: stable location under server/ even if the file is not created yet
    candidate = (server_root / rel).resolve()
    return "sqlite:///" + candidate.as_posix()


def create_app():
    # Load environment variables from .env
    load_dotenv()
    app = Flask(__name__, instance_relative_config=False)
    CORS(app)
    app.config.from_object(Config)

    # Accept DATABASE_URL or SQLALCHEMY_DATABASE_URI
    db_url = os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URI")
    if db_url:
        # Some providers give DATABASE_URL starting with postgres://
        # SQLAlchemy prefers postgresql://; the 'postgres://' scheme still often works,
        # but we normalize it here just in case.
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
        if db_url.startswith("sqlite:"):
            db_url = _resolve_sqlite_database_url(db_url)
        app.config['SQLALCHEMY_DATABASE_URI'] = db_url

    db.init_app(app)
    migrate.init_app(app, db)

    @app.route("/ping")
    def ping():
        return "pong", 200

    # simple route to show DB count
    @app.route("/users-count")
    def users_count():
        try:
            count = db.session.execute("SELECT COUNT(*) FROM \"user\";").scalar()
            return {"users": int(count)}, 200
        except Exception as e:
            return {"error": str(e)}, 500

    # register models
    from . import models  # noqa

    from . import routes  # noqa
    app.register_blueprint(routes.api_bp)

    return app
