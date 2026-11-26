import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './update-prompt.module.scss';

export const UpdatePrompt = () => {
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW();

    if (!needRefresh) return null;

    return (
        <aside className={styles.root} role='alert' aria-live='assertive'>
            <div className={styles.copy}>
                <strong>NEW VERSION AVAILABLE</strong>
                <span>
                    An updated Mission Control build is ready. Reload to activate it — cached data and your session are
                    preserved.
                </span>
            </div>
            <div className={styles.actions}>
                <button type='button' onClick={() => updateServiceWorker(true)}>
                    RELOAD & UPDATE
                </button>
            </div>
        </aside>
    );
};
