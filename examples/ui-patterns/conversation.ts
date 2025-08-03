// Illustrative pseudo-code for a conversation UI component
// This is not runnable and is for demonstration purposes only.

// Assumes the existence of functions to update the UI
declare function appendMessage(sender: 'user' | 'ai', text: string): void;
declare function showGoalAchievedBanner(): void;
declare function disableUserInput(): void;

interface PlayTurnResponse {
  ai_response: string;
  is_goal_achieved: boolean;
}

class ConversationManager {
  private cardId: string;
  private messageInput: HTMLInputElement;
  private sendButton: HTMLButtonElement;

  constructor(cardId: string) {
    this.cardId = cardId;
    this.messageInput = document.getElementById('message-input') as HTMLInputElement;
    this.sendButton = document.getElementById('send-button') as HTMLButtonElement;

    this.sendButton.addEventListener('click', () => this.handleSendMessage());
  }

  async handleSendMessage() {
    const userMessage = this.messageInput.value.trim();
    if (!userMessage) return;

    appendMessage('user', userMessage);
    this.messageInput.value = '';
    this.sendButton.disabled = true;

    try {
      const response = await fetch('/play-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: this.cardId,
          user_message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const turnResult: PlayTurnResponse = await response.json();
      
      appendMessage('ai', turnResult.ai_response);

      if (turnResult.is_goal_achieved) {
        showGoalAchievedBanner();
        disableUserInput();
      }

    } catch (error) {
      console.error("Failed to process turn:", error);
      appendMessage('ai', "Sorry, I'm having a little trouble thinking right now.");
    } finally {
      this.sendButton.disabled = false;
    }
  }
}

// Example of how it might be initialized
// const urlParams = new URLSearchParams(window.location.search);
// const cardId = urlParams.get('cardId');
// if (cardId) {
//   new ConversationManager(cardId);
// }
