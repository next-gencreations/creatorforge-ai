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


CLIPS_SYSTEM_PROMPT = (
    "You are the AI Clip Generator inside CreatorForge AI. Given a video transcript, identify "
    "the moments most likely to work as standalone short-form clips (TikTok, YouTube Shorts, "
    "Instagram/Facebook Reels): strong hooks, punchlines, surprising claims, emotional peaks, "
    "quotable lines, or self-contained actionable tips. For each candidate, quote the exact "
    "text from the transcript verbatim, briefly explain why it would grab attention, suggest "
    "a short clip title, and write a punchy platform caption with 2-4 relevant hashtags. If "
    "the transcript includes timing markers (e.g. 'mm:ss' or SRT-style cues), extract the "
    "approximate timestamp range for that quote as timestamp_hint; if the transcript has no "
    "timing information, set timestamp_hint to null — never invent a timestamp. Give each "
    "candidate a shareability score from 0-100 reflecting your qualitative assessment of "
    "standalone appeal — this is an AI estimate, not a prediction of real view counts, "
    "engagement, or platform algorithm behaviour. Return 3-6 candidates ordered by score "
    "descending."
)

CLIPS_SCHEMA = {
    "type": "object",
    "properties": {
        "clips": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "quote": {"type": "string"},
                    "timestamp_hint": {"anyOf": [{"type": "string"}, {"type": "null"}]},
                    "reason": {"type": "string"},
                    "suggested_title": {"type": "string"},
                    "platform_caption": {"type": "string"},
                    "score": {"type": "number"},
                },
                "required": ["quote", "timestamp_hint", "reason", "suggested_title", "platform_caption", "score"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["clips"],
    "additionalProperties": False,
}


def find_viral_clips(transcript: str) -> list[dict]:
    client = _get_client()

    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=3072,
        system=CLIPS_SYSTEM_PROMPT,
        output_config={
            "effort": "medium",
            "format": {"type": "json_schema", "schema": CLIPS_SCHEMA},
        },
        messages=[{"role": "user", "content": f"Transcript:\n{transcript}"}],
    )

    if response.stop_reason == "refusal":
        raise LLMRefusalError("The request was declined by content safety checks.")

    text = "".join(block.text for block in response.content if block.type == "text")
    clips = json.loads(text)["clips"]
    if not clips:
        raise RuntimeError("The model returned no clip candidates.")
    return clips


CAPTIONS_SYSTEM_PROMPT = (
    "You are the AI Caption Generator inside CreatorForge AI. Given a video transcript or "
    "script, split it into caption cues suitable for on-screen subtitles: each cue at most 2 "
    "lines, at most roughly 42 characters per line, breaking at natural phrase boundaries — "
    "never mid-word. Preserve the original meaning and tone exactly; do not summarise or add "
    "commentary. If a target caption language is given that differs from the transcript's "
    "language, translate naturally and idiomatically rather than word-for-word. If emoji "
    "style is requested, add a relevant emoji to some cues where it fits naturally — don't "
    "force one onto every line. Return the cues in order, covering the entire transcript."
)

CAPTIONS_SCHEMA = {
    "type": "object",
    "properties": {
        "cues": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["cues"],
    "additionalProperties": False,
}


def generate_caption_cues(transcript: str, language: str, emoji: bool) -> list[str]:
    client = _get_client()
    user_text = f"Transcript:\n{transcript}\n\nTarget caption language: {language}."
    user_text += (
        " Style: emoji captions — naturally weave in relevant emoji where it fits."
        if emoji
        else " Style: classic subtitles — plain text, no emoji."
    )

    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=4096,
        system=CAPTIONS_SYSTEM_PROMPT,
        output_config={
            "effort": "medium",
            "format": {"type": "json_schema", "schema": CAPTIONS_SCHEMA},
        },
        messages=[{"role": "user", "content": user_text}],
    )

    if response.stop_reason == "refusal":
        raise LLMRefusalError("The request was declined by content safety checks.")

    text = "".join(block.text for block in response.content if block.type == "text")
    cues = json.loads(text)["cues"]
    if not cues:
        raise RuntimeError("The model returned no caption cues.")
    return cues


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


PUBLISHING_SYSTEM_PROMPT = (
    "You are the AI Publishing Hub inside CreatorForge AI. Given one piece of source content "
    "(a video title/description or a caption) and a list of target platforms, adapt it into a "
    "tailored version for each platform, respecting that platform's real conventions: "
    "YouTube — an SEO-friendly title plus a longer description; TikTok — a short, casual "
    "caption under roughly 150 characters with a few trending-style hashtags; Instagram — a "
    "caption with a warmer tone and hashtags at the end; Facebook — a slightly longer, "
    "conversational post; X — must fit within 280 characters total including hashtags, 1-2 "
    "hashtags max; LinkedIn — a professional tone, minimal emoji, can run longer; Pinterest — "
    "a keyword-rich pin description under 500 characters; Twitch — a short, hype panel/stream "
    "title style. For each platform, also give a one-sentence note on what you adapted and "
    "why. Return exactly one entry per requested platform, in the same order given."
)

PUBLISHING_SCHEMA = {
    "type": "object",
    "properties": {
        "versions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "platform": {"type": "string"},
                    "text": {"type": "string"},
                    "notes": {"type": "string"},
                },
                "required": ["platform", "text", "notes"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["versions"],
    "additionalProperties": False,
}


def optimize_for_platforms(content: str, platforms: list[str]) -> list[dict]:
    client = _get_client()
    user_text = f"Source content:\n{content}\n\nTarget platforms: {', '.join(platforms)}."

    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=2048,
        system=PUBLISHING_SYSTEM_PROMPT,
        output_config={
            "effort": "medium",
            "format": {"type": "json_schema", "schema": PUBLISHING_SCHEMA},
        },
        messages=[{"role": "user", "content": user_text}],
    )

    if response.stop_reason == "refusal":
        raise LLMRefusalError("The request was declined by content safety checks.")

    text = "".join(block.text for block in response.content if block.type == "text")
    versions = json.loads(text)["versions"]
    if not versions:
        raise RuntimeError("The model returned no platform versions.")
    return versions


