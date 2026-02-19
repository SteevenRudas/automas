import AdminLayout from "@/components/layout/AdminLayout";

export const metadata = { title: "Domingos | Automás" };

export default function SundaysPage() {
    return (
        <AdminLayout title="Domingos">
            <div className="card" style={{ padding: "var(--space-6)" }}>
                <p style={{ color: "var(--color-gray-dark)" }}>
                    Gestión de turnos dominicales — próximamente.
                </p>
            </div>
        </AdminLayout>
    );
}
