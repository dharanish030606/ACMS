# Deployment Guide: ACMS Project

Follow these steps to deploy your Automated Curriculum Mapping System to the cloud.

## Part 1: Backend Deployment (Render)

1.  **Sign up/Log in** to [Render.com](https://render.com).
2.  Click **New +** > **Web Service**.
3.  Connect your GitHub repository and select the `ACMS` repo.
4.  **Settings**:
    -   **Name**: `acms-backend`
    -   **Root Directory**: `backend` (Important!)
    -   **Runtime**: `Node`
    -   **Build Command**: `npm install`
    -   **Start Command**: `npm start`
5.  **Environment Variables**:
    Click **Advanced** > **Add Environment Variable**:
    -   `MONGODB_URI`: *Your Atlas Connection String*
    -   `JWT_SECRET`: *A random long string*
    -   `FRONTEND_URL`: *The URL from Part 2 (e.g., https://acms-front.vercel.app)*
6.  Click **Create Web Service**. Copy the service URL (e.g., `https://acms-backend.onrender.com`).

---

## Part 2: Frontend Deployment (Vercel)

1.  **Sign up/Log in** to [Vercel.com](https://vercel.com).
2.  Click **Add New** > **Project**.
3.  Import your GitHub repository.
4.  **Settings**:
    -   **Framework Preset**: `Vite`
    -   **Root Directory**: `frontend` (Important!)
5.  **Environment Variables**:
    -   `VITE_API_URL`: *The Backend URL from Part 1 (e.g., https://acms-backend.onrender.com)*
6.  Click **Deploy**.

---

## Part 3: Final Linkage
Once the frontend is deployed, copy its URL and go back to **Render Settings**. Update the `FRONTEND_URL` environment variable with the actual Vercel URL to allow CORS.
