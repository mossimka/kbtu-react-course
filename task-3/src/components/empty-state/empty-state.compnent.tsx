import styles from './empty-state.module.scss';

export const EmptyState = () => (
    <div className={styles.root}>
        <span>∅</span>
        <h2>No missions found</h2>
        <p>The selected filter returned no active flight records.</p>
    </div>
);
