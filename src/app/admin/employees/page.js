import AdminLayout from "@/components/layout/AdminLayout";

export const metadata = { title: "Empleados | Automás" };

export default function EmployeesPage() {
    return (
        <AdminLayout title="Empleados">
            <div className="card" style={{ padding: "var(--space-6)" }}>
                <p style={{ color: "var(--color-gray-dark)" }}>
                    Gestión de empleados — próximamente.
                </p>
            </div>
        </AdminLayout>
    );
}
