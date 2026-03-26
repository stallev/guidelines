# User registration, password recovery, and change-password requirements

This document defines requirements for registering new users (email/password), recovering a forgotten password, and changing password while authenticated. It is intended for AI agents and implementers. All requirements are tied to authoritative sources. Implementation of these flows may be scheduled in separate phases/tasks after basic login and logout.

**Sources used:** [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html) (Digital Identity Guidelines – Authentication and Lifecycle Management). Where applicable, Auth.js v5 is referenced for integration with existing auth.

---

## 1. New user registration (email/password)

**Sources:** OWASP Authentication Cheat Sheet (password strength, storage, error messages), OWASP Forgot Password (consistent responses, no account enumeration), NIST SP 800-63B (password composition, length), OWASP Input Validation for email.

### 1.1 Validation

- **Server-side only:** Validate email and password on the server (e.g. with **Zod** or equivalent). Do not rely on client-side validation for security.
- **Email:** Validate format and, if applicable, domain. Follow input validation and email-address guidance (e.g. OWASP Input Validation Cheat Sheet). Reject invalid or disposable addresses if policy requires.
- **Password policy:** Enforce a minimum length and, if not following NIST’s “memorized secret” guidance, consider complexity (mix of character types). *NIST SP 800-63B:* allows long passphrases with minimal complexity; shorter passwords are considered weak unless MFA is used. Choose a consistent policy (e.g. minimum 8 characters, or NIST-aligned longer minimum) and document it.

### 1.2 Password storage

- **Hash on server only:** Hash passwords only on the server using a strong, adaptive function (e.g. **bcrypt**). Never send or store plaintext passwords. *OWASP Authentication Cheat Sheet: "Store Passwords in a Secure Fashion"*; see also Password Storage Cheat Sheet.
- **Comparison:** Use constant-time, safe comparison when checking passwords (framework/language helpers preferred). *OWASP: "Compare Password Hashes Using Safe Functions".*

### 1.3 Optional: email verification

- If email verification is implemented: send a **time-limited, single-use token or link** (e.g. 24–48 hours). Do not send the password by email. Mark the account as verified only after the user completes the verification step.

### 1.4 Protection against abuse and enumeration

- **Brute-force / abuse:** Apply rate limiting or similar controls on registration (e.g. per IP or per email) to limit automated sign-ups. *OWASP Forgot Password: "Implement protections against excessive automated submissions".*
- **Duplicate registration:** Reject or handle duplicate email according to product rules (e.g. "An account with this email already exists" only after rate limiting and without leaking whether the email exists to unauthenticated callers when possible).
- **Generic error responses:** Use a **single, generic error message** for registration failures where appropriate (e.g. invalid input vs. email already exists) to reduce user enumeration. *OWASP Authentication Cheat Sheet: "Authentication and Error Messages"* — same principle applies to registration; *OWASP Forgot Password: "Return a consistent message for both existent and non-existent accounts"* for request-by-email flows.

### 1.5 Integration with Auth.js v5

- If registration is implemented alongside Auth.js 5: registration is a separate flow (create user + hash in DB); the user then signs in via the Credentials provider. Do not bypass Auth.js session handling; use the same password hashing as in the Credentials authorize callback.

---

## 2. Forgot password (password recovery)

**Sources:** [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), NIST SP 800-63B (recovery flows).

### 2.1 Request by email

- **Request step:** User submits email (or username). Do not change the account (e.g. do not lock it) based on this request alone. *OWASP Forgot Password: "Do not make a change to the account until a valid token is presented".*
- **Response:** Return the **same generic message** whether the account exists or not (e.g. "If an account exists with this email, you will receive a reset link"). Use consistent response timing to avoid time-based enumeration. *OWASP Forgot Password: "Return a consistent message for both existent and non-existent accounts", "Ensure that responses return in a consistent amount of time".*
- **Rate limiting:** Limit requests (e.g. per email and per IP) to prevent abuse and flooding. *OWASP Forgot Password: "Implement protections against excessive automated submissions".*

### 2.2 Reset token

