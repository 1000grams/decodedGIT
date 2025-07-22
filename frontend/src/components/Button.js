import React from 'react';
import styles from '../styles/Button.module.css';

function Button({ children, variant = 'fill', color = 'accent', href, onClick }) {
  const className = `${styles.button} ${styles[variant]} ${styles[color]}`;

  if (href) {
    return (
      <a className={className} href={href} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
