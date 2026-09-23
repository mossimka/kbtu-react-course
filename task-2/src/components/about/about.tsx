import styles from './about.module.scss';

export function About() {
    return (
        <section className={styles.section} id='about'>
            <div className={styles.label}>01 / About me</div>
            <div className={styles.content}>
                <h2 className={styles.title}>
                    Good interfaces
                    <br />
                    <span>feel inevitable.</span>
                </h2>
                <div className={styles.text}>
                    <p className={styles.lead}>
                        I&apos;m a frontend developer and software engineer specializing in responsive, thoughtful web
                        applications with React, Next.js, TypeScript, and Redux.
                    </p>
                    <p>
                        I enjoy translating Figma designs into pixel-precise experiences, untangling complex client
                        state, and making APIs feel invisible to the people using the product. My backend experience
                        helps me work fluently across the boundary between a polished interface and the system behind
                        it.
                    </p>
                    <p>
                        Outside the code editor, I&apos;m interested in product thinking, design systems, and the small
                        decisions that make digital tools feel calm and capable.
                    </p>
                    <p>
                        I currently work as a Software Engineer at Netcracker Technology on the OSS team, where I
                        contribute to enterprise software and learn from complex production systems.
                    </p>
                </div>
            </div>
            <div className={styles.achievements}>
                <div>
                    <strong>09</strong>
                    <span>
                        place at
                        <br />
                        Decentrathon 4
                    </span>
                </div>
                <div>
                    <strong>Top 10</strong>
                    <span>
                        technical implementation
                        <br />
                        at nFactorial
                    </span>
                </div>
                <div>
                    <strong>01</strong>
                    <span>
                        practical solution
                        <br />
                        at HalykBank hackathon
                    </span>
                </div>
            </div>
        </section>
    );
}
