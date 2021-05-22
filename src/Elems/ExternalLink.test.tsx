import { render, screen } from '@testing-library/react';
import ExternalLink from './ExternalLink';

beforeEach(() => {
   render(<ExternalLink href="https://google.com" children="test text" />);
})

test('it renders', () => {
   expect(screen.getByText("test text")).toBeInTheDocument()
})

// test('it is a link', () => {
//    expect(screen.getByText("test text"))
// })

test('it supports content', () => {
   expect(screen.getByRole('link')).toHaveTextContent("test text")
})
