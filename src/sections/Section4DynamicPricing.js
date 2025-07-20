import React from 'react';
import styles from '../styles/Section4DynamicPricing.module.css';
import Button from '../components/Button.js';
import Icon from '../components/Icon.js';
import content from '../content/landingPage.json'; // Import content
import SuggestionTile from '../components/SuggestionTile.jsx';
import { FaDollarSign, FaChartLine, FaGem } from 'react-icons/fa';

function Section4DynamicPricing() {
  return (
    <section className={styles.section} id="pricing-section">
      <div className={styles.container}>
        <h2 className={styles.headline}>{content.dynamicPricing.headline}</h2>
        <p className={styles.introText}>
          {content.dynamicPricing.introText}
        </p>

        <div className={styles.howItWorksGrid}>
          {content.dynamicPricing.howItWorksItems.map((item, index) => (
             <div key={index} className={`${styles.howItWorksItem} card`}>
                <Icon name={item.icon} size="32px" color="var(--accent-color)" />
                <p>{item.text}</p>
             </div>
          ))}
        </div>

        <div className={styles.priceCalloutBlock}>
            <p className={styles.priceCallout}>{content.dynamicPricing.priceCalloutText} <span className={styles.minPrice}>{content.dynamicPricing.minPrice}</span></p>
             <p className={styles.disclaimer}>{content.dynamicPricing.priceDisclaimer}</p>
        </div>

        {/* Optional: Add Use Cases Headline if needed */}
        {/* <h3 className={styles.useCasesHeadline}>{content.dynamicPricing.useCasesHeadline}</h3> */}

        <div className={styles.useCasesGrid}>
          {content.dynamicPricing.useCases.map((useCase, index) => (
            <div key={index} className={`${styles.useCaseBlock} card`}>
              <Icon name={useCase.icon} size="40px" color="var(--accent-color)" />
              <h4 className={styles.useCaseTitle}>{useCase.title}</h4>
              <p className={styles.useCaseDescription}>{useCase.description}</p>
              <Button variant="outline" color="accent" href={useCase.link}>
                {useCase.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className={styles.beyondBasics}>
             <h4 className={styles.beyondBasicsTitle}>{content.dynamicPricing.beyondBasicsTitle}</h4>
             <ul className={styles.beyondBasicsList}>
                {content.dynamicPricing.beyondBasicsList.map((item, index) => (
                    <li key={index}>
                        <Icon name={item.icon} size="20px" /> {item.text}
                    </li>
                ))}
             </ul>
        </div>


        <div className={styles.finalCta}>
           <Button variant="fill" color="accent" href={content.dynamicPricing.finalCtaHref}>
             {content.dynamicPricing.finalCtaText}
           </Button>
        </div>
        <div style={{ display: 'flex', gap: '1.2rem', marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <SuggestionTile icon={<FaDollarSign />}>
            Dynamic pricing, fair for all
          </SuggestionTile>
          <SuggestionTile icon={<FaChartLine />}>
            Transparent, real-time rates
          </SuggestionTile>
          <SuggestionTile icon={<FaGem />}>
            Premium value, no compromise
          </SuggestionTile>
        </div>
      </div>
    </section>
  );
}

export default Section4DynamicPricing;
