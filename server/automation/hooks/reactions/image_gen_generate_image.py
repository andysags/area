from .. import register_reaction
import requests
import os
import json

@register_reaction("generate_image")
def executor(area, context=None):
    """
    Generate an image using Flux AI via RapidAPI.
    Supports prompt templating with context variables.
    """
    try:
        config = area.config_reaction or {}
        prompt = config.get("prompt", "")
        # style_id = config.get("style_id", 0) # API specific
        # size = config.get("size", "1-1")
        
        # Template replacement
        if context:
            for k, v in context.items():
                if isinstance(v, str):
                    prompt = prompt.replace(f"{{{k}}}", v)

        # Using a generic Text-to-Image API on RapidAPI (Flux or similar)
        # Using "Flux Image Generator" configuration
        url = "https://flux-image-generator.p.rapidapi.com/generate"
        
        payload = {
            "prompt": prompt,
            "width": 1024,
            "height": 1024,
            # "style_id": int(style_id)
        }

        # Size adjustment
        size_opt = config.get("size", "1-1")
        if size_opt == '16-9':
            payload["width"] = 1024
            payload["height"] = 576
        elif size_opt == '9-16':
            payload["width"] = 576
            payload["height"] = 1024
        elif size_opt == '3-2':
            payload['width'] = 1024
            payload['height'] = 683
        elif size_opt == '2-3':
            payload['width'] = 683
            payload['height'] = 1024

        headers = {
            "x-rapidapi-key": os.environ.get("IMAGE_GEN_RAPIDAPI_KEY", ""),
            "x-rapidapi-host": "flux-image-generator.p.rapidapi.com",
            "Content-Type": "application/json"
        }

        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code != 200:
            return {"error": f"API Error {response.status_code}: {response.text}"}

        data = response.json()
        # Expecting generic response, adjust based on actual API
        # Many return {"url": "..."} or {"data": [{"url": "..."}]}
        # Assuming Flux returns {"data": [{"url": "..."}]} or similar
        
        # Log the result
        image_url = ""
        if "url" in data:
            image_url = data["url"]
        elif "data" in data and len(data["data"]) > 0:
            image_url = data["data"][0].get("url", "")
            
        if image_url:
            return {"message": f"Generated image for '{prompt}'", "url": image_url}
        else:
            return {"message": "Image generated but URL not found in response", "raw": str(data)[:100]}

    except Exception as e:
        return {"error": str(e)}
