import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMissions } from '../../services/service';
import styles from './home-page.module.scss';

export function HomePage() {
    const [totalMissions, setTotalMissions] = useState<number | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        void getMissions({ page: 0, size: 1 }, controller.signal)
            .then((result) => setTotalMissions(result.totalElements))
            .catch(() => setTotalMissions(null));

        return () => controller.abort();
    }, []);

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.copy}>
                    <p className={styles.eyebrow}>DEEP SPACE OPERATIONS PLATFORM</p>
                    <h1>
                        Command every
                        <br />
                        mission in orbit.
                    </h1>
                    <p className={styles.lead}>
                        Mission Control is a full-stack operations dashboard for tracking launch manifests, crew
                        assignments, priorities and flight status across the solar system.
                    </p>

                    <div className={styles.actions}>
                        <Link className={styles.primary} to='/missions'>
                            EXPLORE MISSIONS
                        </Link>
                        <Link className={styles.secondary} to='/dashboard'>
                            VIEW DASHBOARD
                        </Link>
                        <Link className={styles.ghost} to='/about'>
                            ABOUT THE PROJECT
                        </Link>
                    </div>

                    <dl className={styles.metrics}>
                        <div>
                            <dt>MISSIONS MANAGED</dt>
                            <dd>{totalMissions === null ? '--' : String(totalMissions).padStart(3, '0')}</dd>
                        </div>
                        <div>
                            <dt>LAUNCH DESTINATIONS</dt>
                            <dd>10+</dd>
                        </div>
                        <div>
                            <dt>SYSTEM STATUS</dt>
                            <dd className={styles.online}>NOMINAL</dd>
                        </div>
                    </dl>
                </div>

                <div className={styles.visual} aria-hidden='true'>
                    <div className={styles.orbit}>
                        <span className={styles.planet} />
                        <span className={styles.satellite}>✦</span>
                        <span className={styles.ring} />
                    </div>
                    <div className={styles.telemetry}>
                        <span>ORBIT // LEO</span>
                        <span>ALT 408 KM</span>
                        <span>VEL 7.66 KM/S</span>
                    </div>
                </div>
            </section>

            <section className={styles.cards}>
                <article>
                    <span className={styles.cardIndex}>01</span>
                    <h2>Searchable manifest</h2>
                    <p>Filter by status and priority, then search across names, destinations and mission types.</p>
                </article>
                <article>
                    <span className={styles.cardIndex}>02</span>
                    <h2>Live mission records</h2>
                    <p>Open any mission for a full briefing, update its status or edit the flight plan in place.</p>
                </article>
                <article>
                    <span className={styles.cardIndex}>03</span>
                    <h2>Fleet analytics</h2>
                    <p>Review crew totals, completion rates and priority breakdowns from the dashboard.</p>
                </article>
            </section>
        </div>
    );
}
