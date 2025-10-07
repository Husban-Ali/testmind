# Maker Backend

Role-based email backend (Express + MongoDB + JWT + Nodemailer)

## Features
- User registration & login (bcrypt hashed passwords)
- Roles: OFFICE_MANAGER, IT_MANAGER, CEO
- Protected email sending (only IT_MANAGER or CEO can send)
- Beautiful HTML email (logo + role signature)
- Clean folder structure
- JWT auth

## Stack
- Node.js / Express
- MongoDB / Mongoose
- Nodemailer
- JWT Auth
- express-validator

## Setup

```bash
git clone <your-repo> maker-backend
cd maker-backend
cp .env.example .env   # edit values
npm install
npm run dev
```

Mongo must be running:
```bash
mongod
```

## Test API (example with curl)

1. Register IT Manager
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Imran Abbas","email":"imran@example.com","password":"Secret123","role":"IT_MANAGER"}'
```

2. Register Office Manager
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Ali Raza","email":"ali@example.com","password":"Secret123","role":"OFFICE_MANAGER"}'
```

3. Login (IT Manager)
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"imran@example.com","password":"Secret123"}'
```

Copy the "token" from the response.

4. Send an Email
```bash
curl -X POST http://localhost:4000/api/email/send \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"toEmail":"ali@example.com","subject":"System Update","message":"Please note scheduled maintenance.\n\nLet me know if questions."}'
```

## Folder Structure
```
src/
  app.js
  server.js
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  templates/
  utils/
  validations/
```

## Production Notes
- Change JWT_SECRET
- Use real SMTP credentials
- Restrict CORS
- Add rate limiting
- Consider queue for heavy email load

## License
MIT (adjust as needed)