import { useMemo, useState } from "react";

/** Original JSON shown at most 64 KiB of UTF-8 text at a time, split on character boundaries, so a large
 * record never becomes one giant DOM text node. */
export function PagedJson({ value, className, title, noun }: { value: unknown; className: string; title: string; noun: string }) {
  const pages = useMemo(() => {
    const bytes = new TextEncoder().encode(JSON.stringify(value, null, 2)),
      result: string[] = [],
      decoder = new TextDecoder("utf-8", { fatal: true });
    for (let offset = 0; offset < bytes.length; ) {
      let end = Math.min(offset + 65536, bytes.length);
      while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
      result.push(decoder.decode(bytes.slice(offset, end)));
      offset = end;
    }
    return result;
  }, [value]);
  const [page, setPage] = useState(0);
  return (
    <div className={className}>
      <p>
        {title} · page {page + 1} of {pages.length} · up to 64 KiB of UTF-8 text per page
      </p>
      <pre>{pages[page]}</pre>
      <div className="actions">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Previous {noun} page
        </button>
        <button disabled={page + 1 === pages.length} onClick={() => setPage(page + 1)}>
          Next {noun} page
        </button>
      </div>
    </div>
  );
}
