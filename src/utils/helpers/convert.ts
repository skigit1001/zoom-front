export async function blobToBase64(blob: Blob): Promise<string | ArrayBuffer> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export async function blobUrlToBase64(url: string): Promise<string | ArrayBuffer> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return blobToBase64(blob);
  } catch (err) {
    console.error(err);
  }
}
