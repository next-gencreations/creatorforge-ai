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
