import styles from './page-loader.module.scss';

export const PageLoader = () => (
    <div className={styles.root} role='status' aria-live='polite'>
        <span className={styles.dot} />
        <p>ESTABLISHING DEEP SPACE LINK...</p>
    </div>
);
