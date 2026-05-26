export interface SavedContractFile {
  url: string;
  absolutePath: string;
  fileName: string;
}

export interface ContractFileStorage {
  validateAndWrite(file: File): Promise<SavedContractFile>;
  removeByAbsolutePath(absolutePath: string): Promise<void>;
}
