import React, { useState, useEffect } from 'react';
import decodedMusicLogo from '../assets/decoded-music-logo.png';
import styles from '../styles/Header.module.css';
import Button from './Button.js';
import content from '../content/landingPage.json';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Inject Google Tag Manager and Snap Pixel once on mount
  useEffect(() => {
    // Google Tag Manager
    if (!document.getElementById('gtag-js')) {
      const gtagScript = document.createElement('script');
      gtagScript.id = 'gtag-js';
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-11CHYW3K6Z';
      document.head.appendChild(gtagScript);

      const gtagInline = document.createElement('script');
      gtagInline.innerHTML = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-11CHYW3K6Z');`;
      document.head.appendChild(gtagInline);
    }

    // Snap Pixel
    if (!document.getElementById('snap-pixel')) {
      const snapScript = document.createElement('script');
      snapScript.id = 'snap-pixel';
      snapScript.type = 'text/javascript';
      snapScript.innerHTML = `
(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
{a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
r.src=n;var u=t.getElementsByTagName(s)[0];
u.parentNode.insertBefore(r,u);})(window,document,
'https://sc-static.net/scevent.min.js');

snaptr('init', '0e29f2de-37c1-4e4f-8274-c4d2f40d4bd7', {
'user_email': '__INSERT_USER_EMAIL__'
});

snaptr('track', 'PAGE_VIEW');
`;
      document.head.appendChild(snapScript);
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <a href="/" onClick={handleNavLinkClick}>
            <img src={decodedMusicLogo} alt="Decoded Music Logo" className="h-10 w-auto" />
          </a>
        </div>
        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}>
          <ul>
            {content.header.navLinks.map((link, index) => (
              <li key={index}>
                <a href={link.href} onClick={handleNavLinkClick}>{link.text}</a>
              </li>
            ))}
          </ul>
          <div className={styles.authButtons}>
            <Button
              variant="outline"
              color="accent"
              href={content.header.signInButtonHref}
              onClick={handleNavLinkClick}
            >
              {content.header.signInButtonText}
            </Button>
            <Button
              variant="fill"
              color="accent"
              href={content.header.signUpButtonHref}
              onClick={handleNavLinkClick}
            >
              {content.header.signUpButtonText}
            </Button>
          </div>
        </nav>
        <button className={styles.burgerMenu} onClick={toggleMobileMenu} aria-label="Toggle navigation menu">
          {/* Replace with burger icon SVG/image */}
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}

export default Header;
