from .. import register_reaction
from automation.providers.registry import ProviderRegistry

@register_reaction("detect_license_plate")
def executor(area, context=None):
    """
    Wrapper for VehicleProvider.detect_license_plate
    """
    try:
        provider = ProviderRegistry.get_provider("vehicle")
        config = area.config_reaction or {}
        # Vehicle detect uses no params currently, but we keep the structure
        return provider.detect_license_plate(config, context)
    except Exception as e:
        return {"error": str(e)}
