import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import styles from './hero.module.scss';

export function Hero() {
    return (
        <section className={styles.hero} id='top'>
            <div className={styles.copy}>
                <p className={styles.eyebrow}>Frontend developer · Almaty / remote</p>
                <h1 className={styles.title}>
                    Digital products,
                    <br />
                    <em>made human.</em>
                </h1>
                <p className={styles.intro}>
                    I&apos;m Maxim, a frontend developer who turns complex product ideas into clear, useful interfaces.
                </p>
                <Space className={styles.actions} size={28}>
                    <Button
                        className={`${styles.button} ${styles.darkButton}`}
                        href='#experience'
                        icon={<ArrowRightOutlined />}
                        iconPlacement='end'
                    >
                        Explore my work
                    </Button>
                    <a className={styles.link} href='https://github.com' target='_blank' rel='noreferrer'>
                        GitHub <ArrowRightOutlined />
                    </a>
                </Space>
            </div>
            <div className={styles.portraitWrap}>
                <div className={styles.portraitFrame}>
                    <img
                        src='https://avatars.githubusercontent.com/u/147310278?s=400&u=c07b71053b692aebda84b80c61b7ca3cdab8d384&v=4'
                        alt='Portrait of me, a spftware engineer'
                    />
                </div>
                <div className={styles.portraitNote}>
                    Currently learning
                    <br />
                    <strong>enterprise systems</strong>
                </div>
                <div className={`${styles.orbit} ${styles.orbitOne}`} />
                <div className={`${styles.orbit} ${styles.orbitTwo}`} />
            </div>
        </section>
    );
}
