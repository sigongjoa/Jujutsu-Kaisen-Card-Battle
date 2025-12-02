# Architectural Refactoring Plan: From "Toy" to "Production"

Based on the critical review by the Senior Backend Engineer, this document outlines the roadmap to transform the `Jujutsu Kaisen Card Battle` codebase from a prototype into a scalable, secure, and robust TCG engine.

## 1. Core Engine Architecture (The "Heart" Transplant)

**Problem:** The current `GameEngine` is a rigid state machine with immediate execution, lacking the "Stack" mechanics essential for TCGs (chaining, responses).
**Goal:** Implement a proper Event-Driven Architecture with a LIFO Stack.

### 1.1. Implement the Stack System
- **Create `Stack` Class**: A LIFO (Last-In-First-Out) queue to hold `GameAction` objects.
- **Chain Logic**: When a card is played, it goes onto the Stack, not immediately resolved.
- **Priority System**: Implement a `Priority` pointer. After a player adds to the stack, priority passes to the opponent to respond.
- **Resolution**: Only resolve the top of the stack when both players pass priority.

### 1.2. Decouple Rules from Engine
- **Create `PhaseManager`**: Move phase transition logic (Main -> Battle -> End) out of `GameEngine` into a dedicated manager.
- **Create `RuleEngine`**: A stateless service that validates actions (e.g., "Can I play this card now?", "Is this target valid?").
- **Refactor `GameEngine`**: It should act as the coordinator/orchestrator, not the rule enforcer.

## 2. Data-Driven Card System (Scalability)

**Problem:** Cards are hardcoded in TypeScript. Adding cards requires code changes. Effects are hardcoded in switch statements.
**Goal:** Move to a Data-Driven design where cards are defined in JSON/DB and effects are composed of reusable primitives.

### 2.1. JSON Card Definitions
- **Schema Definition**: Define a strict JSON schema for cards.
  ```json
  {
    "id": "card_001",
    "name": "Black Flash",
    "effects": [
      { "type": "DAMAGE", "target": "SELECTED_UNIT", "value": 20 },
      { "type": "HEAL", "target": "SELF_PLAYER", "value": 5 }
    ]
  }
  ```
- **Migration**: Move existing hardcoded cards to `src/data/cards.json`.

### 2.2. Effect System (DSL)
- **Command Pattern**: Create an `EffectCommand` interface.
- **Effect Registry**: Implement handlers for each effect type (`DamageEffect`, `HealEffect`, `DrawEffect`).
- **Composite Effects**: Allow effects to be nested or chained in the data definition.

## 3. Security & Networking (Integrity)

**Problem:** Full `GameState` is sent to clients (exposing opponent's hand). Optimistic UI rollback is naive.
**Goal:** Implement "Fog of War" and robust state synchronization.

### 3.1. Fog of War (View Sanitization)
- **Implement `PlayerView`**: A transformation layer that takes the server `GameState` and a `playerId`, returning a sanitized version.
  - Opponent's Hand: Replace cards with `{ "id": "unknown", "back": true }`.
  - Deck: Remove card order information.
- **Serialization**: Ensure `GameEngine` never sends the raw `GameState` object directly.

### 3.2. Robust Synchronization
- **Action IDs & Versioning**: Tag every state update with a sequence number.
- **Smart Rollback**: Instead of a full state overwrite, send specific "Revert" instructions or a "Force Sync" packet if the client drifts.
- **Input Validation**: Strict server-side validation using the `RuleEngine` before any state change.

## 4. Code Quality & Testing

**Problem:** Tight coupling prevents unit testing. Magic numbers exist in core logic.
**Goal:** Dependency Injection and comprehensive unit tests.

### 4.1. Dependency Injection
- **Refactor Constructor**: `GameEngine` should receive `CardService`, `RuleEngine`, and `StackSystem` via constructor injection.
- **Interfaces**: Define interfaces for all services to allow easy mocking.

### 4.2. Removal of Magic Numbers
- **Config File**: Move constants (Max HP, Starting Hand Size, Max Mana) to a `GameConfig` object/file.

## Execution Roadmap

1.  **Phase 1 (Foundation)**: Setup `Stack` class and `PlayerView` sanitization. (Critical for gameplay and security)
2.  **Phase 2 (Decoupling)**: Extract `CardService` to use JSON and implement basic `EffectRegistry`.
3.  **Phase 3 (Refactoring)**: Rewrite `GameEngine` to use the new Stack and Rule systems.
4.  **Phase 4 (Cleanup)**: Add unit tests and remove all magic numbers.
