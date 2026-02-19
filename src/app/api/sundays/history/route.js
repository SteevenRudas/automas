import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * GET /api/sundays/history
 * Retorna historial de domingos trabajados.
 * Query params: ?employee_id=UUID, ?limit=20, ?offset=0
 */
export async function GET(request) {
    try {
        const supabase = createServiceClient();
        const { searchParams } = new URL(request.url);

        const employeeId = searchParams.get("employee_id");
        const limit = parseInt(searchParams.get("limit") ?? "20");
        const offset = parseInt(searchParams.get("offset") ?? "0");

        let query = supabase
            .from("sunday_assignments")
            .select("*, employees(full_name, cedula)", { count: "exact" })
            .order("sunday_date", { ascending: false })
            .range(offset, offset + limit - 1);

        if (employeeId) {
            query = query.eq("employee_id", employeeId);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return NextResponse.json({
            assignments: data ?? [],
            total: count ?? 0,
            limit,
            offset,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
