import DOMPurify from "dompurify";

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "br", "span", "code", "a"],
    ALLOWED_ATTR: ["class", "href", "target", "rel"],
  });
}
