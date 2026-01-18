# 🚀 Proyecto de Gestión de Costes y Precios

Este proyecto es una aplicación web completa para gestionar tus materias primas, productos y contabilidad, sincronizada con Google Sheets.

## 📂 ¿Dónde están mis datos?
*   **Código**: En esta carpeta de tu ordenador.
*   **Datos**: En tus Hojas de Cálculo de Google (en la nube).

## ⚡ Cómo iniciar la aplicación

Para volver a abrir la aplicación otro día, necesitas abrir **dos terminales** (ventanas de comandos) en esta carpeta:

### 1. Iniciar el Servidor (Backend)
En la primera terminal:
```powershell
cd server
npm start
```
*Deberías ver: "Server running on port 5000" y "MongoDB Connected"*

### 2. Iniciar la Web (Frontend)
En la segunda terminal:
```powershell
cd client
npm run dev
```
*Verás un link como `http://localhost:5173`. Haz Ctrl+Click para abrirlo.*

## 🛠️ Solución de problemas comunes
*   **Si algo falla al guardar**: Asegúrate de que ambas terminales siguen abiertas y sin errores.
*   **Si cambias de ordenador**: Copia toda esta carpeta y asegúrate de tener el archivo `server/.env` y `server/credentials.json`.
