import { uploadData, getUrl } from 'aws-amplify/storage';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGES = 5;
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function generateImageKey(userId: string, filename: string): string {
  const uuid = crypto.randomUUID();
  return `public/${userId}/${uuid}-${filename}`;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: { type: string; size: number }): FileValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP.`,
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 5 MB limit.`,
    };
  }
  return { valid: true };
}

export async function uploadImage(
  userId: string,
  file: File,
): Promise<string> {
  const key = generateImageKey(userId, file.name);
  await uploadData({
    path: key,
    data: file,
    options: {
      contentType: file.type,
    },
  });
  return key;
}

export async function getImageUrl(key: string): Promise<string> {
  const result = await getUrl({ path: key });
  return result.url.toString();
}
