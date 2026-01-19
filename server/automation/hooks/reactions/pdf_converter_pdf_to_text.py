from .. import register_reaction
from automation.providers.registry import ProviderRegistry

@register_reaction("pdf_to_text")
def executor(area, context=None):
    """
    Wrapper for PDFConverterProvider.pdf_to_text
    """
    try:
        provider = ProviderRegistry.get_provider("pdf_converter")
        config = area.config_reaction or {}
        
        # Template parameter replacement 
        if context:
            for k, v in config.items():
                if isinstance(v, str):
                    for ctx_k, ctx_v in context.items():
                        if isinstance(ctx_v, str):
                            v = v.replace(f"{{{ctx_k}}}", ctx_v)
                    config[k] = v
            
            # Special handling: PDF data from context (if unavailable in params)
            # Triggers like "New Email with Attachment" might put 'attachment_data' in context
            if 'attachment_data' in context:
                config['pdf_data'] = context['attachment_data']
            elif 'file_content' in context:
                config['pdf_data'] = context['file_content']

        return provider.pdf_to_text(config, context)
    except Exception as e:
        return {"error": str(e)}
