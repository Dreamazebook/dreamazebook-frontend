const IMAGE_ATTRIBUTE_KEYS = ['face_images', 'mom_image', 'dad_image'];
const DAD_TEXT_VARIABLE_KEYS = ['dad_name', 'dad_question_1', 'dad_question_2', 'dad_question_3'];

/**
 * Extracts a browser-readable image source from the legacy preview image shape.
 *
 * Params: `entry` must be a data/blob URL string or an object containing one in `data`/`path`.
 * Returns: the local source string, or `null` when the value is a remote/stored image.
 * Side effects: none.
 * Failure: malformed values return `null` instead of throwing so callers can use the legacy API fallback.
 *
 * @param {unknown} entry
 * @returns {string | null}
 */
function getLocalImageSource(entry) {
  const raw =
    typeof entry === 'string'
      ? entry
      : entry && typeof entry === 'object' && 'data' in entry
        ? entry.data
        : entry && typeof entry === 'object' && 'path' in entry
          ? entry.path
          : null;
  const source = typeof raw === 'string' ? raw.trim() : '';
  return source.startsWith('data:') || source.startsWith('blob:') ? source : null;
}

/**
 * Collects image sources that can be migrated to V2 assets without downloading third-party URLs.
 *
 * Params: `payload` must be the legacy preview/render payload; supported named slots are mom/dad images.
 * Returns: local face/named source groups, or `null` when any image only has a stored path/remote URL.
 * Side effects: none.
 * Failure: malformed image arrays are treated as empty; mixed local/remote images force the safe legacy fallback.
 *
 * @param {Record<string, unknown>} payload
 * @returns {{ face: string[], named: Record<string, string[]> } | null}
 */
function collectLocalImageSources(payload) {
  const attributes = payload.attributes && typeof payload.attributes === 'object'
    ? payload.attributes
    : {};
  const faceEntries = Array.isArray(payload.face_images) ? payload.face_images : [];
  const namedEntries = Object.fromEntries(
    ['mom_image', 'dad_image'].map((key) => [
      key,
      Array.isArray(attributes[key]) ? attributes[key] : [],
    ]),
  );

  const allEntries = [...faceEntries, ...Object.values(namedEntries).flat()];
  // Why: V2 cannot mix asset IDs with legacy paths in one image source of truth.
  if (allEntries.some((entry) => getLocalImageSource(entry) === null)) {
    return null;
  }

  return {
    face: faceEntries.map(getLocalImageSource).filter(Boolean),
    named: Object.fromEntries(
      Object.entries(namedEntries)
        .map(([key, entries]) => [key, entries.map(getLocalImageSource).filter(Boolean)])
        .filter(([, entries]) => entries.length > 0),
    ),
  };
}

/**
 * Builds the V2 single-source preview contract after image assets are ready.
 *
 * Params: `payload` is a validated legacy request snapshot; `imageIds` must preserve its face/mom/dad slot order.
 * Returns: a contract_version=2 payload with business values stored only in attributes/images/text/metadata.
 * Side effects: none; the input objects are not mutated.
 * Failure: absent optional fields become empty objects/null values and are left for backend validation.
 *
 * @param {Record<string, unknown>} payload
 * @param {{ face: string[], named: Record<string, string[]> }} imageIds
 * @returns {Record<string, unknown>}
 */
export function buildPreviewV2Payload(payload, imageIds) {
  const attributes = {
    ...(payload.attributes && typeof payload.attributes === 'object' ? payload.attributes : {}),
  };
  const variables = {};

  // Why: image values must exist only under V2 `images`, never duplicated in attributes.
  for (const key of IMAGE_ATTRIBUTE_KEYS) {
    delete attributes[key];
  }
  // Why: Dad copy is text input, so move it to the canonical V2 variable namespace.
  for (const key of DAD_TEXT_VARIABLE_KEYS) {
    const value = attributes[key] ?? payload[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      variables[key] = value;
    }
    delete attributes[key];
  }
  // Edge case: legacy builders kept gender/birthday at the top level; V2 validation reads them from attributes.
  if (attributes.gender == null && payload.gender != null) {
    attributes.gender = payload.gender;
  }
  if (attributes.birthday == null && payload.birthday != null) {
    attributes.birthday = payload.birthday;
  }

  return {
    contract_version: 2,
    language: payload.language ?? 'en',
    attributes,
    images: {
      face: imageIds.face,
      named: imageIds.named,
    },
    text: {
      recipient_name: payload.full_name ?? null,
      giver_name: payload.giver_name ?? null,
      variables,
      pages: payload.texts && typeof payload.texts === 'object' ? payload.texts : {},
    },
    metadata: {
      relationship: payload.relationship ?? null,
    },
  };
}

/**
 * Reads a local data/blob URL into an uploadable browser Blob.
 *
 * Params: `source` must be a local data/blob URL collected by `collectLocalImageSources`.
 * Returns: the decoded non-empty image Blob.
 * Side effects: reads browser-managed URL data through `fetch`.
 * Failure: network/URL errors or empty data throw and abort preview generation.
 *
 * @param {string} source
 * @returns {Promise<Blob>}
 */
async function readLocalImageBlob(source) {
  const response = await fetch(source);
  // Edge case: revoked blob URLs and malformed data URLs must stop before presigning an empty asset.
  if (!response.ok) {
    throw new Error(`Unable to read selected image (${response.status})`);
  }
  const blob = await response.blob();
  if (blob.size <= 0) {
    throw new Error('Selected image is empty');
  }
  return blob;
}

