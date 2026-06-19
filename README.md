# 🎓 Panel de Atención — Ana Ruiz

Aplicación web para gestionar el estado de atención de estudiantes.
Sin backend, funciona 100% en el navegador. Los datos se guardan automáticamente en el navegador con `localStorage`.

## ✨ Funciones

- ✅ Tres estados: **Programado → Pendiente → Atendido**
- ➕ Agregar, editar y eliminar estudiantes
- ↩️ **Deshacer** al eliminar (botón en la notificación)
- 🖱️ **Arrastrar y soltar** tarjetas entre columnas (en celular se usan los botones ← →)
- 📌 Orden automático por fecha e indicador de **Vencido / Hoy**
- 🔍 Buscador en tiempo real por nombre o curso (las estadísticas reflejan el filtro)
- 💾 Datos guardados automáticamente (no se pierden al recargar)
- 📤 **Exportar / importar** todos los datos a un archivo JSON (respaldo entre equipos)
- 🌙 **Modo oscuro** conmutable (recuerda tu preferencia)
- ♿ Accesible: gestión de foco en ventanas y respeto a *reducir movimiento*
- 📱 Responsive — funciona en celular y PC

## 📂 Archivos

```
├── index.html   # Estructura principal
├── style.css    # Estilos
├── app.js       # Lógica (JS puro, sin librerías)
└── README.md    # Este archivo
```

## 🚀 Deploy en GitHub Pages

1. Sube los archivos a un repositorio en GitHub
2. Ve a **Settings → Pages**
3. En "Build and deployment" selecciona: **Deploy from a branch**
4. Rama: `main`, carpeta: `/ (root)` → Guardar
5. En 1-2 minutos tu app estará en:
   ```
   https://TU-USUARIO.github.io/NOMBRE-DEL-REPO
   ```

## 🛠️ Uso local (sin instalar nada)

Abre el archivo `index.html` directamente en tu navegador con doble clic.
O usa una extensión como **Live Server** en VS Code.
