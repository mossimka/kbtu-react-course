import styles from './request-state.module.scss';

export const LoadingState = () => <div className={styles.state}>Loading mission manifest...</div>;

export const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className={`${styles.state} ${styles.error}`} role='alert'>
        <strong>Mission control link failed</strong>
        <p>{message}</p>
        <button onClick={onRetry}>TRY AGAIN</button>
    </div>
);

export const SuccessState = ({ message }: { message: string }) => (
    <div className={styles.success} role='status'>
        {message}
    </div>
);
