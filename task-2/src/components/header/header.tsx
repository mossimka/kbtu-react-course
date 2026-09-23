import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './header.module.scss';

export function Header() {
    return (
        <header className={styles.topbar}>
            <a className={styles.logo} href='#top' aria-label='Alex portfolio home'>
                MASA<span>.</span>
            </a>
            <nav className={styles.nav} aria-label='Main navigation'>
                <a href='#about'>About</a>
                <a href='#experience'>Experience</a>
                <a href='#contact'>Contact</a>
            </nav>
            <a className={styles.headerLink} href='#contact'>
                Let&apos;s talk <ArrowRightOutlined />
            </a>
        </header>
    );
}
