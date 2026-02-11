## ADDED Requirements

### Requirement: Unified relationship state

The system SHALL expose and display a unified relationship state between two users (none, following, mutual, friend, pending).

#### Scenario: Status shown on profile

- **WHEN** a user opens another user's profile
- **THEN** the UI shows a single relationship status and the correct CTA(s)

### Requirement: Friend and follow actions are visible

The system SHALL provide both follow/unfollow and friend-request actions where appropriate.

#### Scenario: Add friend from profile

- **WHEN** a user is following another user but not friends
- **THEN** the UI offers an “Add Friend” action and shows pending state after request

## MODIFIED Requirements

### Requirement: Relationship data completeness

The system SHALL return consistent relationship fields required by the UI.

#### Scenario: Relationship APIs return normalized fields

- **WHEN** the client requests relationship status
- **THEN** the response includes both follow and friend status in a normalized format