GROWTH_COACH_SYSTEM_PROMPT = (
    "You are the AI Growth Coach inside CreatorForge AI — a personal YouTube/content "
    "strategist. The creator will describe their channel: niche, recent video topics, what's "
    "working, what isn't, and any questions they have. Give tailored, actionable coaching: a "
    "short diagnosis of what's likely helping or hurting based specifically on what they "
    "described (not generic platitudes), 5-8 concrete content ideas tailored to their niche, "
    "3-5 prioritised next actions, and one general best-practice note on upload timing. You do "
    "not have access to their real analytics, live trend data, or competitor data — never "
    "invent specific numbers (view counts, percentages, competitor stats, exact best-time-to-"
    "post data); ground every recommendation in what the creator actually told you or in "
    "general, well-known platform best practice, and say so plainly if a claim would need "
    "analytics access CreatorForge doesn't have."
)

GROWTH_COACH_SCHEMA = {
    "type": "object",
    "properties": {
        "diagnosis": {"type": "string"},
        "content_ideas": {"type": "array", "items": {"type": "string"}},
        "priorities": {"type": "array", "items": {"type": "string"}},
        "upload_timing_tip": {"type": "string"},
    },
    "required": ["diagnosis", "content_ideas", "priorities", "upload_timing_tip"],
    "additionalProperties": False,
}


def get_growth_coach_advice(context: str) -> dict:
    client = _get_client()

    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=2048,
        system=GROWTH_COACH_SYSTEM_PROMPT,
        output_config={
            "effort": "medium",
            "format": {"type": "json_schema", "schema": GROWTH_COACH_SCHEMA},
        },
        messages=[{"role": "user", "content": context}],
    )

    if response.stop_reason == "refusal":
        raise LLMRefusalError("The request was declined by content safety checks.")

    text = "".join(block.text for block in response.content if block.type == "text")
    return json.loads(text)


COMMENTS_SYSTEM_PROMPT = (
    "You are the AI Comment Manager inside CreatorForge AI. For each comment provided, "
    "analyse its sentiment (positive, neutral, or negative), determine whether it looks like "
    "spam or a scam (promotional links, crypto/followers scams, unrelated advertising, "
    "bot-like phrasing), and — for genuine, non-spam comments only — draft a short, natural "
    "reply in a warm, creator-appropriate voice a YouTuber might actually post (1-2 "
    "sentences, no corporate tone). Set suggested_reply to null for anything flagged as spam. "
    "Return exactly one result per input comment, in the same order given."
)

COMMENTS_SCHEMA = {
    "type": "object",
    "properties": {
        "results": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "sentiment": {"type": "string", "enum": ["positive", "neutral", "negative"]},
                    "is_spam": {"type": "boolean"},
                    "suggested_reply": {"anyOf": [{"type": "string"}, {"type": "null"}]},
                },
                "required": ["sentiment", "is_spam", "suggested_reply"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["results"],
    "additionalProperties": False,
}


def moderate_comments(comments: list[str]) -> list[dict]:
    client = _get_client()
    numbered = "\n".join(f"{i + 1}. {c}" for i, c in enumerate(comments))

    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=2048,
        system=COMMENTS_SYSTEM_PROMPT,
        output_config={
            "effort": "medium",
            "format": {"type": "json_schema", "schema": COMMENTS_SCHEMA},
        },
        messages=[{"role": "user", "content": f"Comments:\n{numbered}"}],
    )

    if response.stop_reason == "refusal":
        raise LLMRefusalError("The request was declined by content safety checks.")

    text = "".join(block.text for block in response.content if block.type == "text")
    results = json.loads(text)["results"]
    if len(results) != len(comments):
        raise RuntimeError("The model returned a different number of results than comments submitted.")
    return results


SPONSOR_REPORT_SYSTEM_PROMPT = (
    "You are the AI Sponsor Manager inside CreatorForge AI. Given a creator's current sponsor "
    "deals (name, deliverable, deadline, amount, status) and a pre-computed total confirmed "
    "value, write a clear, professional sponsorship report the creator could send to a manager "
    "or keep for their own records. Summarise what's in progress, what's overdue or due soon, "
    "and what's been paid. Use the exact numbers and dates given — never invent or round "
    "figures. Keep it concise: a short overview paragraph followed by grouped bullet points."
)


def generate_sponsor_report(sponsors: list[dict], total_value: float) -> str:
    client = _get_client()
    lines = [
        f"- {s['name']}: {s['deliverable']}, due {s['deadline'] or 'no deadline set'}, "
        f"${s['amount']:,.2f}, status: {s['status']}"
        for s in sponsors
    ]
    user_text = f"Total confirmed value across all deals: ${total_value:,.2f}\n\nDeals:\n" + "\n".join(lines)

    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=1536,
        system=SPONSOR_REPORT_SYSTEM_PROMPT,
        output_config={"effort": "medium"},
        messages=[{"role": "user", "content": user_text}],
    )

    if response.stop_reason == "refusal":
        raise LLMRefusalError("The request was declined by content safety checks.")

    return "\n".join(block.text for block in response.content if block.type == "text").strip()
