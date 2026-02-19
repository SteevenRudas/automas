import AdminLayout from "@/components/layout/AdminLayout";
import styles from "./page.module.css";

export const metadata = { title: "Dashboard | Automás" };

export default function DashboardPage() {
    return (
        <AdminLayout title="Dashboard">
            <div className={styles.grid}>
                <div className="card" style={{ padding: "var(--space-6)" }}>
                    <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
                        Bienvenido a Automás
                    </h2>
                    <p style={{ color: "var(--color-gray-dark)", fontSize: "var(--font-size-sm)" }}>
                        Panel de gestión de turnos de empleados.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
