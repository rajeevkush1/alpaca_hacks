import { describe, it, expect } from 'vitest';
import { AutonomousAgentLoop } from '../agent/loop.js';

describe('AutonomousAgentLoop State Transitions', () => {
  it('should initialize in STOPPED state', () => {
    const loop = new AutonomousAgentLoop();
    expect(loop.getStatus()).toBe('STOPPED');
  });

  it('should transition through state controls correctly', () => {
    const loop = new AutonomousAgentLoop();
    loop.start();
    expect(loop.getStatus()).toBe('RUNNING');

    loop.pause();
    expect(loop.getStatus()).toBe('PAUSED');

    loop.stop();
    expect(loop.getStatus()).toBe('STOPPED');
  });
});
