/**
 * Export Combined Compliance & Analysis Report to PDF
 *
 * Renders report content in a hidden container, captures with html2pdf,
 * opens preview in new tab, and triggers download.
 * Includes all report sections: Overview & Charts, Image Comparison, All Issues, All Items.
 */

export interface ExportReportPdfOptions {
  /** Callback to render the PDF content into the given container. May return an unmount function. */
  renderContent: (container: HTMLElement) => void | (() => void);
  /** Optional filename for download */
  filename?: string;
}

/**
 * Export the report to PDF, open preview in new tab, and trigger download.
 */
export async function exportReportToPdf({
  renderContent,
  filename = "compliance-report.pdf",
}: ExportReportPdfOptions): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;

  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 800px;
    min-height: 100px;
    background: white;
    color: #1a1a1a;
    padding: 24px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    z-index: -1;
  `;
  document.body.appendChild(container);

  let unmount: (() => void) | undefined;

  try {
    const result = renderContent(container);
    if (typeof result === "function") unmount = result;

    // Wait for React to flush and Tabulator/async content to render
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const opt = {
      margin: 10,
      filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: true,
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] as const },
    };

    const worker = html2pdf().set(opt).from(container);
    const blob = await worker.outputPdf("blob");
    const url = URL.createObjectURL(blob);

    // Open preview in new tab
    window.open(url, "_blank", "noopener,noreferrer");

    // Trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    // Revoke URL after a delay to allow preview tab to load
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } finally {
    unmount?.();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}
