# 🚀 Guía de Despliegue a Producción

Para poner tu aplicación "en internet" (Producción) y que puedas acceder desde cualquier lugar o móvil, seguiremos estos pasos:

---

## 📦 Paso 1: Preparar tu código (GitHub)
1.  Asegúrate de que todo tu código esté subido a un repositorio de **GitHub**.
2.  Si no tienes cuenta, crea una y sube la carpeta `Antigravity`. El archivo `render.yaml` que he creado debe estar en la raíz del repositorio.

---

## ⚙️ Paso 2: Desplegar el Backend (Render)
1.  Crea una cuenta en [Render.com](https://render.com).
2.  Haz clic en el botón **"+ New"** (arriba a la derecha).
3.  Selecciona la opción **"Blueprint"** en el menú desplegable.
4.  Conecta tu repositorio de GitHub.
5.  Render detectará automáticamente la configuración del archivo `render.yaml`.
6.  **Environment Variables**:
    Render te pedirá que rellenes los valores para las siguientes variables (cópialas de tu `.env` o `credentials.json` local):
    *   `GEMINI_API_KEY`: Tu clave de AI.
    *   `GOOGLE_SHEET_ID_USUARIOS`: El ID de tu hoja de usuarios.
    *   `GOOGLE_SHEET_ID_PRODUCTOS`: El ID de tu hoja de productos.
    *   `GOOGLE_SHEET_ID_MATERIAS`: El ID de tu hoja de materias.
    *   `GOOGLE_SHEET_ID_CONTABILIDAD`: El ID de tu hoja de contabilidad.
    *   `GOOGLE_CREDENTIALS_JSON`: Abre tu archivo `server/credentials.json`, copia TODO el contenido (las llaves `{...}`), y pégalo aquí.
    *   `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`: Tus claves de PayPal.
7.  Haz clic en **"Deploy"**.
8.  Al terminar, ve al servicio `precificacion-api` y copia la URL que te da Render (ej: `https://precificacion-api.onrender.com`).

---

## 🌐 Paso 3: Desplegar el Frontend (Vercel)
1.  Crea una cuenta en [Vercel.com](https://vercel.com).
2.  Haz clic en **"Add New..."** -> **"Project"**.
3.  Importa tu repositorio de GitHub.
4.  Configura el proyecto:
    *   **Root Directory**: Selecciona la carpeta `client`.
    *   **Framework Preset**: Vite (se detecta solo).
5.  **Environment Variables**:
    *   Añade una variable llamada `VITE_API_URL`.
    *   El valor debe ser la URL de tu backend en Render (ej: `https://precificacion-api.onrender.com`). **Asegúrate de que NO termine en barra `/`**.
6.  Haz clic en **"Deploy"**.

---

## 🔄 Paso 4: Ajuste Final (CORS)
Cuando tengas la URL de tu Frontend en Vercel (ej: `https://tu-app.vercel.app`):
1.  Ve a Render -> Selecciona tu servicio de API -> **Environment**.
2.  Añade la variable: `FRONTEND_URL` = `https://tu-app.vercel.app`
3.  Guarda los cambios. Render se reiniciará automáticamente.

¡Y ya estaría! Tu aplicación ya es accesible desde cualquier lugar. 🚀
