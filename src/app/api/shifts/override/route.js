import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/shifts/override
 * Crea o actualiza un override de turno para un empleado en una fecha.
 *
 * Body: { employee_id, override_date, new_shift, reason? }
 */
export async function POST(request) {
    try {
        const supabase = createServiceClient();
        const body = await request.json();

        const { employee_id, override_date, new_shift, reason } = body;

        if (!employee_id || !override_date || !new_shift) {
            return NextResponse.json(
                { error: "Campos requeridos: employee_id, override_date, new_shift" },
                { status: 400 }
            );
        }

        const validShifts = ["A", "B", "C", "DESCANSO"];
        if (!validShifts.includes(new_shift)) {
            return NextResponse.json(
                { error: `new_shift debe ser uno de: ${validShifts.join(", ")}` },
                { status: 400 }
            );
        }

        // Verificar que el empleado existe
        const { data: employee } = await supabase
            .from("employees")
            .select("id, initial_shift")
            .eq("id", employee_id)
            .single();

        if (!employee) {
            return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
        }

        // Upsert (crear o actualizar) el override
        const { data, error } = await supabase
            .from("shift_overrides")
            .upsert(
                { employee_id, override_date, new_shift, reason: reason ?? null },
                { onConflict: "employee_id,override_date" }
            )
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ override: data }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/shifts/override
 * Elimina un override (restaura turno automático).
 *
 * Body: { employee_id, override_date }
 */
export async function DELETE(request) {
    try {
        const supabase = createServiceClient();
        const body = await request.json();

        const { employee_id, override_date } = body;

        if (!employee_id || !override_date) {
            return NextResponse.json(
                { error: "Campos requeridos: employee_id, override_date" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("shift_overrides")
            .delete()
            .eq("employee_id", employee_id)
            .eq("override_date", override_date);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
