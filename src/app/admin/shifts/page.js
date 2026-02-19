import AdminLayout from "@/components/layout/AdminLayout";

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
