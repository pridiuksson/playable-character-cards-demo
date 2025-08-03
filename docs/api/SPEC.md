# API Specification (Illustrative)

This document defines the contracts for the three public-facing endpoints of the Playable Character Cards Headless AI Engine. All examples are illustrative and not connected to a live backend.

---

## 1. Data Models

### `Card`
Represents a single playable character.

| Field         | Type     | Description                                  |
|---------------|----------|----------------------------------------------|
| `id`          | `string` | Unique identifier for the card.              |
| `created_at`  | `string` | ISO 8601 timestamp of creation.              |
| `description` | `string` | The personality, backstory, and context.     |
| `goal`        | `string` | The conversational objective for the user.   |
| `image_url`   | `string` | URL to the 512x512 character artwork (JPEG). |

**Example `Card` Object:**
```json
{
  "id": "42",
  "created_at": "2025-07-16T10:00:00Z",
  "description": "A grumpy but brilliant medieval alchemist who begrudgingly teaches chemistry through metaphors about turning lead into gold.",
  "goal": "Explain the concept of a chemical reaction.",
  "image_url": "https://example.com/storage/v1/alchemist.jpg"
}
```

### `PlayTurnResponse`
The response object from a single conversational turn.

| Field              | Type      | Description                                                     |
|--------------------|-----------|-----------------------------------------------------------------|
| `card_id`          | `string`  | The ID of the card in the conversation.                         |
| `card_description` | `string`  | A reminder of the character's personality.                      |
| `card_goal`        | `string`  | A reminder of the conversational goal.                          |
| `user_message`     | `string`  | An echo of the user's input for this turn.                      |
| `ai_response`      | `string`  | The AI character's generated response.                          |
| `is_goal_achieved` | `boolean` | `true` if the AI determines the `card_goal` has been met. |

---

## 2. API Endpoints

### `GET /get-public-cards`
Retrieves a paginated list of all publicly available character cards.

**Query Parameters:**
- `page` (optional, `number`, default: `1`): The page number to retrieve.
- `pageSize` (optional, `number`, default: `20`): The number of cards per page.

**Successful Response (200 OK):**
```json
{
  "items": [
    {
      "id": "42",
      "created_at": "2025-07-16T10:00:00Z",
      "description": "A grumpy but brilliant medieval alchemist...",
      "goal": "Explain the concept of a chemical reaction.",
      "image_url": "https://example.com/storage/v1/alchemist.jpg"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

### `GET /get-card-details`
Retrieves the full details for a single character card.

**Query Parameters:**
- `id` (required, `string`): The ID of the card to retrieve.

**Successful Response (200 OK):**
```json
{
  "id": "42",
  "created_at": "2025-07-16T10:00:00Z",
  "description": "A grumpy but brilliant medieval alchemist...",
  "goal": "Explain the concept of a chemical reaction.",
  "image_url": "https://example.com/storage/v1/alchemist.jpg"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Card not found"
}
```

### `POST /play-turn`
Submits a user's message in a conversation and gets the AI's response.

**Request Body:**
```json
{
  "card_id": "42",
  "user_message": "Can you explain what a catalyst is?"
}
```

**Successful Response (200 OK):**
```json
{
  "card_id": "42",
  "card_description": "A grumpy but brilliant medieval alchemist...",
  "card_goal": "Explain the concept of a chemical reaction.",
  "user_message": "Can you explain what a catalyst is?",
  "ai_response": "Hmph. A catalyst? Think of it as a meddlesome imp that hastens a transformation without being consumed by the fire itself. It pushes the lead and the sulfur to become gold faster, but the imp remains an imp. Now, stop bothering me with simple questions.",
  "is_goal_achieved": false
}
```
