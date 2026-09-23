import { Tag } from 'antd';
import { experiences } from '../../data';
import styles from './experience.module.scss';

export function Experience() {
    return (
        <section className={styles.section} id='experience'>
            <div className={styles.label}>02 / Experience</div>
            <div className={styles.heading}>
                <h2>
                    A few places
                    <br />
                    <span>I&apos;ve built things.</span>
                </h2>
                <p>
                    From fast-moving incubators to enterprise platforms, I like working where there&apos;s something
                    meaningful to make clearer.
                </p>
            </div>
            <div className={styles.timeline}>
                {experiences.map((experience) => (
                    <article className={styles.item} key={`${experience.company}-${experience.period}`}>
                        <div className={styles.period}>{experience.period}</div>
                        <div className={styles.details}>
                            <h3>{experience.role}</h3>
                            <p className={styles.company}>
                                {experience.company} <span>· {experience.location}</span>
                            </p>
                            <p>{experience.description}</p>
                            <div className={styles.tags}>
                                {experience.tags.map((tag) => (
                                    <Tag className={styles.tag} key={tag}>
                                        {tag}
                                    </Tag>
                                ))}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
