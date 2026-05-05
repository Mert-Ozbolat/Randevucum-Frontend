import { api } from '@/lib/api';

const IMAGEKIT_UPLOAD_ENDPOINT = 'https://upload.imagekit.io/api/v1/files/upload';

export type ImageKitUploadOptions = {
  /** ImageKit klasörü, örn. /business-covers */
  folder?: string;
};

type AuthPayload = {
  status: string;
  message: string;
  data: {
    token: string;
    expire: number;
    signature: string;
    publicKey: string;
    urlEndpoint: string;
  };
};

function assertEnv() {
  const pub = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY?.trim();
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.trim();
  if (!pub || !endpoint) {
    throw new Error(
      'ImageKit istemci yapılandırması eksik. frontend/.env.local içine NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ve NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ekleyin.'
    );
  }
}

/**
 * ImageKit’e doğrudan yükleme; imza API üzerinden alınır (JWT gerekir).
 * Dönüş: kalıcı HTTPS görsel URL’si.
 */
export async function uploadFileToImageKit(file: File, options?: ImageKitUploadOptions): Promise<string> {
  assertEnv();

  const { data: body } = await api.get<AuthPayload>('/upload/imagekit-auth');
  const auth = body.data;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  formData.append('publicKey', auth.publicKey);
  formData.append('signature', auth.signature);
  formData.append('expire', String(auth.expire));
  formData.append('token', auth.token);
  formData.append('useUniqueFileName', 'true');
  if (options?.folder) {
    const folder = options.folder.startsWith('/') ? options.folder : `/${options.folder}`;
    formData.append('folder', folder);
  }

  const res = await fetch(IMAGEKIT_UPLOAD_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  const json = (await res.json()) as { message?: string; help?: string; url?: string };

  if (!res.ok) {
    const msg = json.message || json.help || `Yükleme başarısız (${res.status})`;
    throw new Error(msg);
  }

  if (!json.url) {
    throw new Error('ImageKit yanıtında URL yok.');
  }

  return json.url;
}

export function isImageKitReady(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY?.trim() &&
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.trim()
  );
}