- **Generation:** Use a **cryptographically secure random** token (or a signed, short-lived token). Token must be **single-use** and **time-limited** (e.g. 1 hour). *OWASP Forgot Password: "Single use and expire after an appropriate period", "Randomly generated using a cryptographically safe algorithm".*
- **Storage:** Store the token (or its hash) securely on the server; associate it with the user and expiry. Do not store the new password until the user submits it after validating the token.
- **Delivery:** Send a **link containing the token** (e.g. `https://site.com/reset-password?token=...`). **Do not send the new or current password by email.** *OWASP Forgot Password: URL tokens, "Don't send the password in the email"; NIST recovery guidance.*
- **URL safety:** Build the reset URL from a trusted base (e.g. config); do not rely on the Host header to avoid Host header injection. Use HTTPS. *OWASP Forgot Password: "Don't rely on the Host header", "Ensure that the URL is using HTTPS".*

### 2.3 Reset password page

- **Validation:** The reset-password page must accept only a **valid, unexpired token**. If the token is invalid or expired, show a generic error and do not reveal whether the token or account exists.
- **New password:** Apply the **same password policy** as for registration (length, complexity if applicable). User must enter the new password twice; both must match. *OWASP Forgot Password: "The user should confirm the password they set by writing it twice", "Ensure that a secure password policy is in place".*
- **Storage:** Hash the new password on the server (e.g. bcrypt) and update the user record. *OWASP Forgot Password: "Update and store the password following secure practices".*
- **After reset:** Invalidate the token immediately so it cannot be reused. Optionally invalidate existing sessions for that user. Notify the user (e.g. email) that the password was reset; do not include the password in the email. *OWASP Forgot Password: "Send the user an email informing them that their password has been reset (do not send the password in the email!)".*
- **Login:** User signs in through the normal login flow after reset; do not auto-log them in unless the product explicitly requires it and the security implications are accepted. *OWASP Forgot Password: "Once they have set their new password, the user should then login through the usual mechanism."*

### 2.4 Account lockout

- **Do not lock the account** solely because of forgot-password requests; locking can be abused to deny service to known accounts. *OWASP Forgot Password: "Accounts should not be locked out in response to a forgotten password attack".*

---

## 3. Change password (authenticated user)

**Sources:** [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) (Change Password Feature, Re-authentication).

### 3.1 Access control

- **Authenticated only:** The change-password flow is available only to a user with an **active, valid session**. Reject unauthenticated requests.

### 3.2 Current password verification

- **Require current password:** User must submit their **current password** and the **new password**. Verify the current password on the server (constant-time comparison with stored hash). *OWASP Authentication Cheat Sheet: "Change Password Feature" — "Current password verification. This is to ensure that it's the legitimate user who is changing the password."* This mitigates abuse when someone has temporary access to the session (e.g. public computer).

### 3.3 New password

- **Policy:** Apply the **same policy** as for registration (minimum length, complexity if applicable). Validate on the server.
- **Storage:** Hash the new password on the server (e.g. bcrypt) and update the user record. Do not log or expose the new password.

### 3.4 After change

- **Session:** Optionally refresh or invalidate the session and require re-login after a password change (depends on product and OWASP “Reauthentication After Risk Events” guidance).
- **Rate limiting:** Limit failed “current password” attempts (e.g. per session or per account) to reduce brute-force risk. *OWASP: "Require Re-authentication for Sensitive Features" and reauthentication mechanisms.*

---

## 4. Summary and references

| Flow            | Key requirements                                                                 | Primary source(s)     |
|-----------------|-----------------------------------------------------------------------------------|------------------------|
| Registration    | Server validation (Zod), password policy, bcrypt, generic errors, rate limiting  | OWASP Auth, NIST 800-63B |
| Forgot password | Same response for existent/non-existent; single-use, time-limited token; link only; no password in email; invalidate token after reset | OWASP Forgot Password, NIST |
| Change password | Authenticated only; verify current password; same policy for new; hash on server; optional re-login; rate limit failures | OWASP Authentication  |

- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html  
- OWASP Forgot Password Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html  
- NIST SP 800-63B: https://pages.nist.gov/800-63-3/sp800-63b.html (memorized secrets, recovery).  
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html  

Implementation of registration, forgot-password, and change-password can be split into separate phases or tasks after basic login and logout are in place.
