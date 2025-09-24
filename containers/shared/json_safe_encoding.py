"""
JSON Safe Encoding Utilities for Python - Da-Kraken
Provides secure JSON handling for Python containers
"""

import json
import html
import re
from typing import Any, Dict, Optional
from datetime import datetime


class JsonSafeEncoder:
    """Secure JSON encoder with safety checks and sanitization"""

    def __init__(self, max_depth: int = 10, max_string_length: int = 10000):
        self.max_depth = max_depth
        self.max_string_length = max_string_length
        self._seen_objects = set()

    def safe_json_parse(self, json_string: str, **options) -> Dict[str, Any]:
        """
        Safely parse JSON string with validation and sanitization

        Args:
            json_string: JSON string to parse
            **options: Additional parsing options

        Returns:
            Dictionary with success status and data or error info
        """
        try:
            # Input validation
            if not isinstance(json_string, str):
                raise ValueError("Input must be a string")

            if len(json_string) > self.max_string_length:
                raise ValueError(
                    f"JSON string exceeds maximum length of {self.max_string_length}"
                )

            # Parse JSON
            parsed_data = json.loads(json_string)

            # Validate and sanitize
            sanitized_data = self._sanitize_data(parsed_data, depth=0)

            return {"success": True, "data": sanitized_data}

        except (json.JSONDecodeError, ValueError) as e:
            return {"success": False, "error": str(e), "type": "JSON_PARSE_ERROR"}

    def safe_json_stringify(self, obj: Any, **options) -> str:
        """
        Safely stringify object to JSON with circular reference protection

        Args:
            obj: Object to stringify
            **options: Additional stringification options

        Returns:
            Safe JSON string
        """
        try:
            self._seen_objects.clear()

            # Configure options
            indent = options.get("indent", None)
            ensure_ascii = options.get("ensure_ascii", False)
            escape_html = options.get("escape_html", True)

            # Process object with safety checks
            safe_obj = self._make_json_safe(obj, depth=0)

            # Stringify with custom encoder
            result = json.dumps(
                safe_obj,
                indent=indent,
                ensure_ascii=ensure_ascii,
                cls=SafeJSONEncoder,
                default=self._default_serializer,
            )

            if escape_html:
                result = html.escape(result)

            return result

        except Exception as e:
            return json.dumps(
                {
                    "error": "JSON_STRINGIFY_ERROR",
                    "message": str(e),
                    "original_type": str(type(obj)),
                }
            )

    def _sanitize_data(self, data: Any, depth: int = 0) -> Any:
        """Recursively sanitize data structure"""
        if depth > self.max_depth:
            return "[Max Depth Exceeded]"

        if isinstance(data, str):
            return self.sanitize_string(data)
        elif isinstance(data, dict):
            return {
                self.sanitize_string(str(k)): self._sanitize_data(v, depth + 1)
                for k, v in data.items()
            }
        elif isinstance(data, list):
            return [self._sanitize_data(item, depth + 1) for item in data]
        else:
            return data

    def _make_json_safe(self, obj: Any, depth: int = 0) -> Any:
        """Make object safe for JSON serialization"""
        if depth > self.max_depth:
            return "[Max Depth Exceeded]"

        # Handle circular references
        obj_id = id(obj)
        if obj_id in self._seen_objects:
            return "[Circular Reference]"

        if isinstance(obj, (dict, list, tuple, set)):
            self._seen_objects.add(obj_id)

        try:
            if isinstance(obj, dict):
                result = {}
                for k, v in obj.items():
                    safe_key = str(k)[: self.max_string_length]
                    result[safe_key] = self._make_json_safe(v, depth + 1)
                return result
            elif isinstance(obj, (list, tuple)):
                return [self._make_json_safe(item, depth + 1) for item in obj]
            elif isinstance(obj, set):
                return [self._make_json_safe(item, depth + 1) for item in obj]
            elif isinstance(obj, str):
                return obj[: self.max_string_length]
            else:
                return obj
        finally:
            if isinstance(obj, (dict, list, tuple, set)):
                self._seen_objects.discard(obj_id)

    def _default_serializer(self, obj: Any) -> Any:
        """Default serializer for non-JSON-serializable objects"""
        if hasattr(obj, "isoformat"):  # datetime objects
            return obj.isoformat()
        elif hasattr(obj, "__dict__"):  # Custom objects
            return obj.__dict__
        else:
            return str(obj)

    @staticmethod
    def sanitize_string(text: str) -> str:
        """Sanitize string to prevent XSS and injection attacks"""
        if not isinstance(text, str):
            return str(text)

        # Remove control characters
        text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)

        # HTML escape
        text = html.escape(text, quote=True)

        return text

    def create_api_response(self, data: Any, meta: Optional[Dict] = None) -> str:
        """Create a secure API response wrapper"""
        if meta is None:
            meta = {}

        response = {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data,
            "meta": {
                "version": "1.0",
                "encoding": "utf-8",
                "content_type": "application/json",
                **meta,
            },
        }

        return self.safe_json_stringify(response, escape_html=True)

    def create_error_response(
        self, message: str, code: str = "UNKNOWN_ERROR", details: Any = None
    ) -> str:
        """Create an error response"""
        response = {
            "success": False,
            "error": {
                "message": self.sanitize_string(message),
                "code": code,
                "timestamp": datetime.utcnow().isoformat(),
                "details": details,
            },
        }

        return self.safe_json_stringify(response, escape_html=True)


class SafeJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder with additional safety features"""

    def encode(self, obj):
        """Override encode to add additional safety"""
        return super().encode(obj)

    def iterencode(self, obj, _one_shot=False):
        """Override iterencode for streaming safety"""
        return super().iterencode(obj, _one_shot)


# Global instance for easy use
json_safe = JsonSafeEncoder()

# Convenience functions
safe_json_parse = json_safe.safe_json_parse
safe_json_stringify = json_safe.safe_json_stringify
sanitize_string = json_safe.sanitize_string
create_api_response = json_safe.create_api_response
create_error_response = json_safe.create_error_response
