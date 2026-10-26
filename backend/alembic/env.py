from logging.config import fileConfig

from sqlalchemy import engine_from_config, create_engine
from sqlalchemy import pool

from alembic import context

# ─── Configuration AVELOR ────────────────────────────────────────────────────
import sys
import os

# Permet d'importer app.* depuis le dossier backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.config import settings
from app.core.database import Base

# Importer tous les modèles pour que l'autogenerate les détecte
import app.models  # noqa: F401
# ─────────────────────────────────────────────────────────────────────────────

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Métadonnées cibles pour autogenerate
target_metadata = Base.metadata

# NOTE: on ne passe PAS l'URL via set_main_option car les caractères %
# dans l'URL (encodage URL, ex. %40) conflictent avec ConfigParser.
# On crée le moteur directement dans run_migrations_online().


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    # Même raison que run_migrations_online : on utilise settings.DATABASE_URL
    # directement pour éviter le bug d'interpolation ConfigParser avec les % dans l'URL.
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,     # Détecte les changements de type de colonne
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Utilise create_engine directement pour éviter le problème
    # d'interpolation ConfigParser avec les URLs contenant des % (ex: %40)
    connectable = create_engine(settings.DATABASE_URL, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
