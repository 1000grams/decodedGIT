import React from 'react';
import styles from '../styles/FeatureBlock.module.css';
import Icon from './Icon.js';

function FeatureBlock({ iconName, title, description }) {
  return (
    <div className={styles.featureBlock}>
      <Icon name={iconName} size="40px" />
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.description}>{description}</p>
    </div>
  );
}

export default FeatureBlock;
