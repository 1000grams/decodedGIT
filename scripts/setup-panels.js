const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../src');
const CMP = path.join(SRC, 'components');
const CSS  = path.join(SRC, 'App.css');

const panels = [
  { name: 'MarketingPanel', content: `import React from 'react';

export default function MarketingPanel({ user }) {
  return <div>👋 Marketing data for {user?.username || 'Guest'}</div>;
}` },
  { name: 'CatalogPanel', content: `import React from 'react';

export default function CatalogPanel({ user }) {
  return <div>📚 Catalog items for {user?.username || 'Guest'}</div>;
}` },
  { name: 'AnalyticsPanel', content: `import React from 'react';

export default function AnalyticsPanel({ user }) {
  return <div>📊 Analytics for {user?.username || 'Guest'}</div>;
}` },
];

// 1) Ensure components folder
if (!fs.existsSync(CMP)) {
  fs.mkdirSync(CMP, { recursive: true });
  console.log(`✅ Created folder: ${CMP}`);
}

// 2) Create missing panel files
panels.forEach(p => {
  const file = path.join(CMP, p.name + '.jsx');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, p.content, 'utf8');
    console.log(`✅ Created component: ${p.name}.jsx`);
  } else {
    console.log(`– ${p.name}.jsx already exists`);
  }
});

// 3) Ensure .main-nav style in App.css
let css = fs.readFileSync(CSS, 'utf8');
if (!/\.main-nav\s*\{/.test(css)) {
  const snippet = `\n/* nav bar */\n.main-nav {\n  display: flex;\n  gap: 1rem;\n  background: #222;\n  padding: 0.5rem;\n  align-items: center;\n}\n`;
  fs.appendFileSync(CSS, snippet, 'utf8');
  console.log('✅ Appended .main-nav styles to App.css');
} else {
  console.log('– .main-nav already defined in App.css');
}

console.log('🎉 setup-panels complete!');