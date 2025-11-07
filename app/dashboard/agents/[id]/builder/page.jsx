import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prismadb';

// GET /api/agents/:id – return the agent for the logged-in user
export async function GET(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await prisma.agent.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: { id: true, name: true, type: true, voice: true, instructions: true, updatedAt: true },
    });

    if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(agent);
  } catch (err) {
    console.error('GET /api/agents/[id] error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/agents/:id – update fields (specifically the prompt/instructions)
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure the agent belongs to the current user
    const existing = await prisma.agent.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Accept both JSON and form-encoded bodies
    const contentType = req.headers.get('content-type') || '';
    let body = {};
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    }

    const instructions = typeof body.instructions === 'string' ? body.instructions : undefined;

    const updated = await prisma.agent.update({
      where: { id: params.id },
      data: {
        ...(instructions !== undefined ? { instructions } : {}),
      },
      select: { id: true, name: true, type: true, voice: true, instructions: true },
    });

    return NextResponse.json({ success: true, agent: updated });
  } catch (err) {
    console.error('PATCH /api/agents/[id] error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// HTML forms in the builder submit as POST with a hidden _method=PATCH
export async function POST(req, ctx) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await req.json().catch(() => ({}));
      if ((json._method || '').toUpperCase() === 'PATCH') {
        // Reconstruct a Request with JSON body to reuse PATCH
        return PATCH(new Request(req.url, { method: 'PATCH', headers: req.headers, body: JSON.stringify(json) }), ctx);
      }
      return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
    }

    // form-encoded
    const form = await req.formData();
    const methodOverride = String(form.get('_method') || '').toUpperCase();
    if (methodOverride === 'PATCH') {
      // Forward the same request to PATCH handler
      return PATCH(req, ctx);
    }

    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  } catch (err) {
    console.error('POST (method override) /api/agents/[id] error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Optional: allow deletion if you later need it
export async function DELETE(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.agent.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.agent.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/agents/[id] error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}