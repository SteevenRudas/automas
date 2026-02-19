import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * GET /api/employees
 * Retorna todos los empleados activos.
 * Query params: ?all=true para incluir inactivos.
 */
export async function GET(request) {
    try {
        const supabase = createServiceClient();
        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get("all") === "true";

        let query = supabase
            .from("employees")
            .select("*")
            .order("full_name", { ascending: true });

        if (!includeAll) {
            query = query.eq("is_active", true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ employees: data });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/employees
 * Crea un nuevo empleado.
 */
export async function POST(request) {
    try {
        const supabase = createServiceClient();
        const body = await request.json();

        const { full_name, cedula, initial_shift, start_date, sunday_rotation_order } = body;

        if (!full_name || !cedula || !initial_shift || !start_date) {
            return NextResponse.json(
                { error: "Campos requeridos: full_name, cedula, initial_shift, start_date" },
                { status: 400 }
            );
        }

        if (!["A", "B", "C"].includes(initial_shift)) {
            return NextResponse.json(
                { error: "initial_shift debe ser A, B o C" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("employees")
            .insert([{ full_name, cedula, initial_shift, start_date, sunday_rotation_order, is_active: true }])
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json(
                    { error: "Ya existe un empleado con esa cédula." },
                    { status: 409 }
                );
            }
            throw error;
        }

        return NextResponse.json({ employee: data }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
