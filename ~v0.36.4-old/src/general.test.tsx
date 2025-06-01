import { render } from '@testing-library/react';
import App from './App';

test.each(['TabContent'])('the id "%s" exists', async (id) => {
   render(<App />)
   expect(document.getElementById(id)).not.toBeNull()
})
