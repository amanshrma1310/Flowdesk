import { NextResponse } from "next/server";
import { autoDetectColumnMappings, cleanAndValidateDataset } from "@/lib/ai/dataCleaner";

export async function POST(req: Request) {
  try {
    const { rows, fileName } = await req.json();
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: "No data rows provided" }, { status: 400 });
    }

    const headers = Object.keys(rows[0] || {});
    const mappings = autoDetectColumnMappings(headers, rows.slice(0, 5));
    const { cleanedRows, health } = cleanAndValidateDataset(rows, mappings);

    return NextResponse.json({
      success: true,
      fileName,
      mappings,
      cleanedRows,
      health,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
