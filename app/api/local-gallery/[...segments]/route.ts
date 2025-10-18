import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: { segments?: string[] } }
) {
  try {
    const segments = context.params.segments || [];
    // Normalize to prevent path traversal
    const rel = ('/' + segments.join('/')).replace(/\\/g, '/');
    const safeRel = path.posix
      .normalize(rel)
      .replace(/^\/+/, '')
      .replace(/\.+\//g, '');

    const publicDir = path.join(process.cwd(), 'public');
    const targetDir = path.join(publicDir, safeRel);

    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => /\.(png|jpe?g|webp|gif)$/i.test(name))
      .sort((a, b) => a.localeCompare(b, 'en'))
      .map((name) => `/${safeRel}/${name}`);

    return NextResponse.json({ success: true, files });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to read gallery' },
      { status: 500 }
    );
  }
}


