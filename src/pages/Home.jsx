import Hero from '../components/home/Hero';
import FeaturedProducts from '../components/home/FeaturedProducts';
import Collections from '../components/home/Collections';
import About from '../components/home/About';
import Contact from '../components/contact/Contact';

export default function Home() {
    return (
        <>
            <Hero />
            <FeaturedProducts />
            <Collections />
            <About />
            <Contact />
        </>
    );
}
