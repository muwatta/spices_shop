const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PAYMENT_PROOF_TYPES = new Set(["application/pdf", ...IMAGE_TYPES]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024;

export function validateUpload(
  file: File,
  allowedTypes: Set<string>,
  maxBytes: number,
): string | null {
  if (!allowedTypes.has(file.type)) return "Unsupported file type.";
  if (file.size <= 0 || file.size > maxBytes) return "File is empty or too large.";
  return null;
}

export function validateImageUpload(file: File): string | null {
  return validateUpload(file, IMAGE_TYPES, MAX_IMAGE_BYTES);
}

export function validatePaymentProofUpload(file: File): string | null {
  return validateUpload(file, PAYMENT_PROOF_TYPES, MAX_PAYMENT_PROOF_BYTES);
}

export function getSafeExtension(file: File): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };
  return extensions[file.type] ?? "bin";
}
