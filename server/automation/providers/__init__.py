"""
Providers package.

Import concrete provider modules to trigger registration side-effects
with ProviderRegistry.register decorators.
"""

# Import providers to ensure they are registered at import time
from . import google  # GmailProvider lives here; noqa: F401
from . import github  # noqa: F401
from . import discord  # noqa: F401
from . import spotify # noqa: F401
# from . import weatherapi # noqa: F401
from . import twitter # noqa: F401
from . import telegram # noqa: F401
from . import system  # noqa: F401
from . import timer  # noqa: F401

# New public API providers (no auth required)
from . import horoscope  # noqa: F401
from . import anime  # noqa: F401
from . import books  # noqa: F401
from . import translate  # noqa: F401
from . import sport  # noqa: F401
from . import weatherapi # noqa: F401

# Phase 3 Services
from . import instagram # noqa: F401
from . import aliexpress # noqa: F401
from . import image_gen # noqa: F401
from . import ai_detection # noqa: F401
