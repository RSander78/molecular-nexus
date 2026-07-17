export function openPrintWindow(html: string): void {
  const w = window.open("", "_blank");
  w?.document.write(html);
  w?.document.close();
  w?.print();
}

export function buildReportHtml(title: string, heading: string, body: string): string {
  return `<html><head><title>${title}</title><style>body{font-family:'IBM Plex Sans',sans-serif;padding:40px;max-width:800px;margin:0 auto}</style></head><body><h1>${heading}</h1>${body}</body></html>`;
}

export function printReport(title: string, heading: string, body: string): void {
  openPrintWindow(buildReportHtml(title, heading, body));
}
