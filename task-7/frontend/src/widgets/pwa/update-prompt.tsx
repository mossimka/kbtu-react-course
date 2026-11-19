import { applyServiceWorkerUpdate } from '../../pwa/register-service-worker';
import { dismissUpdate } from '../../pwa/pwa-store';
import { usePwa } from '../../pwa/use-pwa';
import styles from './update-prompt.module.scss';

export const UpdatePrompt = () => {
    const { updateAvailable, updateDismissed, applyingUpdate } = usePwa();

    if (!updateAvailable || updateDismissed) return null;

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
                <button type='button' disabled={applyingUpdate} onClick={applyServiceWorkerUpdate}>
                    {applyingUpdate ? 'UPDATING…' : 'RELOAD & UPDATE'}
                </button>
                <button className={styles.later} type='button' disabled={applyingUpdate} onClick={dismissUpdate}>
                    LATER
                </button>
            </div>
        </aside>
    );
};
