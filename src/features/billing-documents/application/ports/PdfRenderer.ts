export interface PdfRenderer {
  renderToPdf(html: string): Promise<Buffer>;
}
