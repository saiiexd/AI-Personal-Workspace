import re
from typing import NoReturn

class ValidationError(ValueError):
    """Exception raised when database-level validation fails."""
    pass

def validate_email(email: str) -> str:
    """Validate email format."""
    if not email:
        raise ValidationError("Email address cannot be empty")
    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    if not re.match(email_regex, email):
        raise ValidationError(f"Invalid email address format: {email}")
    return email.lower().strip()

def validate_slug(slug: str) -> str:
    """Validate slug format (lowercase alphanumeric, hyphens, and underscores)."""
    if not slug:
        raise ValidationError("Slug cannot be empty")
    slug_regex = r"^[a-z0-9-_]+$"
    if not re.match(slug_regex, slug):
        raise ValidationError(f"Invalid slug format: '{slug}'. Slugs must contain only lowercase letters, numbers, hyphens, and underscores.")
    return slug.strip()

def validate_hex_color(color: str) -> str:
    """Validate hex color string format (e.g. #FFFFFF or #FFF)."""
    if not color:
        raise ValidationError("Color cannot be empty")
    color_regex = r"^#(?:[0-9a-fA-F]{3}){1,2}$"
    if not re.match(color_regex, color):
        raise ValidationError(f"Invalid color format: {color}. Must be a valid Hex color starting with #.")
    return color.upper().strip()
