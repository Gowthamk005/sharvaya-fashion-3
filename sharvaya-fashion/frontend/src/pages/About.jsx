import AboutHero from '../components/about/AboutHero.jsx';
import AboutStory from '../components/about/AboutStory.jsx';
import AboutValues from '../components/about/AboutValues.jsx';
import ContactSection from '../components/ContactSection.jsx';
import './About.css';

// The About page ends with the Contact Us section, as requested.
export default function About() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <ContactSection />
    </>
  );
}
