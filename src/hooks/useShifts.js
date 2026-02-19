"use client";

import { useState, useEffect, useCallback } from "react";
import { getShiftForEmployee } from "@/lib/shifts-calculator";
import { getWeekDates, formatDateISO } from "@/lib/utils";

/**
 * Hook para obtener y calcular los turnos de la semana.
 * @param {Date|string} weekDate - Cualquier fecha dentro de la semana deseada
 */
export function useShifts(weekDate = new Date()) {
    const [employees, setEmployees] = useState([]);
    const [overrides, setOverrides] = useState([]);
    const [weekShifts, setWeekShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const targetDate = weekDate instanceof Date ? weekDate : new Date(weekDate);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const weekStart = formatDateISO(getWeekDates(targetDate)[0]);
            const [empRes, shiftsRes] = await Promise.all([
                fetch("/api/employees"),
                fetch(`/api/shifts?week=${weekStart}`),
            ]);

            if (!empRes.ok || !shiftsRes.ok) {
                throw new Error("Error al cargar datos de turnos");
            }

            const empData = await empRes.json();
            const shiftsData = await shiftsRes.json();

            setEmployees(empData.employees ?? []);
            setOverrides(shiftsData.overrides ?? []);

            // Calcular turnos para cada empleado en cada día de la semana
            const weekDates = getWeekDates(targetDate);
            const computed = (empData.employees ?? []).map((employee) => ({
                employee,
                days: weekDates.map((date) => ({
                    date,
                    dateStr: formatDateISO(date),
                    ...getShiftForEmployee(employee, date, shiftsData.overrides ?? []),
                })),
            }));

            setWeekShifts(computed);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [targetDate.toISOString().slice(0, 10)]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { employees, overrides, weekShifts, loading, error, refetch: fetchData };
}
