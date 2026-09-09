import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ConversationView from './ConversationView.jsx';

const mocks = vi.hoisted(() => ({ speakMessage: vi.fn().mockResolvedValue(undefined) }));

vi.mock('./VoiceButton.jsx', () => ({ default: () => <button type="button">voice input</button> }));
vi.mock('../../../context/AIConversationContext.jsx', () => ({
  useAIConversation: () => ({
    messages: [{ id: 'assistant-1', role: 'assistant', text: 'कृपया खेत देखें', englishText: 'Please inspect the field', time: '10:00 AM' }],
    sendText: vi.fn(), voiceState: 'idle', processing: false, language: 'hi', submitImage: vi.fn(), error: null,
    toolEvents: [], pendingAction: null, resolveConfirmation: vi.fn(), harnessStatus: 'ready', speakMessage: mocks.speakMessage,
  }),
}));

describe('ConversationView', () => {
  it('shows the English interpretation and lets a farmer replay speech', () => {
    Element.prototype.scrollIntoView = vi.fn();
    render(<ConversationView />);
    expect(screen.getByText('कृपया खेत देखें')).toBeTruthy();
    expect(screen.getByText('English interpretation')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Speak this answer' }));
    expect(mocks.speakMessage).toHaveBeenCalledWith(expect.objectContaining({ englishText: 'Please inspect the field' }));
  });
});
