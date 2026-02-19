/**
 * ============================================
 * AUTOMÁS — Utilidades Generales
 * ============================================
 */

const DIAS = [
    "Domingo", "Lunes", "Martes", "Miércoles",
    "Jueves", "Viernes", "Sábado",
];

const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const DIAS_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/**
 * Formatea una fecha como "Lunes, 19 de febrero de 2026"
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    const dia = DIAS[d.getDay()];
    const mes = MESES[d.getMonth()];
    return `${dia}, ${d.getDate()} de ${mes} de ${d.getFullYear()}`;
}

/**
 * Formatea una fecha como "19/02/2026"
 * @param {Date|string} date
 * @returns {string}
 */
export function formatShortDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
}

/**
 * Formatea una fecha a ISO local "YYYY-MM-DD"
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
 * Retorna el nombre corto del día (Lun, Mar, etc.)
 * @param {Date} date
 * @returns {string}
 */
export function getDayShortName(date) {
    return DIAS_CORTO[date.getDay()];
}

/**
 * Retorna el nombre larg del día
 * @param {Date} date
 * @returns {string}
 */
export function getDayName(date) {
    return DIAS[date.getDay()];
}

/**
 * Retorna un array con las 7 fechas de una semana (Lun–Dom)
 * a partir de cualquier fecha dentro de esa semana.
 * @param {Date} date
 * @returns {Date[]} Array de 7 fechas
 */
export function getWeekDates(date) {
    const d = new Date(date);
    const day = d.getDay() || 7; // 1=Lun, 7=Dom
    d.setDate(d.getDate() - day + 1); // ir al Lunes

    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(d);
        day.setDate(d.getDate() + i);
        return day;
    });
}

/**
 * Verifica si una fecha es domingo.
 * @param {Date} date
 * @returns {boolean}
 */
export function isSunday(date) {
    return date.getDay() === 0;
}

/**
 * Verifica si una fecha es sábado.
 * @param {Date} date
 * @returns {boolean}
 */
export function isSaturday(date) {
    return date.getDay() === 6;
}

/**
 * Formatea "YYYY-MM-DD" a "19 feb."
 * @param {string} isoDate
 * @returns {string}
 */
export function formatCompactDate(isoDate) {
    const [, m, d] = isoDate.split("-");
    const mes = MESES[parseInt(m) - 1].slice(0, 3);
    return `${parseInt(d)} ${mes}.`;
}

/**
 * Obtiene la fecha de hoy como "YYYY-MM-DD" local.
 * @returns {string}
 */
export function todayISO() {
    return formatDateISO(new Date());
}

/**
 * Clona una fecha y le suma días.
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
