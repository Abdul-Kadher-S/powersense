"""OCR service for electricity bill processing using Gemini Vision API."""
import os
import json
import re
from typing import Dict, Optional, Tuple
from app.config import settings


async def process_bill_image(file_content: bytes, filename: str, content_type: str) -> Dict:
    """Process an uploaded bill image using Gemini Vision or fallback.
    
    Args:
        file_content: Raw file bytes
        filename: Original filename
        content_type: MIME type
    
    Returns:
        Dict with extracted fields or error
    """
    # Try Gemini Vision first
    if settings.GEMINI_API_KEY:
        try:
            return await _process_with_gemini(file_content, content_type)
        except Exception as e:
            print(f"Gemini OCR failed: {e}")
            return _fallback_response(str(e))
    
    return _fallback_response("No OCR API configured. Please enter bill details manually.")


async def _process_with_gemini(file_content: bytes, content_type: str) -> Dict:
    """Process bill using Gemini Vision API."""
    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = """Analyze this electricity bill image and extract the following information in JSON format:
    {
        "billing_period": "e.g., August 2026 or Aug 2026 - Sep 2026",
        "units_consumed": <number in kWh>,
        "bill_amount": <number in INR>,
        "meter_number": "meter/consumer number if visible",
        "consumer_number": "consumer/account number if visible"
    }
    
    If a field is not clearly visible, set it to null.
    Return ONLY the JSON object, no other text."""

    # Determine MIME type for Gemini
    mime = content_type
    if mime == "application/pdf":
        mime = "application/pdf"

    response = model.generate_content([
        prompt,
        {"mime_type": mime, "data": file_content}
    ])

    # Parse response
    text = response.text.strip()
    # Try to extract JSON from response
    json_match = re.search(r'\{[^}]+\}', text, re.DOTALL)
    if json_match:
        data = json.loads(json_match.group())
        return {
            "success": True,
            "billing_period": data.get("billing_period"),
            "units_consumed": _safe_float(data.get("units_consumed")),
            "bill_amount": _safe_float(data.get("bill_amount")),
            "meter_number": data.get("meter_number"),
            "consumer_number": data.get("consumer_number"),
            "raw_text": text,
            "message": "Bill data extracted successfully using AI vision. Please review and confirm.",
        }

    return _fallback_response("Could not parse bill content. Please enter details manually.")


def _safe_float(value) -> Optional[float]:
    """Safely convert a value to float."""
    if value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def _fallback_response(reason: str) -> Dict:
    """Return a fallback response when OCR is unavailable."""
    return {
        "success": False,
        "billing_period": None,
        "units_consumed": None,
        "bill_amount": None,
        "meter_number": None,
        "consumer_number": None,
        "raw_text": None,
        "message": f"Automatic extraction unavailable: {reason}",
    }


def validate_file(filename: str, content_type: str, size: int) -> Tuple[bool, str]:
    """Validate uploaded file."""
    # Check file type
    allowed_types = {
        "application/pdf", "image/jpeg", "image/jpg", "image/png",
        "application/octet-stream",  # Some browsers send this
    }
    allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png"}

    ext = os.path.splitext(filename)[1].lower()
    if ext not in allowed_extensions:
        return False, f"File type '{ext}' not supported. Allowed: PDF, JPG, JPEG, PNG."

    # Check size (max 10MB)
    max_size = 10 * 1024 * 1024
    if size > max_size:
        return False, f"File too large ({size / 1024 / 1024:.1f}MB). Maximum: 10MB."

    return True, "OK"
