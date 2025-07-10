# Authentication Guide

Vida Coach uses JSON Web Tokens (JWT) with role-based access. Users register as **user** or **admin**. Admin signup requires the access code `VIDA_ADMIN_2025`.

**Key Docs**
- [Role-Based System](ROLE_BASED_SYSTEM_COMPLETE.md)
- [Auth Routes](FINAL_AUTH_SYSTEM_COMPLETE.md)

After login, include the token in the `Authorization` header for all requests:

```http
Authorization: Bearer <token>
```

Refer to the docs above for complete route examples and dashboard behavior.

