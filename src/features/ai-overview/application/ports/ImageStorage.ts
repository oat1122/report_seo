export interface SavedImage {
  url: string;
  absolutePath: string;
}

export interface ImageStorage {
  validateAndWrite(files: File[]): Promise<SavedImage[]>;
  removeByAbsolutePath(absolutePath: string): Promise<void>;
  removeByUrl(url: string): Promise<void>;
}
