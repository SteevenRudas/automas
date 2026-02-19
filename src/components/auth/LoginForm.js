"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { signIn, loading } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Por favor completa todos los campos.");
            return;
        }

        const { error: authError } = await signIn(email, password);

        if (authError) {
            setError("Credenciales inválidas. Verifica tu email y contraseña.");
        } else {
            router.push("/admin/dashboard");
            router.refresh();
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>
                    Correo electrónico
                </label>
                <input
                    id="email"
                    type="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@empresa.com"
                    autoComplete="email"
                    disabled={loading}
                    required
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>
                    Contraseña
                </label>
                <input
                    id="password"
                    type="password"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                />
            </div>

            {error && (
                <div className={styles.error} role="alert">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
            >
                {loading ? "Ingresando..." : "Ingresar"}
            </Button>
        </form>
    );
}
