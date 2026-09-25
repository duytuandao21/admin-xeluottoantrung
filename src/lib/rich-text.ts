const ALLOWED_TAGS = new Set(['p', 'div', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'li', 'a', 'img']);
const BLOCKED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'form', 'input', 'button']);

export function sanitizeRichText(html: string): string {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const safeDocument = document.implementation.createHTMLDocument('');
  const result = safeDocument.createElement('div');

  function clean(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) return safeDocument.createTextNode(node.textContent || '');
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const source = node as Element;
    const tag = source.tagName.toLowerCase();
    if (BLOCKED_TAGS.has(tag)) return null;

    if (tag === 'img') {
      const src = source.getAttribute('src') || '';
      if (!/^(https?:\/\/|\/[^/])/i.test(src) || src.length > 2_000) return null;
      const image = safeDocument.createElement('img');
      image.setAttribute('src', src);
      image.setAttribute('alt', source.getAttribute('alt') || '');
      return image;
    }

    const target = ALLOWED_TAGS.has(tag) ? safeDocument.createElement(tag) : safeDocument.createDocumentFragment();
    if (tag === 'a' && target instanceof Element) {
      const href = source.getAttribute('href') || '';
      if (/^(https?:\/\/|mailto:|tel:|\/[^/]|#)/i.test(href)) {
        target.setAttribute('href', href);
        target.setAttribute('target', '_blank');
        target.setAttribute('rel', 'noopener noreferrer');
      }
    }
    for (const child of Array.from(source.childNodes)) {
      const cleaned = clean(child);
      if (cleaned) target.appendChild(cleaned);
    }
    return target;
  }

  for (const child of Array.from(parsed.body.childNodes)) {
    const cleaned = clean(child);
    if (cleaned) result.appendChild(cleaned);
  }
  return result.innerHTML;
}

export function hasRichTextContent(html: string): boolean {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  return Boolean(parsed.body.textContent?.trim() || parsed.body.querySelector('img'));
}

export function richTextPreview(html: string, maxLength = 80): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
