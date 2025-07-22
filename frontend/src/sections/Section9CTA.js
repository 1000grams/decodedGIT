import React from 'react';
import styles from '../styles/Section9CTA.module.css';
import Button from '../components/Button.js';
import content from '../content/landingPage.json'; // Import content
import SuggestionTile from '../components/SuggestionTile.jsx';
import { FaArrowRight } from 'react-icons/fa';

function Section9CTA() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h3 className={styles.headline}>{content.finalCta.headline}</h3>
        <div className={styles.ctaButtons}>
          <Button variant="fill" color="accent" href={content.finalCta.cta1Href}>
            {content.finalCta.cta1Text}
          </Button>
          <Button variant="outline" color="accent" href={content.finalCta.cta2Href}>
            {content.finalCta.cta2Text}
          </Button>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <SuggestionTile icon={<FaArrowRight />}>
            Zero friction onboarding
          </SuggestionTile>
          <SuggestionTile icon={<FaArrowRight />}>
            Scale your playlist reach
          </SuggestionTile>
          <SuggestionTile icon={<FaArrowRight />}>
            Upload tracks instantly
          </SuggestionTile>
        </div>
      </div>
    </section>
  );
}

export default Section9CTA;
