import { skills } from '../../data';
import styles from './skills.module.scss';

export function Skills() {
    return (
        <section className={styles.section}>
            <div className={styles.label}>03 / Toolkit</div>
            <div className={styles.grid}>
                <h2 className={styles.title}>
                    The tools
                    <br />
                    <span>behind the work.</span>
                </h2>
                <div className={styles.list}>
                    {skills.map(([category, tools]) => (
                        <div className={styles.row} key={category}>
                            <strong>{category}</strong>
                            <span>{tools}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
