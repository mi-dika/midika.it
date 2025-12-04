import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StarsBackground } from '@/components/ui/stars-background';

// Minimal ResizeObserver mock for JSDOM
class ResizeObserverMock {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// Mock canvas getContext for JSDOM
const mockCanvasContext = {
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  scale: jest.fn(),
} as any;

HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext);

// Mock getBoundingClientRect for canvas
HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(
  () =>
    ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect
);

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

describe('StarsBackground', () => {
  it('renders a canvas element', () => {
    render(<StarsBackground />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas?.tagName.toLowerCase()).toBe('canvas');
  });
});
