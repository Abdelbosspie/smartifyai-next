/** --- DELETE: remove a knowledge item by id (idempotent & flexible) --- */
export async function DELETE(req, _ctx) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Accept id from query string, JSON body, or header for resilience
    const { searchParams } = new URL(req.url);
    let itemId = searchParams.get("id");

    if (!itemId) {
      const body = await req.json().catch(() => null);
      itemId =
        body?.id ||
        body?.itemId ||
        body?.knowledgeId ||
        req.headers.get("x-knowledge-id") ||
        null;
    }

    if (!itemId) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    // Delete only if the item belongs to an agent owned by the user.
    // Using deleteMany keeps the operation idempotent.
    const result = await prisma.knowledge.deleteMany({
      where: { id: String(itemId), agent: { userId: session.user.id } },
    });

    return NextResponse.json({ ok: true, deleted: result.count }, { status: 200 });
  } catch (err) {
    console.error("[KB] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}