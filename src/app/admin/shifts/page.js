/*import AdminLayout from "@/components/layout/AdminLayout";

export const metadata = { title: "Turnos | Automás" };

export default function ShiftsPage() {
    return (
        <AdminLayout title="Turnos">
            <div className="card" style={{ padding: "var(--space-6)" }}>
                <p style={{ color: "var(--color-gray-dark)" }}>
                    Vista semanal de turnos — próximamente.
                </p>
            </div>
        </AdminLayout>
    );
}
*/
"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";

export default function ShiftsPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const SHIFTS = [
        { name: "APERTURA", time: "7:00 - 16:00", color: "#e3f2fd", textColor: "#1976d2" },
        { name: "MEDIO", time: "8:00 - 17:00", color: "#f0f4ff", textColor: "#1a73e8" },
        { name: "CIERRE", time: "9:00 - 18:00", color: "#fff4e5", textColor: "#b45d00" }
    ];

    useEffect(() => {
        async function getEmployees() {
            setLoading(true);
            const { data, error } = await supabase.from("employees").select("*");
            if (error) console.error("Error cargando empleados:", error);
            if (data) setEmployees(data);
            setLoading(false);
        }
        getEmployees();
    }, []);

    const getShiftForDate = (emp, date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const isSunday = d.getDay() === 0;
        const isSaturday = d.getDay() === 6;

        const yearStart = new Date(d.getFullYear(), 0, 1);
        const days = Math.floor((d - yearStart) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + yearStart.getDay() + 1) / 7);

        const name = emp?.full_name?.toLowerCase() || "";
        const initialGroup = emp?.initial_shift || "A";

        // --- LÓGICA PARA INGENIEROS (Cristian y Jhoan) ---
        // --- LÓGICA PARA INGENIEROS (Cristian y Jhoan) ---
        if (name.includes("cristian") || name.includes("jhoan")) {
            const isCristian = name.includes("cristian");

            // ANTES: const ingOffset = isCristian ? 0 : 1;
            // AHORA: Invertimos los papeles para que Cristian sea el 1
            const ingOffset = isCristian ? 1 : 0;

            if (isSunday) {
                // Al ser Cristian el 1, este domingo (Semana par) le tocará a él
                const domingoIndex = weekNumber % 2;
                if (domingoIndex === ingOffset) {
                    return { name: "DOMINGO", time: "8:00 - 12:00", color: "#e6f4ea", textColor: "#1e7e34" };
                }
                return { name: "DESCANSO", time: "---", color: "#f8f9fa", textColor: "#adb5bd" };
            }
            // ... el resto del código sigue igual

            const ingIndex = (weekNumber + ingOffset) % 2;
            const shiftName = ingIndex === 0 ? "APERTURA" : "CIERRE";
            let shiftTime = ingIndex === 0 ? "7:00 AM - 4:00 PM" : "9:00 AM - 6:00 PM";

            if (isSaturday) {
                shiftTime = ingIndex === 0 ? "7:00 AM - 11:00 AM" : "11:00 AM - 4:00 PM";
            }
            return { name: shiftName, time: shiftTime, color: ingIndex === 0 ? "#e3f2fd" : "#fff3e0", textColor: ingIndex === 0 ? "#1976d2" : "#e65100" };
        }

        // --- LÓGICA PARA OPERATIVOS (Anthony, Antonio, Steeven) ---
        const groupOffset = initialGroup === "A" ? 0 : initialGroup === "B" ? 1 : 2;
        const shiftIndex = (weekNumber + groupOffset - 2 + 3) % 3;

        if (isSunday) {
            const sundayRotationIndex = (weekNumber + 2) % 3;
            if (initialGroup === "B" && sundayRotationIndex === 2) return { name: "DOMINGO", time: "8:00 - 12:00", color: "#e6f4ea", textColor: "#1e7e34" };
            if (initialGroup === "A" && sundayRotationIndex === 0) return { name: "DOMINGO", time: "8:00 - 12:00", color: "#e6f4ea", textColor: "#1e7e34" };
            if (initialGroup === "C" && sundayRotationIndex === 1) return { name: "DOMINGO", time: "8:00 - 12:00", color: "#e6f4ea", textColor: "#1e7e34" };
            return { name: "DESCANSO", time: "---", color: "#f8f9fa", textColor: "#adb5bd" };
        }

        let currentShift = { ...SHIFTS[shiftIndex] };
        if (isSaturday) {
            if (currentShift.name === "APERTURA") currentShift.time = "7:00 AM - 11:00 AM";
            else if (currentShift.name === "MEDIO") currentShift.time = "9:00 AM - 1:00 PM";
            else if (currentShift.name === "CIERRE") currentShift.time = "11:00 AM - 4:00 PM";
        }
        return currentShift;
    };

    const getNextSevenDays = () => {
        const days = [];
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(monday);
            nextDay.setDate(monday.getDate() + i);
            days.push(nextDay);
        }
        return days;
    };

    const weekDays = getNextSevenDays();

    return (
        <AdminLayout title="Cuadrante Semanal">
            <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflowX: "auto" }}>
                <header style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#666' }}>Los turnos rotan automáticamente cada <b>Lunes</b>.</p>
                </header>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                    <thead>
                        <tr>
                            <th style={styles.headerCell}>Empleado</th>
                            {weekDays.map((date) => (
                                <th key={date.toString()} style={styles.headerCell}>
                                    <div style={{ textTransform: 'capitalize' }}>
                                        {date.toLocaleDateString('es-ES', { weekday: 'long' })}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>
                                        {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
                        ) : (
                            employees.map(emp => (
                                <tr key={emp.id} style={{ borderBottom: "1px solid #edf2f7" }}>
                                    <td style={styles.nameCell}>
                                        <div style={{ fontWeight: "bold", color: "#2d3748" }}>{emp.full_name}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#a0aec0" }}>Grupo {emp.initial_shift}</div>
                                    </td>
                                    {weekDays.map((date, i) => {
                                        const shift = getShiftForDate(emp, date);
                                        return (
                                            <td key={i} style={{ ...styles.shiftCell, backgroundColor: shift.color }}>
                                                <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: shift.textColor }}>{shift.name}</div>
                                                <div style={{ fontSize: "0.7rem", color: shift.textColor, opacity: 0.8 }}>{shift.time}</div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}

const styles = {
    headerCell: { padding: "15px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", textAlign: "center" },
    nameCell: { padding: "15px", border: "1px solid #e2e8f0", minWidth: "180px", background: "#fff" },
    shiftCell: { padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }
};