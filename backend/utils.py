from typing import List, Optional

def _tags_to_str(tags: List[str]) -> str:
    return ",".join(tags)

def _str_to_tags(s: Optional[str]) -> List[str]:
    if not s:
        return []
    return [t.strip() for t in s.split(",") if t.strip()]