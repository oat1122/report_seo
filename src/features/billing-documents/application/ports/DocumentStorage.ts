export interface DocumentStorage {
  savePdf(buffer: Buffer, filename: string): Promise<string>
  deletePdf(url: string): Promise<void>
  saveUpload(file: File): Promise<{ url: string; fileName: string }>
}
