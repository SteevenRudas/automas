import styles from "./Button.module.css";

/**
 * Botón reutilizable con variantes y tamaños.
 * @param {object} props
 * @param {'primary'|'secondary'|'danger'|'ghost'} props.variant
 * @param {'sm'|'md'|'lg'} props.size
 * @param {boolean} props.loading
 * @param {boolean} props.fullWidth
 */
export default function Button({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    disabled,
    className = "",
    ...props
}) {
    return (
        <button
            className={`
        ${styles.btn}
        ${styles[variant]}
        ${styles[size]}
        ${fullWidth ? styles.fullWidth : ""}
        ${className}
      `.trim()}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className={styles.spinner} aria-hidden="true" />
            )}
            {children}
        </button>
    );
}
