import { GithubOutlined, LinkedinFilled, MailOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styles from './contact.module.scss';

export function Contact() {
    return (
        <section className={styles.section} id='contact'>
            <div className={styles.inner}>
                <div className={styles.label}>04 / Contact</div>
                <h2 className={styles.title}>
                    Have a good
                    <br />
                    <em>idea?</em>
                </h2>
                <p className={styles.text}>
                    Let&apos;s turn it into something useful, accessible, and a little delightful.
                </p>
                <Button
                    className={styles.button}
                    href='mailto:maksimsarsekeev@gmail.com'
                    icon={<MailOutlined />}
                    iconPlacement='end'
                >
                    maksimsarsekeev@gmail.com
                </Button>
                <div className={styles.links}>
                    <a href='https://github.com/mossimka' target='_blank' rel='noreferrer'>
                        <GithubOutlined /> GitHub <span>↗</span>
                    </a>
                    <a href='https://www.linkedin.com/in/maxim-sarsekeyev-a133ba354/' target='_blank' rel='noreferrer'>
                        <LinkedinFilled /> LinkedIn <span>↗</span>
                    </a>
                    <span className={styles.location}>Planet Earth · Remote</span>
                </div>
            </div>
        </section>
    );
}
