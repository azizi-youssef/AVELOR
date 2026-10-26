from slowapi import Limiter
from slowapi.util import get_remote_address

# Instanciation du limiter avec la cl\u00e9 par adresse IP cliente.
# Les limites par route sont d\u00e9finies via le d\u00e9corateur @limiter.limit()
# en utilisant les valeurs de settings (RATE_LIMIT_AUTH, RATE_LIMIT_ORDERS, etc.)
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])
