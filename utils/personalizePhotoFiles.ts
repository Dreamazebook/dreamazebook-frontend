export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function isPersonalizeCropResult(
  value: File | { croppedFile: File; originalFile: File },
): value is { croppedFile: File; originalFile: File } {
  return Boolean(value && typeof value === 'object' && 'croppedFile' in value && 'originalFile' in value);
}
