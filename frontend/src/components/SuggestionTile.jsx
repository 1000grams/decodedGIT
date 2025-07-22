import React from 'react';
import styles from './SuggestionTile.module.css';

function SuggestionTile({ icon, children, ...props }) {
  return (
    <span className={styles.suggestionTile} {...props}>
      {icon && <span className={styles.suggestionIcon}>{icon}</span>}
      {children}
    </span>
  );
}

export default SuggestionTile;
