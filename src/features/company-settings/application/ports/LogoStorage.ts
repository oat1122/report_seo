export interface SavedLogo {
  url: string
  absolutePath: string
}

export interface LogoStorage {
  validateAndWrite(file: File): Promise<SavedLogo>
  removeByAbsolutePath(absolutePath: string): Promise<void>
}
