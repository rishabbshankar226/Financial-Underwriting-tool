from __future__ import annotations

from collections.abc import Sequence
from decimal import Decimal

import pytest

ReferenceNumber = Decimal | str | int | float


def wire_decimal(value: object) -> Decimal:
    assert isinstance(value, str), f"Financial JSON values must be decimal strings: {value!r}"
    number = Decimal(value)
    assert number.is_finite(), f"Financial JSON values must be finite: {value!r}"
    return number


def decimal_approx(
    expected: ReferenceNumber | Sequence[ReferenceNumber],
    *,
    rel: ReferenceNumber = "1e-6",
    abs: ReferenceNumber = "1e-12",
) -> object:
    reference = (
        [Decimal(str(value)) for value in expected]
        if isinstance(expected, (list, tuple))
        else Decimal(str(expected))
    )
    return pytest.approx(reference, rel=Decimal(str(rel)), abs=Decimal(str(abs)))
