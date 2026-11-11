import { NextRequest, NextResponse } from 'next/server';
import { commentsStore } from '@/lib/commentsStore';
import { CommentTag, AudioVersion } from '@/types/studio';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag') as CommentTag | null;
    const version = searchParams.get('version') as AudioVersion | null;
    const resolvedParam = searchParams.get('resolved');

    let results = commentsStore.getAll();

    if (tag) {
      results = results.filter((c) => c.tag === tag);
    }
    if (version) {
      results = results.filter((c) => c.version === version);
    }
    if (resolvedParam !== null && resolvedParam !== undefined) {
      const isResolved = resolvedParam === 'true';
      results = results.filter((c) => c.resolved === isResolved);
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      comments: results,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      timeMs,
      author,
      role = 'Director',
      text,
      tag = 'MIX',
      version = 'v2',
    } = body;

    if (timeMs === undefined || !author || !text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: timeMs, author, text' },
        { status: 400 }
      );
    }

    const created = commentsStore.add({
      timeMs: Number(timeMs),
      author: String(author),
      role,
      text: String(text).trim(),
      tag,
      resolved: false,
      version,
    });

    return NextResponse.json(
      {
        success: true,
        comment: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, resolved, text, tag } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing comment id' },
        { status: 400 }
      );
    }

    const updated = commentsStore.update(id, {
      ...(resolved !== undefined ? { resolved: Boolean(resolved) } : {}),
      ...(text ? { text: String(text).trim() } : {}),
      ...(tag ? { tag } : {}),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      comment: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}
