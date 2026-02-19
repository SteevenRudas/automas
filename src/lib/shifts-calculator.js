/**
 * ============================================
 * AUTOMÁS — Calculadora de Turnos
 * ============================================
 *
 * Lógica de rotación de turnos:
 * - Ciclo de 3 semanas: A → B → C → A → ...
 * - Semana de referencia: 2025-01-06 (Lunes, Semana ISO 2)
 * - Turnos se calculan en tiempo real, NO se almacenan.
 *
 * Turnos:
 * - A: L-V 6:00am–2:00pm, Sáb 6:00am–12:00pm
 * - B: L-V 2:00pm–10:00pm, Sáb 12:00pm–6:00pm
 * - C: L-V 10:00pm–6:00am, Sáb 6:00pm–12:00am
 * - Domingo: 8:00am–2:00pm (solo empleado asignado por rotación)
 */

const SHIFTS = ["A", "B", "C"];

// Fecha de inicio del sistema (Lunes 6 de enero 2025 — Semana ISO 2)
const SYSTEM_START_DATE = new Date("2025-01-06T00:00:00.000Z");

/**
 * Obtiene el número de semana ISO del año para una fecha dada.
 * @param {Date} date
 * @returns {number} número de semana ISO
 */
export function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // 1=Lunes, 7=Domingo
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Calcula el inicio de semana ISO (Lunes) para una fecha dada.
 * @param {Date} date
 * @returns {Date} fecha del Lunes de esa semana
 */
export function getWeekStart(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7; // 1=Lunes ... 7=Domingo
    d.setUTCDate(d.getUTCDate() - day + 1);
    return d;
}

/**
 * Calcula el turno base de un empleado para una semana específica.
 * @param {string} initialShift - Turno inicial del empleado ('A', 'B' o 'C')
 * @param {Date} date - Cualquier fecha de la semana a calcular
 * @returns {'A'|'B'|'C'} turno calculado
 */
export function getShiftForWeek(initialShift, date) {
    const weekStart = getWeekStart(date);
    const systemStart = getWeekStart(SYSTEM_START_DATE);

    // Diferencia en semanas entre la semana actual y la semana de referencia
    const diffMs = weekStart.getTime() - systemStart.getTime();
    const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));

    const initialIndex = SHIFTS.indexOf(initialShift);
    if (initialIndex === -1) throw new Error(`Turno inicial inválido: ${initialShift}`);

    const currentIndex = (initialIndex + diffWeeks) % SHIFTS.length;
    // Asegurarse de que el índice sea positivo
    const normalizedIndex = ((currentIndex % SHIFTS.length) + SHIFTS.length) % SHIFTS.length;

    return SHIFTS[normalizedIndex];
}

/**
 * Calcula el turno de un empleado para una fecha específica,
 * considerando overrides manuales.
 *
 * @param {Object} employee - { id, initial_shift, is_active }
 * @param {Date} date - Fecha a calcular
 * @param {Array} overrides - Array de shift_overrides del empleado
 * @returns {{ shift: string, isOverride: boolean, isRest: boolean }}
 */
export function getShiftForEmployee(employee, date, overrides = []) {
    if (!employee.is_active) {
        return { shift: "INACTIVO", isOverride: false, isRest: false };
    }

    const dateStr = formatDateISO(date);
    const dayOfWeek = date.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb

    // Domingo: solo trabaja el empleado asignado por rotación
    if (dayOfWeek === 0) {
        return { shift: "DESCANSO", isOverride: false, isRest: true };
    }

    // Verificar si hay un override manual para esta fecha
    const override = overrides.find(
        (o) => o.employee_id === employee.id && o.override_date === dateStr
    );

    if (override) {
        return {
            shift: override.new_shift,
            isOverride: true,
            isRest: override.new_shift === "DESCANSO",
        };
    }

    const shift = getShiftForWeek(employee.initial_shift, date);
    return { shift, isOverride: false, isRest: false };
}

/**
 * Retorna el horario de trabajo como string legible.
 * @param {'A'|'B'|'C'} shift
 * @param {number} dayOfWeek - 0=Dom, 1=Lun, ..., 6=Sáb
 * @returns {string} horario legible
 */
export function getScheduleForShift(shift, dayOfWeek) {
    if (dayOfWeek === 0) return "Descanso";
    if (dayOfWeek === 6) {
        // Sábado
        const satSchedules = {
            A: "6:00am – 12:00pm",
            B: "12:00pm – 6:00pm",
            C: "6:00pm – 12:00am",
        };
        return satSchedules[shift] ?? "—";
    }
    // Lunes a Viernes
    const weekSchedules = {
        A: "6:00am – 2:00pm",
        B: "2:00pm – 10:00pm",
        C: "10:00pm – 6:00am",
    };
    return weekSchedules[shift] ?? "—";
}

/**
 * Retorna el horario del turno dominical.
 * @returns {string}
 */
export function getSundaySchedule() {
    return "8:00am – 2:00pm";
}

/**
 * Formato de fecha a ISO local (YYYY-MM-DD) sin conversión de zona horaria.
 * @param {Date} date
 * @returns {string}
 */
export function formatDateISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Obtiene los empleados disponibles para un domingo usando rotación.
 * @param {Array} employees - Lista de empleados activos con sunday_rotation_order
 * @param {Date} sundayDate
 * @returns {Object|null} empleado asignado al domingo
 */
export function getSundayEmployee(employees, sundayDate) {
    const activeWithOrder = employees
        .filter((e) => e.is_active && e.sunday_rotation_order != null)
        .sort((a, b) => a.sunday_rotation_order - b.sunday_rotation_order);

    if (activeWithOrder.length === 0) return null;

    // Calcular cuántos domingos han pasado desde el inicio del sistema
    const systemStart = new Date("2025-01-06T00:00:00.000Z");
    // Primer domingo después de la semana de inicio
    const firstSunday = new Date(systemStart);
    firstSunday.setUTCDate(firstSunday.getUTCDate() + (7 - firstSunday.getUTCDay()) % 7);

    const diffMs = sundayDate.getTime() - firstSunday.getTime();
    const sundayIndex = Math.max(0, Math.round(diffMs / (7 * 24 * 60 * 60 * 1000)));

    const assignedIndex = sundayIndex % activeWithOrder.length;
    return activeWithOrder[assignedIndex];
}
