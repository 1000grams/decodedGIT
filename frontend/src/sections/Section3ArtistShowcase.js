import React, { useState } from 'react';
import styles from '../styles/Section3ArtistShowcase.module.css';
import Button from '../components/Button.js';
import Icon from '../components/Icon.js';
import content from '../content/landingPage.json';
import rueDeVivreImage from '../assets/rue-de-vivre-placeholder.jpg';
import SuggestionTile from '../components/SuggestionTile.jsx';
import { FaSpotify, FaHeadphones, FaAward } from 'react-icons/fa';

// Use the correct Spotify artist ID for Rue de Vivre
const SPOTIFY_ARTIST_ID = '293x3NAIGPR4RCJrFkzs0P';
const SPOTIFY_ARTIST_URL = `https://open.spotify.com/artist/${SPOTIFY_ARTIST_ID}`;
const SPOTIFY_EMBED_URL = `https://open.spotify.com/embed/artist/${SPOTIFY_ARTIST_ID}?utm_source=generator&theme=0`;

function Section3ArtistShowcase() {
  // If you want to keep the carousel, you can add more embeds to this array
  const spotifyEmbeds = [
    { src: SPOTIFY_EMBED_URL }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % spotifyEmbeds.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + spotifyEmbeds.length) % spotifyEmbeds.length);
  };

  const currentEmbedSrc = spotifyEmbeds[currentIndex].src;

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionHeadline}>{content.artistShowcase.headline}</h3>
      <div className={styles.frameContainer}>
        <div className={styles.featuredArtistBlock}>
          <img src={rueDeVivreImage} alt="Rue de Vivre" className={styles.artistImage} />
          <h4 className={styles.blockSubHeadline}>{content.artistShowcase.featuredArtistSubHeadline}</h4>
          <p className={styles.blockBody}>
            {content.artistShowcase.featuredArtistBody}
          </p>
          <div className={styles.ctaButtons}>
            <Button variant="outline" color="accent" href={content.artistShowcase.browseCatalogCtaHref}>
              {content.artistShowcase.browseCatalogCtaText}
            </Button>
            <Button variant="fill" color="accent" href={content.artistShowcase.licenseSoundCtaHref}>
               {content.artistShowcase.licenseSoundCtaText}
            </Button>
            {/* Add a direct Spotify artist link */}
            <Button variant="outline" color="spotify" href={SPOTIFY_ARTIST_URL} target="_blank">
              Discover more on Spotify
            </Button>
          </div>
          {/* Dotted box for empty/category area */}
          <div className={styles.dottedBox}>
            <span className={styles.placeholderText}>More artist features coming soon</span>
          </div>
          <div style={{ display: 'flex', gap: '1.2rem', marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            <SuggestionTile icon={<FaSpotify />}>
              Stream on Spotify
            </SuggestionTile>
            <SuggestionTile icon={<FaHeadphones />}>
              Listen. License. Launch.
            </SuggestionTile>
            <SuggestionTile icon={<FaAward />}>
              Artist spotlight: Rue de Vivre
            </SuggestionTile>
          </div>
        </div>
        <div className={styles.spotifyBlock}>
           <h4 className={styles.blockSubHeadline}>{content.artistShowcase.spotifyExploreSubHeadline}</h4>
           <div className={styles.carouselContainer}>
               <iframe
                   style={{ borderRadius:'12px' }}
                   src={currentEmbedSrc}
                   width="100%"
                   height="352"
                   frameBorder="0"
                   allowFullScreen=""
                   allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                   loading="lazy"
                   title={`Spotify Embed ${currentIndex + 1} of ${spotifyEmbeds.length}`}
                ></iframe>
                {/* Carousel arrows are hidden if only one embed */}
                {spotifyEmbeds.length > 1 && (
                  <>
                    <button
                        className={`${styles.carouselArrow} ${styles.prev}`}
                        onClick={goToPrevious}
                        aria-label="Previous track/album"
                    >
                        <Icon name="arrow-left" size="20px" color="var(--accent-color)" />
                    </button>
                    <button
                        className={`${styles.carouselArrow} ${styles.next}`}
                        onClick={goToNext}
                        aria-label="Next track/album"
                    >
                        <Icon name="arrow-right" size="20px" color="var(--accent-color)" />
                    </button>
                  </>
                )}
           </div>
           <p className={styles.spotifyDisclaimer}>{content.artistShowcase.spotifyDisclaimer}</p>
           <p className={styles.indexIndicator}>
                {currentIndex + 1} / {spotifyEmbeds.length}
           </p>
        </div>
      </div>
    </section>
  );
}

export default Section3ArtistShowcase;
