import React from 'react';
import Hero from '../components/home/Hero';
import Partners from '../components/home/Partners'; 
import Features from '../components/home/Features';
import Ratings from '../components/home/Ratings'; 
import HowItWorks from '../components/home/HowItWorks';
import FAQ from '../components/home/FAQ';           
import CTA from '../components/home/CTA';
import News from '../components/home/News'; 
import AdminFeatures from '../components/home/AdminFeatures';
import AdminAnalytics from '../components/home/AdminAnalytics';


import oneHouse from '../assets/image/one.jpg';
import oneTwo from '../assets/image/two.jpg';
import oneThree from '../assets/image/three.jpg';
import oneFour from '../assets/image/four.jpg';

const Home = () => {
  const heroImages = [oneHouse, oneTwo, oneThree, oneFour];

  return (
    <main className="w-full">
      <Hero images={heroImages} />
      <Features />
      <HowItWorks />
      <Partners />
      <AdminFeatures />
      <AdminAnalytics />
      <Ratings />
      <News /> 
      <FAQ />
      <CTA />
    </main>
  );
};

export default Home;

