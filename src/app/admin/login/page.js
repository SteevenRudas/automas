import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";
import styles from "./page.module.css";

export const metadata = {
    title: "Iniciar sesión | Automás",
};

export default function LoginPage() {
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <Image
                        src="/logo.svg"
                        alt="Automás"
                        width={160}
                        height={44}
                        priority
                    />
                    <p className={styles.subtitle}>Sistema de gestión de turnos</p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
