import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
    getShiftForEmployee,
    getWeekStart,
    formatDateISO,
} from "@/lib/shifts-calculator";

/**
 * GET /api/shifts?week=YYYY-MM-DD
 * Retorna los turnos calculados + overrides para la semana indicada.
 */
export async function GET(request) {
    try {
        const supabase = createServiceClient();
        const { searchParams } = new URL(request.url);

        // Fecha de la semana (cualquier día). Default: semana actual.
        const weekParam = searchParams.get("week");
        const targetDate = weekParam ? new Date(weekParam) : new Date();
        const weekStart = getWeekStart(targetDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

        const weekStartStr = formatDateISO(weekStart);
        const weekEndStr = formatDateISO(weekEnd);

        // Obtener empleados activos y overrides del rango de la semana
        const [{ data: employees, error: empError }, { data: overrides, error: ovError }] =
            await Promise.all([
                supabase
                    .from("employees")
                    .select("*")
                    .eq("is_active", true)
                    .order("full_name"),
                supabase
                    .from("shift_overrides")
                    .select("*")
                    .gte("override_date", weekStartStr)
                    .lte("override_date", weekEndStr),
            ]);

        if (empError) throw empError;
        if (ovError) throw ovError;

        // Calcular turnos para cada día de la semana
        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart);
            d.setUTCDate(d.getUTCDate() + i);
            return d;
        });

        const shifts = employees.map((employee) => ({
            employee,
            days: weekDays.map((date) => ({
                date: formatDateISO(date),
                dayOfWeek: date.getUTCDay(),
                ...getShiftForEmployee(employee, date, overrides ?? []),
            })),
        }));

        return NextResponse.json({
            weekStart: weekStartStr,
            weekEnd: weekEndStr,
            shifts,
            overrides: overrides ?? [],
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
