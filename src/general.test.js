import { render, screen } from '@testing-library/react';
import App from './App';

test.each(['Data', 'StrategyList'])('the id "%s" exists', async (id) => {
   await render(<App />)
   expect(document.getElementById(id)).not.toBeNull()
})
