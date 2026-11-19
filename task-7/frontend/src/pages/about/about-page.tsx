import { Link } from 'react-router-dom';
import styles from './about-page.module.scss';

const stack = [
    { label: 'Frontend', value: 'React 19 + TypeScript + Vite' },
    { label: 'Routing', value: 'React Router 7 (nested routes, lazy pages)' },
    { label: 'Styling', value: 'SCSS modules + Ant Design icons' },
    { label: 'Backend', value: 'Spring Boot 3 REST API + JPA' },
    { label: 'Database', value: 'PostgreSQL' },
    { label: 'Deployment', value: 'Vercel frontend + Render backend' },
];

export function AboutPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <p className={styles.eyebrow}>ABOUT THE PROJECT</p>
                <h1>Built for mission operations.</h1>
                <p className={styles.lead}>
                    Mission Control is a midterm full-stack project that models a deep space operations console. It
                    combines a typed React frontend with a Spring Boot API to manage a searchable, filterable mission
                    manifest.
                </p>
            </header>

            <section className={styles.grid}>
                <div className={styles.panel}>
                    <h2>Purpose</h2>
                    <p>
                        The application demonstrates client-side routing, server-driven search and pagination, dynamic
                        route parameters and complete request states. Operators can review missions, create new flight
                        plans and update mission records without a full page reload.
                    </p>
                    <p>
                        Dashboard analytics are calculated from live API data rather than hardcoded values, so the
                        numbers always match the current manifest.
                    </p>
                </div>

                <div className={styles.panel}>
                    <h2>API and backend</h2>
                    <p>
                        The Spring Boot service exposes <code>/api/missions</code> for listing, reading, creating,
                        updating and deleting missions. Listing supports search, status, priority and mission-type
                        filters, plus whitelisted sorting and pagination.
                    </p>
                    <p>
                        The frontend talks to it through a single typed service layer in{' '}
                        <code>src/services/service.ts</code>, which normalises backend enums for the UI.
                    </p>
                </div>
            </section>

            <section className={styles.stackSection}>
                <h2>Technology stack</h2>
                <dl className={styles.stack}>
                    {stack.map((item) => (
                        <div key={item.label}>
                            <dt>{item.label}</dt>
                            <dd>{item.value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className={styles.cta}>
                <div>
                    <p className={styles.eyebrow}>READY WHEN YOU ARE</p>
                    <h2>Return to the flight manifest.</h2>
                </div>
                <div className={styles.actions}>
                    <Link className={styles.primary} to='/missions'>
                        VIEW MISSIONS
                    </Link>
                    <Link className={styles.secondary} to='/dashboard'>
                        OPEN DASHBOARD
                    </Link>
                </div>
            </section>
        </div>
    );
}
