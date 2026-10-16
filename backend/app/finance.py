"""Exact numeric boundaries, isolated calculation contexts, and reporting rules."""

from __future__ import annotations

import re
from collections.abc import Callable, Iterator, Sequence
from contextlib import contextmanager
from decimal import (
    ROUND_HALF_EVEN,
    Context,
    Decimal,
    DecimalException,
    DivisionByZero,
    InvalidOperation,
    Overflow,
    Underflow,
    localcontext,
)
from functools import wraps
from typing import Annotated, ParamSpec, TypeVar

from pydantic import BeforeValidator, PlainSerializer

ZERO = Decimal("0")
ONE = Decimal("1")
MONTHS_PER_YEAR = Decimal("12")
BASIS_POINTS_PER_UNIT = Decimal("10000")
MAX_TERM_MONTHS = 12_000
INPUT_DIGITS = 34
MAX_INPUT = Decimal("1e30")
MIN_INPUT = Decimal("1e-30")
CALCULATION_PRECISION = 96
DECIMAL_PATTERN = re.compile(r"^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$")

P = ParamSpec("P")
T = TypeVar("T")
NumericInput = Decimal | str | int | float


@contextmanager
def financial_context() -> Iterator[Context]:
    context = Context(prec=CALCULATION_PRECISION, rounding=ROUND_HALF_EVEN, Emin=-1024, Emax=1024)
    for trap in (DivisionByZero, InvalidOperation, Overflow, Underflow):
        context.traps[trap] = True
    with localcontext(context) as active:
        yield active


def calculation(function: Callable[P, T]) -> Callable[P, T]:
    @wraps(function)
    def guarded(*args: P.args, **kwargs: P.kwargs) -> T:
        try:
            with financial_context():
                return function(*args, **kwargs)
        except DecimalException as exc:
            raise ValueError("Inputs exceed the supported finite calculation range") from exc

    return guarded


def as_decimal(value: object) -> Decimal:
    if isinstance(value, bool) or not isinstance(value, (Decimal, str, int, float)):
        raise ValueError("Financial values must be finite decimal values, not boolean")
    text = str(value)
    if len(text) > 256 or not DECIMAL_PATTERN.fullmatch(text):
        raise ValueError("Financial values must be finite decimal values")
    try:
        number = value if isinstance(value, Decimal) else Decimal(text)
        if not number.is_finite():
            raise ValueError("Financial values must be finite")
        if len(number.as_tuple().digits) > INPUT_DIGITS:
            raise ValueError("Financial input exceeds 34 significant digits")
        magnitude = number.copy_abs()
        if magnitude > MAX_INPUT or (number != ZERO and magnitude < MIN_INPUT):
            raise ValueError("Financial input exceeds the supported finite range [1e-30, 1e30]")
        return ZERO if number == ZERO else number
    except DecimalException as exc:
        raise ValueError("Financial values must be finite") from exc


def finite_result(value: object) -> Decimal:
    if isinstance(value, bool) or not isinstance(value, (Decimal, int)):
        raise ValueError("Calculations require decimal values")
    result = value if isinstance(value, Decimal) else Decimal(str(value))
    if not result.is_finite() or (result != ZERO and not -128 <= result.adjusted() <= 128):
        raise ValueError("Inputs exceed the supported finite calculation range")
    return result


def decimal_text(value: Decimal) -> str:
    finite_result(value)
    if value == ZERO:
        return "0"
    text = format(value, "f")
    return text.rstrip("0").rstrip(".") if "." in text else text


def decimal_scalar(value: object) -> object:
    if isinstance(value, bool) or value is None:
        return value
    if (
        isinstance(value, (Decimal, int, float))
        or isinstance(value, str)
        and DECIMAL_PATTERN.fullmatch(value)
    ):
        # Calculation outputs can exceed the tighter input precision bound.
        if isinstance(value, (Decimal, int)):
            return finite_result(value)
        if len(str(value)) > 256:
            raise ValueError("Calculated decimal exceeds the supported range")
        return finite_result(Decimal(str(value)))
    return value


def exact_decimal(value: object) -> Decimal:
    if isinstance(value, float):
        raise ValueError("V2 financial values require decimal strings, Decimal, or exact integers")
    return as_decimal(value)


def legacy_decimal_values(value: object) -> object:
    """Interpret already-decoded v1 numbers once; retained JSON never uses this path."""
    if isinstance(value, float):
        return as_decimal(value)
    if isinstance(value, dict):
        return {key: legacy_decimal_values(item) for key, item in value.items()}
    if isinstance(value, list):
        return [legacy_decimal_values(item) for item in value]
    return value


ExactFinancialDecimal = Annotated[
    Decimal, BeforeValidator(exact_decimal), PlainSerializer(decimal_text, return_type=str, when_used="json")
]


FinancialDecimal = Annotated[
    Decimal, BeforeValidator(as_decimal), PlainSerializer(decimal_text, return_type=str, when_used="json")
]
ResultDecimal = Annotated[
    Decimal, BeforeValidator(decimal_scalar), PlainSerializer(decimal_text, return_type=str, when_used="json")
]
ReportedDecimal = Annotated[
    Decimal,
    BeforeValidator(decimal_scalar),
    PlainSerializer(lambda value: format(value, "f"), return_type=str, when_used="json"),
]
Scalar = Annotated[ResultDecimal | str | bool, BeforeValidator(decimal_scalar)]
MetricValue = Annotated[ResultDecimal | str | None, BeforeValidator(decimal_scalar)]
ReportedValue = Annotated[ReportedDecimal | str | None, BeforeValidator(decimal_scalar)]


@calculation
def quantize(value: Decimal, precision: int = 2) -> Decimal:
    if not 0 <= precision <= 30:
        raise ValueError("Unsupported reporting precision")
    return finite_result(value).quantize(Decimal("1").scaleb(-precision), rounding=ROUND_HALF_EVEN)


@calculation
def decimal_sum(values: Sequence[Decimal]) -> Decimal:
    return finite_result(sum(values, ZERO))


@calculation
def reconcile(values: Sequence[Decimal], total: Decimal | None = None, precision: int = 2) -> list[Decimal]:
    target = quantize(decimal_sum(values) if total is None else total, precision)
    rounded = [quantize(value, precision) for value in values]
    quantum = Decimal("1").scaleb(-precision)
    delta = int((target - decimal_sum(rounded)) / quantum)
    if not values:
        if target != ZERO:
            raise ValueError("An empty reporting group must have a zero total")
        return []
    if abs(delta) > len(values):
        raise ValueError("Reporting residual exceeds one unit per constituent")
    residuals = [value - report for value, report in zip(values, rounded, strict=True)]
    order = sorted(
        range(len(values)), key=lambda index: (-residuals[index] if delta > 0 else residuals[index], index)
    )
    for index in order[: abs(delta)]:
        rounded[index] += quantum if delta > 0 else -quantum
    if decimal_sum(rounded) != target:
        raise ValueError("Reporting constituents do not reconcile")
    return rounded
