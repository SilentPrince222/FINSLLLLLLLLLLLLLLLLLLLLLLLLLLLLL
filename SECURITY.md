# 🔐 Security

Minimal, practical security for this project. Good enough for hackathons and production demos.

---

## ✅ Authentication

We use **Supabase Auth**, which is maintained by security professionals. You should never build your own auth.

- All users get a secure signed JWT token
- Passwords are never stored, only salted hashes
- Session management is handled automatically
- No plaintext credentials ever touch our code

> This removes 90% of common security vulnerabilities automatically.

---

## 🚪 Route Protection

✅ **3 levels of protection:**

1.  **Client side**
    - Unauthenticated users get redirected automatically
    - No flash of protected content

2.  **API Route side**
    - Every API endpoint validates user session **before running any code**
    - Rejects invalid requests immediately

3.  **Database side**
    - **Row Level Security (RLS) policies** on every table
    - Database will refuse to return data the user is not allowed to see
    - Even if there is a bug in frontend/api, data stays protected

---

## 🧹 Input Validation

- All user input is validated on backend
- No raw user input ever goes directly to database
- No raw user input ever gets sent to OpenAI API
- All output is escaped before rendering in browser

We don't use fancy validation libraries. Just simple checks:
```javascript
// Example
if (grade < 0 || grade > 100) return badRequest()
if (!user.owns(studentId)) return forbidden()
```

---

## 📌 Basic Best Practices

✅ **Things we always do:**
- All secrets only exist in environment variables
- No API keys committed to git
- All cookies are `HttpOnly` and `Secure`
- CORS is restricted to allowed domains only
- We never log user passwords or personal data

❌ **Things we deliberately skip for hackathons:**
- Rate limiting
- Advanced audit logs
- OAuth providers
- Multi factor authentication

These can be added later if needed, but they are not required for a working secure demo.

---

> **Rule:** If you have to ask, always add the security check at database level.