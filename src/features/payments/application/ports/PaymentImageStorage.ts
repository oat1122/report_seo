export interface SavedPaymentImage {
  url: string;
  absolutePath: string;
}

export interface PaymentImageStorage {
  validateAndWrite(file: File): Promise<SavedPaymentImage>;
  removeByAbsolutePath(absolutePath: string): Promise<void>;
}
