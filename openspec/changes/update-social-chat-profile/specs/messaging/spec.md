## ADDED Requirements

### Requirement: Recall feedback

The system SHALL display a “message recalled” state to both participants when a recall succeeds.

#### Scenario: Recall within time window

- **WHEN** the sender recalls a message within the allowed time window
- **THEN** both users see a recalled placeholder in the conversation

### Requirement: Report reasons

The system SHALL allow users to report a message with a reason.

#### Scenario: Report message

- **WHEN** a user reports a message
- **THEN** the system records the reason and shows a success acknowledgement

## MODIFIED Requirements

### Requirement: Message list consistency

The message list UI SHALL follow a consistent visual style with the global design system.

#### Scenario: Message list appearance

- **WHEN** the user opens the chat window
- **THEN** message bubbles, timestamps, and status banners are visually consistent
