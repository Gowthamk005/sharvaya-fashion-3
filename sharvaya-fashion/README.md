# Sharvaya Fashion

The Sharvaya Fashion storefront: a React website, an Express API with MongoDB, and an admin page where
the owner adds products. The site is hosted on Firebase (Hosting for the website, a Cloud Function for the API).

```
sharvaya-fashion/
├── frontend/      React + Vite website (Home, Shop All, About Us, Contact Us, Admin)
├── backend/       Express API, MongoDB (Mongoose), product photos stored in MongoDB (GridFS)
├── firebase.json  Firebase Hosting + Cloud Function settings
└── .firebaserc    Your Firebase project id
```

## 1. Create the database (MongoDB Atlas, free M0 tier)

1. Create a free cluster at https://www.mongodb.com/atlas.
2. **Database Access**: add a database user with a password.
3. **Network Access**: allow access from anywhere (`0.0.0.0/0`). Cloud Functions use IP addresses that change,
   so this is the simple option for a small store.
4. **Connect → Drivers**: copy the connection string. It looks like
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`.

## 2. Run it on your computer

You need Node.js 22 or newer.

```bash
# API
cd backend
cp .env.example .env          # then fill in MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run create-admin          # creates the owner's login from ADMIN_EMAIL / ADMIN_PASSWORD
npm run seed                  # optional: adds 8 sample products (only when the store is empty)
npm run dev                   # API on http://localhost:5001

# Website (in a second terminal)
cd frontend
npm install
npm run dev                   # website on http://localhost:5173 (forwards /api to the API)
```

Open http://localhost:5173. The owner signs in at http://localhost:5173/admin.

Run the API tests with `cd backend && npm test`.

Generate a strong `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## 3. Deploy to Firebase

Cloud Functions needs the Firebase **Blaze** (pay-as-you-go) plan. A small store normally stays inside the
free monthly allowance, but the plan must be enabled.

```bash
npm install -g firebase-tools
firebase login

# 1. Put your Firebase project id in .firebaserc (replace "your-firebase-project-id")

# 2. Store the secrets for the Cloud Function (they are not kept in any file)
firebase functions:secrets:set MONGODB_URI
firebase functions:secrets:set JWT_SECRET

# 3. Install and build
(cd backend && npm install)
(cd frontend && npm install && npm run build)

# 4. Deploy the website and the API
firebase deploy
```

The API runs in the Cloud Function `api` in region `asia-south1` (Mumbai). Firebase Hosting sends every
`/api/...` request to it, and every other address to the website.

To create the owner's login on the live database, run `npm run create-admin` once in `backend/`
with the same `MONGODB_URI` in `backend/.env`. Add sample products the same way with `npm run seed`
if the store is empty.

## 4. Using the admin page

- Sign in at `/admin` with the owner's email and password.
- Add a product with its name, price, sizes, description and photo. Products appear on the home page and
  in **Shop All** straight away.
- The list at the bottom of the admin page shows every Shop All product in the order it was added (newest first).
  Products can be removed one at a time, or all together with **Clear all**.

## Configuration reference

| Variable | Where | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | `backend/.env` locally, Firebase secret when deployed | Database connection |
| `MONGODB_DB` | `backend/.env` | Database name (default `sharvaya`) |
| `JWT_SECRET` | `backend/.env` locally, Firebase secret when deployed | Signs the admin login token |
| `JWT_EXPIRES_IN` | `backend/.env` | How long a sign-in lasts (default `12h`) |
| `CORS_ORIGINS` | `backend/.env` | Only needed if the website is hosted on a different domain |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | `backend/.env` | Used once by `npm run create-admin` (password at least 10 characters) |
| `VITE_API_URL` | `frontend/.env` | Only needed if the API is on a different domain (leave empty on Firebase) |

## Security

- Admin passwords are stored as bcrypt hashes. Admin sign-in tokens last 12 hours.
- Login attempts and the contact form are rate-limited.
- Product photos must be JPG, PNG or WebP and 5 MB or smaller. The server checks the file contents, not just its name.
- Contact messages have a hidden honeypot field to block simple bots.
- Keep `.env` files out of Git. They are already listed in `.gitignore`.
