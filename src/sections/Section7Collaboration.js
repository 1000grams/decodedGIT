import React from 'react';
import styles from '../styles/Section7Collaboration.module.css';
import Button from '../components/Button.js';
import content from '../content/landingPage.json'; // Import content
// Placeholder image for collaboration section
import collaborationImage from '../assets/collaboration-placeholder.jpg';
import SuggestionTile from '../components/SuggestionTile.jsx';
import { FaUsers, FaLightbulb, FaHandshake } from 'react-icons/fa';

function Section7Collaboration() {
  return (
    <section className={styles.section}>
      <div className={styles.frameContainer}>
         <div className={styles.imageBlock}>
            <img src={collaborationImage} alt="Music Collaboration" className={styles.collaborationImage} />
         </div>
         <div className={styles.contentBlock}>
            <h3 className={styles.headline}>{content.collaboration.headline}</h3>
            <p className={styles.bodyText}>
              {content.collaboration.bodyText}
            </p>
            <Button variant="fill" color="accent" href={content.collaboration.ctaHref}>
              {content.collaboration.ctaText}
            </Button>
         </div>
      </div>
      <div style={{ display: 'flex', gap: '1.2rem', marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        <SuggestionTile icon={<FaUsers />}>
          Connect with creators
        </SuggestionTile>
        <SuggestionTile icon={<FaLightbulb />}>
          Spark new ideas
        </SuggestionTile>
        <SuggestionTile icon={<FaHandshake />}>
          Seamless collaboration
        </SuggestionTile>
      </div>
    </section>
  );
}

export default Section7Collaboration;
