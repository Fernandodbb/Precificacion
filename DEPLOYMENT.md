# 🚀 Guía de Despliegue a Producción

Para poner tu aplicación "en internet" (Producción) y que puedas acceder desde cualquier lugar o móvil, te recomendamos usar servicios modernos y gratuitos/baratos como **Render** y **Vercel**.

La arquitectura será:
*   **Backend (Servidor)**: Alojado en Render.com
*   **Frontend (Web)**: Alojado en Vercel.com

---

## 📦 Paso 1: Preparar tu código (GitHub)
1.  Asegúrate de que todo tu código está subido a un repositorio de **GitHub**.
2.  Si no tienes cuenta, crea una y sube la carpeta `Antigravity`.

---

## ⚙️ Paso 2: Desplegar el Backend (Render)
1.  Crea una cuenta en [Render.com](https://render.com).
2.  Haz clic en **"New +"** -> **"Web Service"**.
3.  Conecta tu repositorio de GitHub.
4.  Configura los siguientes campos:
    *   **Root Directory**: `server`
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  **Environment Variables** (Haz clic en "Advanced" o "Environment"):
    Añade las siguientes variables (copia los valores de tu archivo `.env` local):
    *   `PORT`: `10000` (Render usa este por defecto, pero es bueno definirlo)
    *   `GEMINI_API_KEY`: *Tu clave de AI*
    *   `GOOGLE_SHEET_ID_USUARIOS`: *copia el ID*
    *   `GOOGLE_SHEET_ID_PRODUCTOS`: *copia el ID*
    *   `GOOGLE_SHEET_ID_MATERIAS`: *copia el ID*
    *   `GOOGLE_SHEET_ID_CONTABILIDAD`: *copia el ID*
    *   `JWT_SECRET`: *inventa una contraseña larga y segura*
    *   **IMPORTANTE**: Abre tu archivo `server/credentials.json`, copia TODO el contenido (las llaves `{...}`), y crea una variable llamada `GOOGLE_CREDENTIALS_JSON` con ese valor pegado.

6.  Haz clic en **"Create Web Service"**.
7.  Espera a que se despliegue. Al final te dará una URL (ej: `https://tu-app.onrender.com`). **Copia esa URL**.

---

## 🌐 Paso 3: Desplegar el Frontend (Vercel)
1.  Crea una cuenta en [Vercel.com](https://vercel.com).
2.  Haz clic en **"Add New..."** -> **"Project"**.
3.  Importa tu repositorio de GitHub.
4.  Configura el proyecto:
    *   **Root Directory**: Haz clic en "Edit" y selecciona la carpeta `client`.
    *   **Framework Preset**: Vite (se debería detectar solo).
5.  **Environment Variables**:
    *   Vercel necesita saber dónde está tu backend.
    *   Tendrás que modificar tu código frontend para que no apunte a `localhost:5000`.
    *   *Nota técnica*: Lo ideal es crear una variable de entorno en Vercel `VITE_API_URL` con el valor de tu backend en Render (ej: `https://tu-app.onrender.com`).
    *   **IMPORTANTE**: De momento, tu código busca `http://localhost:5000` directamente. Para producción, busca en tu código (`client/src`) todas las referencias a `http://localhost:5000` y cámbialas por la URL de Render, O configura la variable de entorno.

6.  Haz clic en **"Deploy"**.

---

## 🔄 Ajuste Final (CORS)
Cuando tengas la URL de tu Frontend (ej: `https://tu-app.vercel.app`), ve a Render (Backend):
1.  Añade una variable de entorno: `FRONTEND_URL` = `https://tu-app.vercel.app`
2.  Asegúrate de que tu `server/src/config/cors` (si tienes) o `server/index.js` acepte peticiones desde esa URL y no solo localhost.

¡Y ya estaría! 🚀
