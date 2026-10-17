"""Typed contract failures: the original message stays public, a code and pointer locate it."""

from __future__ import annotations


class ContractValueError(ValueError):
    """A ValueError whose text is unchanged; ``pointer`` is relative to the model that raised it."""

    def __init__(
        self,
        message: str,
        code: str = "invalid_value",
        *,
        pointer: str | None = None,
        limit: str | None = None,
    ) -> None:
        super().__init__(message)
        self.code, self.pointer, self.limit = code, pointer, limit


def escape_pointer_token(token: str | int) -> str:
    return str(token).replace("~", "~0").replace("/", "~1")


def split_pointer(pointer: str) -> list[str]:
    if not pointer:
        return []
    if not pointer.startswith("/"):
        raise ValueError("A JSON Pointer must be empty or start with '/'")
    return [part.replace("~1", "/").replace("~0", "~") for part in pointer[1:].split("/")]
