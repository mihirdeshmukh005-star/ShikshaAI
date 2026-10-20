import importlib
import re
from typing import Type
from pydantic import BaseModel
from ..config import (
    GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FAST_MODEL,
    GEMINI_EMBEDDING_MODEL, EMBEDDING_DIM
)

# Do not use Models.generate_content with tools/AFC. Classroom turns are
# deliberately plain structured generation calls for lower latency and
# predictable JSON responses.
FALLBACK_MODELS = [
    GEMINI_MODEL,
    GEMINI_FAST_MODEL,
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
]


def _client():
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is missing. Create backend/.env and add your Gemini API key.")
    try:
        genai = importlib.import_module("google.genai")
    except Exception as exc:
        raise RuntimeError("The google-genai package is not installed. Run: python -m pip install google-genai") from exc
    return genai.Client(api_key=GEMINI_API_KEY)


def _is_model_unavailable(exc):
    text = str(exc).lower()
    return "404" in text or "not_found" in text or "not found" in text or "no longer available" in text


def _is_quota_error(exc):
    text = str(exc).lower()
    return "429" in text or "quota" in text or "too_many_requests" in text


def _models(primary, fast):
    ordered = [primary, fast] + FALLBACK_MODELS
    out = []
    for m in ordered:
        if m and m not in out:
            out.append(m)
    return out


def generate(prompt: str, previous_interaction_id: str | None = None):
    # Kept for compatibility with older project code. No automatic function
    # calling is configured here.
    client = _client()
    if previous_interaction_id:
        interaction = client.interactions.create(
            model=GEMINI_MODEL, input=prompt,
            previous_interaction_id=previous_interaction_id
        )
        return interaction.output_text, interaction.id
    response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
    return response.text, None


def generate_structured(prompt: str, schema: Type[BaseModel], fast: bool = True):
    """Generate validated JSON with model fallback.

    A fresh API key may have different model access. We try the configured
    model first and only fall back on model-unavailable errors. Quota/auth
    errors are surfaced instead of being hidden.
    """
    client = _client()
    genai = importlib.import_module("google.genai")
    types = genai.types
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema,
        max_output_tokens=2600 if not fast else 1600,
    )

    primary = GEMINI_FAST_MODEL if fast else GEMINI_MODEL
    last = None
    for model in _models(primary, GEMINI_MODEL):
        try:
            response = client.models.generate_content(
                model=model, contents=prompt, config=config
            )
            text = getattr(response, "text", "") or ""
            if not text.strip():
                raise RuntimeError("Gemini returned an empty response.")
            return schema.model_validate_json(text)
        except Exception as exc:
            last = exc
            if _is_quota_error(exc):
                raise RuntimeError(
                    "Gemini quota/rate limit was reached. Check your Gemini API quota or use another project/key."
                ) from exc
            if _is_model_unavailable(exc):
                continue
            # A schema/config incompatibility can sometimes be model-specific.
            # Try the next model only for obvious availability/config errors.
            if "unsupported" in str(exc).lower() and model != GEMINI_MODEL:
                continue
            raise
    raise RuntimeError(f"No configured Gemini model is available. Last error: {last}")


def embed(text: str):
    """Return an embedding, or [] when semantic embeddings are unavailable.

    RAG remains functional through the hybrid lexical retriever. This is
    important because one broken embedding model must never prevent a PDF/PPTX
    from being uploaded and indexed.
    """
    if not text.strip():
        return []
    try:
        client = _client()
        result = client.models.embed_content(
            model=GEMINI_EMBEDDING_MODEL,
            contents=text,
            config={"output_dimensionality": EMBEDDING_DIM},
        )
        return list(result.embeddings[0].values)
    except Exception:
        return []
