import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getSundayEmployee, formatDateISO, getWeekStart } from "@/lib/shifts-calculator";

/**
 * GET /api/sundays?week=YYYY-MM-DD
 * Retorna el empleado asignado al domingo de la semana indicada.
 */
export async function GET(request) {
    try {
        const supabase = createServiceClient();
        const { searchParams } = new URL(request.url);

        const weekParam = searchParams.get("week");
        const targetDate = weekParam ? new Date(weekParam) : new Date();

        // Calcular el domingo de la semana
        const weekStart = getWeekStart(targetDate);
        const sundayDate = new Date(weekStart);
        sundayDate.setUTCDate(sundayDate.getUTCDate() + 6);
        const sundayStr = formatDateISO(sundayDate);

        const { data: employees, error: empError } = await supabase
            .from("employees")
            .select("id, full_name, sunday_rotation_order, is_active")
            .eq("is_active", true)
            .not("sunday_rotation_order", "is", null)
            .order("sunday_rotation_order");

        if (empError) throw empError;

        // Verificar si hay una asignación manual registrada
        const { data: assignment } = await supabase
            .from("sunday_assignments")
            .select("*, employees(full_name)")
            .eq("sunday_date", sundayStr)
            .maybeSingle();

        // Si existe asignación manual, usarla; sino calcular por rotación
        const calculatedEmployee = getSundayEmployee(employees ?? [], sundayDate);

        return NextResponse.json({
            sundayDate: sundayStr,
            assignment: assignment ?? null,
            calculatedEmployee: calculatedEmployee ?? null,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/sundays
 * Registra o actualiza el estado de trabajo de un domingo.
 *
 * Body: { employee_id, sunday_date, worked }
 */
export async function POST(request) {
    try {
        const supabase = createServiceClient();
        const body = await request.json();

        const { employee_id, sunday_date, worked } = body;

        if (!employee_id || !sunday_date || worked === undefined) {
            return NextResponse.json(
                { error: "Campos requeridos: employee_id, sunday_date, worked" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("sunday_assignments")
            .upsert(
                { employee_id, sunday_date, worked: Boolean(worked) },
                { onConflict: "employee_id,sunday_date" }
            )
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ assignment: data }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
