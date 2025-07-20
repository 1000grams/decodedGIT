import React from 'react';
import styles from '../styles/Section2ProblemSolution.module.css';
import Icon from '../components/Icon.js'; // Updated import for Icon
import content from '../content/landingPage.json'; // Import content
import SuggestionTile from '../components/SuggestionTile.jsx';
import { FaBolt, FaShieldAlt, FaCrown } from 'react-icons/fa';

function Section2ProblemSolution() {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionHeadline}>{content.problemSolution.headline}</h3>
      <p className={styles.sectionIntro}>{content.problemSolution.introText}</p> {/* Added intro text */}
      <div className={styles.frameContainer}>
        <div className={styles.problemBlock}>
          <Icon name="friction" size="40px" color="var(--text-color)" />
          <h4 className={styles.blockTitle}>{content.problemSolution.problemTitle}</h4>
          <p className={styles.blockBody}>
            {content.problemSolution.problemBody}
          </p>
          <ul className={styles.bulletPoints}>
            {content.problemSolution.problemBulletPoints.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={styles.solutionBlock}>
          <Icon name="flow" size="40px" color="var(--accent-color)" />
          <h4 className={styles.blockTitle}>{content.problemSolution.solutionTitle}</h4>
          <p className={styles.blockBody}>
            {content.problemSolution.solutionBody}
          </p>
           <ul className={styles.bulletPoints}>
            {content.problemSolution.solutionBulletPoints.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
       <p className={styles.techMention}>
          {content.problemSolution.techMention}
       </p>
       <div style={{ display: 'flex', gap: '1.2rem', marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
         <SuggestionTile icon={<FaBolt />}>
           Instant access, zero hassle
         </SuggestionTile>
         <SuggestionTile icon={<FaShieldAlt />}>
           Secure, rights-cleared music
         </SuggestionTile>
         <SuggestionTile icon={<FaCrown />}>
           Premium experience, always
         </SuggestionTile>
       </div>
    </section>
  );
}

export default Section2ProblemSolution;
