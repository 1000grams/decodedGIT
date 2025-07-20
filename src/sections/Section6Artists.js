import React from 'react';
import styles from '../styles/Section6Artists.module.css';
import Button from '../components/Button.js';
import FeatureBlock from '../components/FeatureBlock.js';
import content from '../content/landingPage.json'; // Import content
import SuggestionTile from '../components/SuggestionTile.jsx';
import { FaMicrophone, FaGlobe, FaStar } from 'react-icons/fa';

function Section6Artists() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h3 className={styles.headline}>{content.artists.headline}</h3>
        <p className={styles.tagline}>{content.artists.tagline}</p>
        <p className={styles.introText}>
          {content.artists.introText}
        </p>
        <div className={styles.featuresGrid}>
          {content.artists.features.map((feature, index) => (
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
          <Button variant="fill" color="accent" href={content.artists.ctaHref}>
            {content.artists.ctaText}
          </Button>
        </div>
        <div style={{ display: 'flex', gap: '1.2rem', marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <SuggestionTile icon={<FaMicrophone />}>
            For artists, by artists
          </SuggestionTile>
          <SuggestionTile icon={<FaGlobe />}>
            Global reach, instant impact
          </SuggestionTile>
          <SuggestionTile icon={<FaStar />}>
            Stand out, get discovered
          </SuggestionTile>
        </div>
      </div>
    </section>
  );
}

export default Section6Artists;
