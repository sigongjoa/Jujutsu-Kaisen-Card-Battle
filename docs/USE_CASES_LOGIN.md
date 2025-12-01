# Login Page Use Cases & Test Plan

## 1. Use Case Definitions

### UC-01: View Login Page
- **Actor**: Guest User
- **Description**: User navigates to the login page.
- **Preconditions**: None.
- **Postconditions**: User sees the 4-layer login UI (Background, Frame, Inputs, VFX).
- **Acceptance Criteria**:
  - Background image is visible.
  - Modal frame is centered.
  - "LOGIN" or "REGISTER" header is visible.
  - Username and Password inputs are visible.
  - Login button is visible.
  - Social icons are visible.
  - VFX (Aura, Fog) elements are present in the DOM.

### UC-02: Switch between Login and Register
- **Actor**: Guest User
- **Description**: User toggles between Login and Registration modes.
- **Flow**:
  1. User clicks "Create Account" (or "Switch to Register").
  2. Form title changes to "REGISTER".
  3. "Email" input field appears.
  4. Button text changes to "REGISTER".
  5. Link text changes to "Back to Login".
  6. User clicks "Back to Login".
  7. Form reverts to "LOGIN" mode.

### UC-03: User Login (Success)
- **Actor**: Registered User
- **Description**: User logs in with valid credentials.
- **Flow**:
  1. User enters valid Username.
  2. User enters valid Password.
  3. User clicks "LOGIN".
  4. System validates credentials via API.
  5. System redirects user to Dashboard (`/`).

### UC-04: User Login (Failure)
- **Actor**: Guest User
- **Description**: User attempts login with invalid credentials.
- **Flow**:
  1. User enters invalid Username or Password.
  2. User clicks "LOGIN".
  3. System returns error.
  4. Error message is displayed in red.

### UC-05: User Registration
- **Actor**: New User
- **Description**: User creates a new account.
- **Flow**:
  1. User switches to Register mode.
  2. User enters Username, Password, and Email.
  3. User clicks "REGISTER".
  4. System creates account and logs user in.
  5. System redirects to Dashboard.

---

## 2. Test Strategy

### Unit Tests (Jest + React Testing Library)
- Verify Component Rendering: Ensure all inputs and buttons render.
- Verify State Changes: Click "Create Account" and check if Email input appears.
- Verify Form Submission: Mock API call and check if `loginSuccess` action is dispatched.

### E2E Tests (Playwright)
- Visual Verification: Check if specific CSS classes for Layers (1-4) exist.
- Interaction Flow:
  - Go to `/login`.
  - Fill form.
  - Click button.
  - Verify navigation or error message.
