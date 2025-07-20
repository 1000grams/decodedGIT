import decodedMusicLogo from "../assets/decoded-music-logo.png";
import React from 'react';
import styles from '../styles/Section8AWS.module.css';
import content from '../content/landingPage.json'; // Import content
// Placeholder for AWS logo
import awsLogo from '../assets/aws-logo-placeholder.png';
import SuggestionTile from '../components/SuggestionTile.jsx';
import { FaCloud, FaLock, FaRocket } from 'react-icons/fa';

function Section8AWS() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
         <div className={styles.logoBlock}>
            <img src={decodedMusicLogo} alt="Decoded Music Logo" className="h-10 w-auto" />
            <img src={awsLogo} alt="Powered by AWS" className={styles.awsLogo} />
         </div>
         <div className={styles.textBlock}>
            <h4 className={styles.headline}>{content.aws.headline}</h4>
            <p className={styles.bodyText}>
              {content.aws.bodyText}
            </p>
         </div>
         <div style={{ display: 'flex', gap: '1.2rem', marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
           <SuggestionTile icon={<FaCloud />}>
             Powered by AWS Cloud
           </SuggestionTile>
           <SuggestionTile icon={<FaLock />}>
             Enterprise-grade security
           </SuggestionTile>
           <SuggestionTile icon={<FaRocket />}>
             Scalable, future-ready
           </SuggestionTile>
         </div>
      </div>
    </section>
  );
}

export default Section8AWS;
