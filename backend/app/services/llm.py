import json
from functools import lru_cache
from typing import Literal

import anthropic

from app.core.config import settings

ScriptMode = Literal["script", "hook", "storytelling", "cta"]

SYSTEM_PROMPTS: dict[ScriptMode, str] = {
    "script": (
        "You are the AI Script Assistant inside CreatorForge AI, a studio for YouTubers and "
        "content creators. Write a complete, ready-to-record video script from the creator's "
        "idea: a strong hook in the first line, clear structure with brief section labels, "
        "natural spoken language (not essay prose), and a closing call to action. Keep it "
        "tight and camera-ready — no meta-commentary about the script itself."
    ),
    "hook": (
        "You are the Hook Generator inside CreatorForge AI. Given a video idea, write 5 "
        "distinct opening hooks (the first 5-10 seconds of the video) designed to stop viewers "
        "from scrolling. Number them. Each should be 1-3 sentences, punchy, and ready to say "
        "on camera — no explanations, just the hooks."
    ),
    "storytelling": (
        "You are the Storytelling Assistant inside CreatorForge AI. Given a video idea, shape "
        "it into a short storytelling arc a creator can follow on camera: setup, rising "
        "tension, turning point, and resolution. Give 2-3 sentences per beat, written as "
        "director's notes the creator can glance at while filming."
    ),
    "cta": (
        "You are the Call-to-Action assistant inside CreatorForge AI. Given a video idea, "
        "write 5 distinct calls to action a creator could use to close out the video "
        "(subscribe, comment, follow-up video, sponsor mention, community links). Number them, "
        "keep each to one natural spoken sentence."
    ),
}


class LLMConfigError(RuntimeError):
    pass


class LLMRefusalError(RuntimeError):
    pass


@lru_cache
def _get_client() -> anthropic.Anthropic:
    if not settings.anthropic_api_key:
        raise LLMConfigError("ANTHROPIC_API_KEY is not configured on the server")
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


def generate_script_content(mode: ScriptMode, prompt: str, template: str | None = None) -> str:
    client = _get_client()
    system = SYSTEM_PROMPTS[mode]
    user_content = prompt if not template else f"Structure this using the '{template}' format.\n\n{prompt}"

    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=2048,
        system=system,
        output_config={"effort": "high" if mode == "script" else "medium"},
        messages=[{"role": "user", "content": user_content}],
    )

    if response.stop_reason == "refusal":
        raise LLMRefusalError("The request was declined by content safety checks.")

    return "\n".join(block.text for block in response.content if block.type == "text").strip()


THUMBNAIL_SYSTEM_PROMPT = (
    "You are the AI Thumbnail Creator inside CreatorForge AI. Analyze the uploaded YouTube "
    "thumbnail image the way an experienced YouTube strategist would: facial expression and "
    "emotion, contrast and colour, text legibility at small sizes, composition, and how well "
    "it would stand out in a crowded subscription feed. Give a ctr_score from 0-10 predicting "
    "click-through-rate potential, a one-sentence score_rationale, 3-5 concrete feedback "
    "bullets the creator can act on, and 3 alternative video titles that would pair well with "
    "this thumbnail."
)

THUMBNAIL_ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "ctr_score": {"type": "number"},
        "score_rationale": {"type": "string"},
        "feedback": {"type": "array", "items": {"type": "string"}},
        "title_suggestions": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["ctr_score", "score_rationale", "feedback", "title_suggestions"],
    "additionalProperties": False,
}


def analyze_thumbnail(image_data: str, media_type: str, video_topic: str | None = None) -> dict:
    client = _get_client()
    user_text = "Analyze this thumbnail for click-through potential."
    if video_topic:
        user_text += f" The video is about: {video_topic}."

    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=1024,
        system=THUMBNAIL_SYSTEM_PROMPT,
        output_config={
            "effort": "medium",
            "format": {"type": "json_schema", "schema": THUMBNAIL_ANALYSIS_SCHEMA},
        },
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": image_data}},
                    {"type": "text", "text": user_text},
                ],
            }
        ],
    )

    if response.stop_reason == "refusal":
        raise LLMRefusalError("The request was declined by content safety checks.")

    text = "".join(block.text for block in response.content if block.type == "text")
    return json.loads(text)


SEO_SYSTEM_PROMPT = (
    "You are the AI SEO Engine inside CreatorForge AI. Given a video topic, outline or "
    "transcript excerpt, generate ready-to-publish YouTube SEO metadata: an optimised title "
    "(under 70 characters), a keyword-rich description (2-4 short paragraphs, first line "
    "must hook the reader since it shows in search results), 10-15 tags, 3-5 hashtags "
    "(with #), a suggested chapter/section structure (labels only, no timestamps — the "
    "creator will time these), 5-8 keyword_focus phrases the content should target, and a "
    "short assessment of the optimisation choices you made. This is model-generated "
    "guidance based on general SEO best practice, not live search data — never invent "
    "specific search volumes, rankings, or competitor statistics; if asked about those, "
    "say so plainly in the assessment instead of making up numbers."
)

SEO_METADATA_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "description": {"type": "string"},
        "tags": {"type": "array", "items": {"type": "string"}},
        "hashtags": {"type": "array", "items": {"type": "string"}},
        "chapters": {"type": "array", "items": {"type": "string"}},
        "keyword_focus": {"type": "array", "items": {"type": "string"}},
        "assessment": {"type": "string"},
    },
    "required": ["title", "description", "tags", "hashtags", "chapters", "keyword_focus", "assessment"],
    "additionalProperties": False,
}


def generate_seo_metadata(topic: str, existing_title: str | None = None) -> dict:
    client = _get_client()
    user_text = f"Video topic / outline:\n{topic}"
    if existing_title:
        user_text += f"\n\nCurrent working title (optimise or improve on this if useful): {existing_title}"

    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=2048,
        system=SEO_SYSTEM_PROMPT,
        output_config={
            "effort": "medium",
            "format": {"type": "json_schema", "schema": SEO_METADATA_SCHEMA},
        },
        messages=[{"role": "user", "content": user_text}],
    )

    if response.stop_reason == "refusal":
        raise LLMRefusalError("The request was declined by content safety checks.")

    text = "".join(block.text for block in response.content if block.type == "text")
    return json.loads(text)
