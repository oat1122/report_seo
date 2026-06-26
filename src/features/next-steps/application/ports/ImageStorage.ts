// Port — application นิยาม, infrastructure implement (rule 09)
// ห้าม import ข้าม feature → ใช้สำเนา local แทน ai-overview/ImageStorage

export interface SavedImage {
  url: string
  absolutePath: string
}

export interface ImageStorage {
  validateAndWrite(files: File[]): Promise<SavedImage[]>
  removeByAbsolutePath(absolutePath: string): Promise<void>
  removeByUrl(url: string): Promise<void>
}
