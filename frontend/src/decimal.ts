/** Exact decimal transport and half-even presentation using integer arithmetic. */
type Parts = { coefficient: bigint; scale: number };
const decimalPattern = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/;
const TEN = 10n;

function parts(value: string): Parts {
  if (value.length > 256) throw new Error("Decimal exceeds the supported range.");
  const match = decimalPattern.exec(value);
  if (!match) throw new Error("Enter a finite decimal value.");
  const exponent = Number(match[5] ?? "0");
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 128)
    throw new Error("Decimal exponent exceeds the supported range.");
  const fraction = match[3] ?? match[4] ?? "";
  const coefficient = BigInt(`${match[1] === "-" ? "-" : ""}${match[2] ?? "0"}${fraction}`);
  return { coefficient, scale: fraction.length - exponent };
}
function text({ coefficient, scale }: Parts): string {
  if (coefficient === 0n) return "0";
  const sign = coefficient < 0n ? "-" : "";
  let digits = (coefficient < 0n ? -coefficient : coefficient).toString();
  if (scale <= 0) return sign + digits + "0".repeat(-scale);
  digits = digits.padStart(scale + 1, "0");
  return (sign + digits.slice(0, -scale) + "." + digits.slice(-scale)).replace(/0+$/, "").replace(/\.$/, "");
}
export function canonicalDecimal(value: string): string {
  return text(parts(value));
}
export function isDecimal(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try { parts(value); return true; } catch { return false; }
}
export function legacyDecimal(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return canonicalDecimal(String(value));
  if (typeof value === "string") return canonicalDecimal(value);
  throw new Error("Financial values must be finite decimals.");
}
export function shiftDecimal(value: string, places: number): string {
  if (!Number.isSafeInteger(places) || Math.abs(places) > 30) throw new Error("Unsupported decimal shift.");
  const parsed = parts(value);
  return text({ ...parsed, scale: parsed.scale - places });
}
export function compareDecimal(left: string, right: string): -1 | 0 | 1 {
  const a = parts(left), b = parts(right), scale = Math.max(a.scale, b.scale);
  const first = a.coefficient * TEN ** BigInt(scale - a.scale);
  const second = b.coefficient * TEN ** BigInt(scale - b.scale);
  return first < second ? -1 : first > second ? 1 : 0;
}
export function decimalEqual(left: unknown, right: unknown): boolean {
  try { return compareDecimal(legacyDecimal(left), legacyDecimal(right)) === 0; } catch { return false; }
}
export function inputDecimal(value: string): string {
  const normalized = canonicalDecimal(value), parsed = parts(value);
  const digits = (parsed.coefficient < 0n ? -parsed.coefficient : parsed.coefficient).toString();
  if (digits.length > 34 || compareDecimal(normalized.startsWith("-") ? normalized.slice(1) : normalized, "1e30") > 0 ||
      (parsed.coefficient !== 0n && compareDecimal(normalized.startsWith("-") ? normalized.slice(1) : normalized, "1e-30") < 0))
    throw new Error("Financial input exceeds 34 digits or the supported range [1e-30, 1e30].");
  return normalized;
}
export function formatDecimal(value: string, precision = 2, group = true): string {
  if (!Number.isInteger(precision) || precision < 0 || precision > 30) throw new Error("Unsupported display precision.");
  const parsed = parts(value), negative = parsed.coefficient < 0n;
  let magnitude = negative ? -parsed.coefficient : parsed.coefficient;
  if (parsed.scale > precision) {
    const divisor = TEN ** BigInt(parsed.scale - precision), remainder = magnitude % divisor;
    magnitude /= divisor;
    if (remainder * 2n > divisor || remainder * 2n === divisor && magnitude % 2n === 1n) magnitude++;
  } else magnitude *= TEN ** BigInt(precision - parsed.scale);
  const digits = magnitude.toString().padStart(precision + 1, "0");
  let integer = precision ? digits.slice(0, -precision) : digits;
  if (group) integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative && magnitude !== 0n ? "-" : ""}${integer}${precision ? "." + digits.slice(-precision) : ""}`;
}

/** Preserve every input numeric token before JSON.parse can round a large balance. */
export function parseInputJson(source: string): unknown {
  let encoded = "", quoted = false, escaped = false;
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (quoted) {
      encoded += character;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') quoted = false;
    } else if (character === '"') {
      quoted = true;
      encoded += character;
    } else if (character === "-" || /[0-9]/.test(character)) {
      const token = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(source.slice(index));
      if (!token) throw new Error("Invalid JSON number.");
      encoded += JSON.stringify(token[0]);
      index += token[0].length - 1;
    } else encoded += character;
  }
  return JSON.parse(encoded) as unknown;
}
