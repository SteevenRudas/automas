import styles from "./LoadingSpinner.module.css";

/**
 * Spinner de carga animado.
 * @param {object} props
 * @param {'sm'|'md'|'lg'} props.size
 * @param {string} props.text - Texto opcional debajo del spinner
 * @param {boolean} props.fullPage - Si true, centra en la pantalla completa
 */
export default function LoadingSpinner({ size = "md", text, fullPage = false }) {
    return (
        <div className={`${styles.container} ${fullPage ? styles.fullPage : ""}`}>
            <div className={`${styles.spinner} ${styles[size]}`} role="status">
                <span className="sr-only">Cargando...</span>
            </div>
            {text && <p className={styles.text}>{text}</p>}
        </div>
    );
}
