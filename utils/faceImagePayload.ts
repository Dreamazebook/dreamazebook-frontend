/**
 * 预览 / regenerate-preview 面部图字段（与后端校验一致）：
 * - 根级 `face_images`：孩子照片数组（必填）
 * - `attributes.face_images`：同上（孩子照片）
 * - `attributes.mom_image`：**数组**，且最多 1 条（PICBOOK_MOM 妈妈照）
 *
 * PICBOOK_MOM：`photos[0]` = Mom，`photos[1]` = Child（仅孩子进入 face_images）。
 */

export const PICBOOK_PREVIEWS_DISK = 'picbook_previews';

export type PreviewFaceEntry =
  | {
      filename: string;
      mime: string;
      data: string;
    }
  | {
      path: string;
      disk: string;
    };

export function toPreviewFaceEntry(raw: string, idx: number): PreviewFaceEntry {
  const s = String(raw || '').trim();
  if (!s) {
    return {
      filename: `face_${idx + 1}.jpg`,
      mime: 'image/jpeg',
      data: '',
    };
  }
  if (s.startsWith('data:')) {
    return {
      filename: `face_${idx + 1}.jpg`,
      mime: s.slice(5, s.indexOf(';')).replace('data:', '') || 'image/jpeg',
      data: s,
    };
  }
  return {
    path: toStorageRelativePath(s),
    disk: PICBOOK_PREVIEWS_DISK,
  };
}

export function toStorageRelativePath(input: string): string {
  const s = String(input || '').trim();
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      return u.pathname.replace(/^\/+/, '');
    } catch {
      return s.replace(/^\/+/, '');
    }
  }
  return s.replace(/^\/+/, '');
}

/** 根级 face_images + attributes 内 face_images / mom_image（数组，mom 最多 1 条） */
export function buildPicbookPreviewFacePayload(
  bookId: string | undefined | null,
  rawPhotos: string[],
): {
  face_images: PreviewFaceEntry[];
  faceAttributes: { face_images: PreviewFaceEntry[]; mom_image?: PreviewFaceEntry[] };
} {
  const list = (rawPhotos || []).map(String).filter(Boolean);
  const u = String(bookId || '').trim().toUpperCase();

  if (u === 'PICBOOK_MOM' && list.length >= 2) {
    const mom = toPreviewFaceEntry(list[0], 0);
    const child = toPreviewFaceEntry(list[1], 0);
    return {
      face_images: [child],
      faceAttributes: {
        face_images: [child],
        mom_image: [mom],
      },
    };
  }

  const entries = list.map((r, i) => toPreviewFaceEntry(r, i));
  return {
    face_images: entries,
    faceAttributes: { face_images: entries },
  };
}
