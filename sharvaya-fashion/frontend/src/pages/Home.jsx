import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Collections from '../components/Collections.jsx';
import BrandQuote from '../components/BrandQuote.jsx';
import ContactSection from '../components/ContactSection.jsx';

export default function Home() {
  const location = useLocation();

  // Arriving from another page via "Contact Us" (or /#contact) -> scroll to that section
  useEffect(() => {
    const target = location.state?.scrollTo || (location.hash ? location.hash.slice(1) : '');
    if (!target) return;
    requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [location]);

  return (
    <>
      <Hero />
      <Collections />
      <BrandQuote />
      <ContactSection />
    </>
  );
}
