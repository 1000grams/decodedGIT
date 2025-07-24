import { useState } from 'react';
import MarketingPanel from '../../components/MarketingPanel.jsx';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Fix Artist ID</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/features/fixArtistId/App.jsx</code> and save to test HMR
        </p>
      </div>
      <MarketingPanel user={{ username: 'DemoUser' }} />
    </>
  );
}

export default App;
