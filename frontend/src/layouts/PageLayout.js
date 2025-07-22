import React from 'react';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

function PageLayout({ children }) {
  return (
    <div>
      <Header />
      <main>
        {children} {/* This will render all the section components */}
      </main>
      <Footer />
    </div>
  );
}

export default PageLayout;
