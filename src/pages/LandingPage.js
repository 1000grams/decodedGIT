import React from 'react';
import PageLayout from '../layouts/PageLayout.js';
import Section1Hero from '../sections/Section1Hero.js';
import Section2ProblemSolution from '../sections/Section2ProblemSolution.js';
import Section3ArtistShowcase from '../sections/Section3ArtistShowcase.js';
import Section4DynamicPricing from '../sections/Section4DynamicPricing.js';
import Section5Buyers from '../sections/Section5Buyers.js';
import Section6Artists from '../sections/Section6Artists.js';
import Section7Collaboration from '../sections/Section7Collaboration.js';
import Section8AWS from '../sections/Section8AWS.js';
import Section9CTA from '../sections/Section9CTA.js';

function LandingPage() {
  return (
    <PageLayout>
      <Section1Hero />
      <Section2ProblemSolution />
      <Section3ArtistShowcase />
      <Section4DynamicPricing />
      <Section5Buyers />
      <Section6Artists />
      <Section7Collaboration />
      <Section8AWS />
      <Section9CTA />
    </PageLayout>
  );
}

export default LandingPage;
