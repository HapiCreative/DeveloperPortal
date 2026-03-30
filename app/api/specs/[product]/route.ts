import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ product: string }> },
) {
  const { product } = await params;

  // Sanitize: only allow alphanumeric, hyphens, underscores
  if (!/^[a-z0-9_-]+$/i.test(product)) {
    return NextResponse.json(
      { error: "Invalid product identifier" },
      { status: 400 },
    );
  }

  const specPath = join(process.cwd(), "content", "specs", `${product}.yaml`);

  try {
    const content = await readFile(specPath, "utf-8");
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "application/x-yaml",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Spec not found" },
      { status: 404 },
    );
  }
}
