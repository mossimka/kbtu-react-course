import { ConfigProvider } from 'antd';
import { About } from './components/about/about';
import { Contact } from './components/contact/contact';
import { Experience } from './components/experience/experience';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { Skills } from './components/skills/skills';

function App() {
    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#2f8f72', colorText: '#102a2b', borderRadius: 0 } }}>
            <main>
                <Header />
                <Hero />
                <About />
                <Experience />
                <Skills />
                <Contact />
                <Footer />
            </main>
        </ConfigProvider>
    );
}

export default App;
