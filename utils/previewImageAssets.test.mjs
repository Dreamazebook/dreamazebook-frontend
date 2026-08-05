import assert from 'node:assert/strict';
import test from 'node:test';

import { buildPreviewV2Payload, preparePreviewRenderPayload } from './previewImageAssets.js';

/**
 * Verifies the V2 builder removes legacy duplicate fields while preserving semantic image slots.
 *
 * Params: none; uses fixed in-memory request/asset fixtures.
 * Returns: nothing when assertions pass.
 * Side effects: none outside the Node test runner.
 * Failure: any contract drift fails the test.
 */
test('buildPreviewV2Payload removes legacy duplicates and preserves image slot order', () => {
  const payload = buildPreviewV2Payload(
    {
      language: 'en',
      full_name: 'Mia',
      giver_name: 'Alex',
      relationship: 'Parent/Guardian',
      gender: 'girl',
      attributes: {
        skin_tone: 'original',
        face_images: ['legacy-child'],
        mom_image: ['legacy-mom'],
        dad_image: ['legacy-dad'],
        dad_name: 'Dad',
        dad_question_1: 'Build castles',
      },
    },
    {
      face: ['child-asset'],
      named: { mom_image: ['mom-asset'], dad_image: ['dad-asset'] },
    },
  );

  assert.deepEqual(payload, {
    contract_version: 2,
    language: 'en',
    attributes: {
      skin_tone: 'original',
      gender: 'girl',
    },
    images: {
      face: ['child-asset'],
      named: { mom_image: ['mom-asset'], dad_image: ['dad-asset'] },
    },
    text: {
      recipient_name: 'Mia',
      giver_name: 'Alex',
      variables: {
        dad_name: 'Dad',
        dad_question_1: 'Build castles',
      },
      pages: {},
    },
    metadata: {
      relationship: 'Parent/Guardian',
    },
  });
});

/**
 * Verifies historical stored image paths keep using the backend-supported legacy contract.
 *
 * Params: none; uses a fixed stored-path request that cannot be uploaded from the browser safely.
 * Returns: a resolved test promise when the original payload object is preserved.
 * Side effects: none; the early fallback performs no API or object-storage requests.
 * Failure: attempting V2 conversion or cloning the legacy payload fails the assertion.
 */
test('preparePreviewRenderPayload keeps stored image paths on the legacy contract', async () => {
  const payload = {
    face_images: [{ path: 'face_uploads/existing.jpg', disk: 'picbook_previews' }],
    attributes: {},
  };

  assert.equal(await preparePreviewRenderPayload('PICBOOK_TEST', payload), payload);
});

/**
 * Verifies an explicitly unavailable V2 upload service falls back to the complete legacy request.
 *
 * Params: none; uses a local image fixture and an uploader stub returning the backend 503 error contract.
 * Returns: a resolved test promise when the original payload object is preserved.
 * Side effects: none; the stub prevents API and object-storage requests.
 * Failure: rejecting or returning a partial/V2 payload fails the assertion.
 */
test('preparePreviewRenderPayload falls back when V2 image upload is unavailable', async () => {
  const localImage = 'data:image/jpeg;base64,AA==';
  const payload = {
    face_images: [{ filename: 'face.jpg', mime: 'image/jpeg', data: localImage }],
    attributes: {
      face_images: [{ filename: 'face.jpg', mime: 'image/jpeg', data: localImage }],
    },
  };
  const unavailable = Object.assign(new Error('Request failed with status code 503'), {
    response: {
      status: 503,
      data: { code: 'IMAGE_ASSET_UPLOAD_UNAVAILABLE' },
    },
  });

  const result = await preparePreviewRenderPayload(
    'PICBOOK_GOODNIGHT3',
    payload,
    async () => {
      throw unavailable;
    },
  );

  assert.equal(result, payload);
});
