# GYMIA — AI Gym Coach

Aplicación móvil de entrenamiento con coach de inteligencia artificial, desarrollada en React Native con Expo.

## Pantallas

- **Login** — Autenticación con validación de email y contraseña
- **Onboarding** — 4 pasos: datos personales, objetivo, nivel y equipamiento
- **Home** — Resumen del día, plan semanal y KPIs en tiempo real
- **Plan** — Vista del bloque de entrenamiento y periodización
- **Sesión** — Entrenamiento en vivo con timer, series editables y descanso
- **IA** — Chat con el coach y generador de rutinas
- **Progreso** — Gráficas de marcas, PRs y volumen semanal
- **Perfil** — Datos del usuario, racha y configuración

## Stack

| Tecnología | Uso |
|------------|-----|
| React Native 0.85 | Framework móvil |
| Expo SDK 56 | Toolchain y módulos nativos |
| React Navigation 7 | Navegación (Stack + Bottom Tabs) |
| AsyncStorage | Persistencia local |
| React Native SVG | Gráficas e iconos |
| React Native Web | Preview en navegador |

## Requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio + SDK (para emulador) o dispositivo físico con Expo Go

## Instalación

```bash
git clone https://github.com/Hugood003/GYMIA.git
cd GYMIA
npm install
```

## Correr la app

```bash
# Preview en navegador
npx expo start --web

# Android (emulador o dispositivo)
npx expo start --android

# iOS
npx expo start --ios
```

## Estructura

```
src/
├── context/        # Estado global (AppContext + AsyncStorage)
├── navigation/     # Stack Navigator + Bottom Tabs
├── screens/        # Pantallas de la app
├── components/     # UI primitivos e iconos SVG
├── data/           # Mock data
└── tokens/         # Design tokens (colores, tipografía, radios)
```

## Estado del proyecto

Demo funcional con mock data. Pendiente: integración con API de IA real, autenticación backend y sincronización en la nube.
