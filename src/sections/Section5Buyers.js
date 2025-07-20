import React from 'react';
import styles from '../styles/Section5Buyers.module.css';
import Button from '../components/Button.js';
import FeatureBlock from '../components/FeatureBlock.js';
import content from '../content/landingPage.json'; // Import content
import SuggestionTile from '../components/SuggestionTile.jsx';
import { FaShoppingCart, FaHandshake, FaShieldAlt } from 'react-icons/fa';

function Section5Buyers() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h3 className={styles.headline}>{content.buyers.headline}</h3>
        <p className={styles.introText}>
          {content.buyers.introText}
        </p>
        <div className={styles.featuresGrid}>
          {content.buyers.features.map((feature, index) => (
            <FeatureBlock
              key={index}
              iconName={feature.iconName}
              title={feature.title}
              description={feature.description}
              className="card"
            />
          ))}
        </div>
        <div className={styles.cta}>
          <Button variant="fill" color="accent" href={content.buyers.ctaHref}>
            {content.buyers.ctaText}
          </Button>
        </div>
        <div style={{ display: 'flex', gap: '1.2rem', marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <SuggestionTile icon={<FaShoppingCart />}>
            Effortless checkout
          </SuggestionTile>
          <SuggestionTile icon={<FaHandshake />}>
            Trusted by top brands
          </SuggestionTile>
          <SuggestionTile icon={<FaShieldAlt />}>
            100% rights-cleared
          </SuggestionTile>
        </div>
      </div>
    </section>
  );
}

export default Section5Buyers;
