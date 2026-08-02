CHARS_PER_SECOND = 15.0
MIN_CUE_DURATION = 1.2
MAX_CUE_DURATION = 7.0
GAP_SECONDS = 0.15


def _format_timestamp(seconds: float) -> str:
    total_ms = max(0, round(seconds * 1000))
    hours, remainder = divmod(total_ms, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    secs, ms = divmod(remainder, 1_000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"


def build_srt(cues: list[str]) -> tuple[str, list[dict]]:
    """Turns caption text cues into timed items + an .srt file, using an estimated
    reading-speed heuristic (no real audio to sync against)."""
    current = 0.0
    items: list[dict] = []
    srt_blocks: list[str] = []

    for i, cue in enumerate(cues, start=1):
        char_count = len(cue.replace("\n", " "))
        duration = min(MAX_CUE_DURATION, max(MIN_CUE_DURATION, char_count / CHARS_PER_SECOND))
        start = current
        end = start + duration
        current = end + GAP_SECONDS

        items.append({"index": i, "start": round(start, 2), "end": round(end, 2), "text": cue})
        srt_blocks.append(f"{i}\n{_format_timestamp(start)} --> {_format_timestamp(end)}\n{cue}")

    return "\n\n".join(srt_blocks) + "\n", items
