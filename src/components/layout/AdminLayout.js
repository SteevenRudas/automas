"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useInactivity } from "@/hooks/useInactivity";
import styles from "./AdminLayout.module.css";

const NAV_ITEMS = [
    {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: "📊",
    },
    {
        href: "/admin/shifts",
        label: "Turnos",
        icon: "🗓️",
    },
    {
        href: "/admin/employees",
        label: "Empleados",
        icon: "👥",
    },
    {
        href: "/admin/sundays",
        label: "Domingos",
        icon: "☀️",
    },
];

export default function AdminLayout({ children, title }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();

    const handleInactivity = async () => {
        await signOut();
        router.push("/admin/login");
    };

    useInactivity(handleInactivity);

    const handleSignOut = async () => {
        await signOut();
        router.push("/admin/login");
    };

    return (
        <div className={styles.shell}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Image
                        src="/logo.svg"
                        alt="Automás"
                        width={140}
                        height={38}
                        priority
                    />
                </div>

                <nav className={styles.nav} aria-label="Navegación principal">
                    <ul>
                        {NAV_ITEMS.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`${styles.navLink} ${pathname === item.href ? styles.active : ""}`}
                                >
                                    <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className={styles.sidebarFooter}>
                    <p className={styles.userEmail}>{user?.email}</p>
                    <button
                        className={styles.signOutBtn}
                        onClick={handleSignOut}
                        type="button"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Contenido principal */}
            <div className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.pageTitle}>{title}</h1>
                </header>
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}
