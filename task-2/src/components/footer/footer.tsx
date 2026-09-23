import styles from './footer.module.scss';

export function Footer() {
    return (
        <footer className={styles.footer}>
            <span>MASA © 2026</span>
            <span>Designed &amp; built with React</span>
        </footer>
    );
}
