# Krishianaj App 🌾

A full-stack agriculture-focused application designed to connect farmers and consumers, enabling seamless product browsing, purchasing, and management.

---

## 🚀 Features

- 🛒 Product browsing and purchasing
- 👨‍🌾 Farmer and consumer dashboards
- 🔐 Authentication and authorization
- 📦 Order and cart management
- 📡 API-driven architecture

---

## 🛠️ Tech Stack

### Frontend
- React Native / Expo
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

---

## 📁 Project Structure

```
krishianaj-app/
├── frontend/
├── backend/
```

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/sk8infinity18/krishianaj-app.git
cd krishianaj-app
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
BASE_URL=http://localhost:5000
```

Run server:

```bash
npm start
```

---

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Run app:

```bash
npx expo start
```

---

## 🔒 Environment Variables

### Backend

- `PORT`
- `BASE_URL`

### Frontend

- `EXPO_PUBLIC_API_BASE_URL`

---

## ⚠️ Security Notes

- Never commit `.env` files
- Use `.env.example` for reference
- Rotate secrets if exposed

---

## 🤝 Contributing

Feel free to fork the repo and submit pull requests.

---

## 📄 License

This project is for educational purposes.
