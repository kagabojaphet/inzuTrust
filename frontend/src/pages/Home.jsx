import Hero from '../components/home/Hero';
import FeaturedProperties from '../components/home/FeaturedProperties';
import Features from '../components/home/Features';
import HowItWorks from '../components/home/HowItWorks';
import Partners from '../components/home/Partners';
import AdminFeatures from '../components/home/AdminFeatures';
import AdminAnalytics from '../components/home/AdminAnalytics';
import Ratings from '../components/home/Ratings';
import News from '../components/home/News';
import FAQ from '../components/home/FAQ';
import CTA from '../components/home/CTA';

import oneHouse from '../assets/image/One.jpg';
import oneTwo from '../assets/image/Two.jpg';
import oneThree from '../assets/image/Three.jpg';
import oneFour from '../assets/image/Four.jpg';

const Home = () => {
  const heroImages = [oneHouse, oneTwo, oneThree, oneFour];

  return (
    <main className="w-full">

      <Hero images={heroImages} />

      {/* 🔥 CRITICAL MARKETPLACE SECTION */}
      <FeaturedProperties />
 <Partners />
 <AdminFeatures />
      <AdminAnalytics />
      {/* <Features /> */}

      {/* <HowItWorks /> */}
     
      
      <Ratings />
      <News />
      <FAQ />
      <CTA />

    </main>
  );
};

export default Home;