/**
 * Computes the optional client SHA-256 used by the backend to reuse identical ready assets.
 *
 * Params: `blob` must contain the exact bytes that will be uploaded.
 * Returns: a lowercase 64-character digest, or `null` when Web Crypto is unavailable.
 * Side effects: reads the Blob into memory.
 * Failure: digest errors return `null`; upload correctness still relies on backend verification.
 *
 * @param {Blob} blob
 * @returns {Promise<string | null>}
 */
async function calculateBlobSha256(blob) {
  try {
    if (typeof crypto === 'undefined' || !crypto.subtle) return null;
    const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    // Edge case: browsers without SubtleCrypto can still upload; the backend computes the authoritative digest.
    return null;
  }
}

/**
 * Uploads one selected image through the backend presign/PUT/complete asset protocol.
 *
 * Params: `spuCode` is the preview-enabled SPU; `purpose` is `face` or `named`; `source` is a local URL.
 * Returns: the ready backend asset ID.
 * Side effects: calls the Dreamazebook API, uploads bytes to object storage, and completes asset validation.
 * Failure: any API, storage, or validation error is propagated and prevents sending a partial V2 render request.
 *
 * @param {string} spuCode
 * @param {'face' | 'named'} purpose
 * @param {string} source
 * @param {number} index
 * @returns {Promise<string>}
 */
async function uploadPreviewImageAsset(spuCode, purpose, source, index) {
  const blob = await readLocalImageBlob(source);
  const mimeType = blob.type || 'image/jpeg';
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const clientSha256 = await calculateBlobSha256(blob);
  const { fetchDreamazebookApi } = await import('./api.js');
  const presign = await fetchDreamazebookApi(
    `/products/${encodeURIComponent(spuCode)}/preview/image-assets/presign`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purpose,
        filename: `${purpose}-${index + 1}.${extension}`,
        mime_type: mimeType,
        size_bytes: blob.size,
        ...(clientSha256 ? { client_sha256: clientSha256 } : {}),
      }),
    },
  );
  const assetId = String(presign?.data?.asset_id || '');
  if (!assetId) {
    throw new Error('Image asset presign response is missing asset_id');
  }

  // Why: a matching ready asset skips both storage upload and complete verification.
  if (presign?.data?.upload_required) {
    const upload = presign?.data?.upload;
    if (!upload?.url) {
      throw new Error('Image asset presign response is missing upload URL');
    }
    const uploadHeaders = new Headers(upload.headers || {});
    if (!uploadHeaders.has('Content-Type')) uploadHeaders.set('Content-Type', mimeType);
    const uploadResponse = await fetch(upload.url, {
      method: upload.method || 'PUT',
      headers: uploadHeaders,
      body: blob,
    });
    if (!uploadResponse.ok) {
      throw new Error(`Image upload failed (${uploadResponse.status})`);
    }

    await fetchDreamazebookApi(
      `/products/${encodeURIComponent(spuCode)}/preview/image-assets/${encodeURIComponent(assetId)}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      },
    );
  }

  return assetId;
}

/**
 * Converts a legacy preview request to V2 by uploading all new local photos first.
 *
 * Params: `spuCode` must match the target product; `payload` is the complete legacy request; `uploadAsset` must return one ready asset ID.
 * Returns: a V2 asset-ID request for local selections, or the unchanged legacy payload for stored photos and unavailable V2 storage.
 * Side effects: local photos are uploaded sequentially so a guest session established by the first presign owns every asset.
 * Failure: the explicit IMAGE_ASSET_UPLOAD_UNAVAILABLE response falls back to legacy; all other upload/complete failures reject.
 *
 * @param {string} spuCode
 * @param {Record<string, unknown>} payload
 * @param {(spuCode: string, purpose: 'face' | 'named', source: string, index: number) => Promise<string>} uploadAsset
 * @returns {Promise<Record<string, unknown>>}
 */
export async function preparePreviewRenderPayload(spuCode, payload, uploadAsset = uploadPreviewImageAsset) {
  const sources = collectLocalImageSources(payload);
  if (!sources) {
    // Edge case: historical edits may only contain backend paths; keep the supported legacy contract instead of re-downloading private images.
    // ponytail: mixed remote/local edits stay legacy; migrate stored photos to asset IDs when legacy support is removed.
    return payload;
  }

  try {
    const face = [];
    // Why: sequential uploads keep every asset under the same newly-issued guest session.
    for (let index = 0; index < sources.face.length; index += 1) {
      face.push(await uploadAsset(spuCode, 'face', sources.face[index], index));
    }

    const named = {};
    // Why: named slots preserve order because backend workflows bind each position semantically.
    for (const [key, entries] of Object.entries(sources.named)) {
      named[key] = [];
      for (let index = 0; index < entries.length; index += 1) {
        named[key].push(await uploadAsset(spuCode, 'named', entries[index], index));
      }
    }

    return buildPreviewV2Payload(payload, { face, named });
  } catch (error) {
    const response = error && typeof error === 'object' ? error.response : null;
    // Edge case: local/non-S3 environments explicitly reject presigning but still support the complete legacy render contract.
    if (response?.status === 503 && response?.data?.code === 'IMAGE_ASSET_UPLOAD_UNAVAILABLE') {
      return payload;
    }
    throw error;
  }
}
