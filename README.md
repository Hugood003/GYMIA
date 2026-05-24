# GYMIA — AI Gym Coach

Aplicación móvil de entrenamiento con coach de inteligencia artificial, desarrollada en React Native con Expo. Disponible como APK para Android.

## Pantallas

- **Login** — Autenticación con email y contraseña
- **Onboarding** — 4 pasos: datos personales, objetivo, nivel y equipamiento
- **Home** — Resumen del día, plan semanal, KPIs en tiempo real y acceso al coach IA
- **Plan** — Vista del bloque de entrenamiento y periodización semanal
- **Sesión** — Entrenamiento en vivo con timer, series editables y descanso automático
- **IA** — Chat con el coach GYMIA para ajustar rutinas y recibir sugerencias personalizadas
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
| Google Gemini 2.5 Flash | Coach de IA y ajuste de rutinas |
| EAS Build | Compilación cloud a APK/AAB |

## Inteligencia Artificial

El coach GYMIA usa la API de Gemini 2.5 Flash. Analiza el historial de sesiones del usuario y puede modificar el plan semanal directamente desde el chat mediante bloques `[ACTION]` que actualizan el estado de la app en tiempo real.

Para usar la IA se necesita una API key de Google AI Studio configurada como variable de entorno:

```
EXPO_PUBLIC_GEMINI_KEY=tu_api_key
```

## Requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio + SDK (para emulador) o dispositivo físico

## Instalación

```bash
git clone https://github.com/Hugood003/GYMIA.git
cd gymia
npm install
```

Crea un archivo `.env` en la raíz con tu API key de Gemini:

```
EXPO_PUBLIC_GEMINI_KEY=tu_api_key
```

## Correr la app

```bash
# Preview en navegador
npx expo start --web

# Android (emulador o dispositivo)
npx expo start --android
```

## Build APK (Android)

```bash
# Requiere cuenta de Expo y EAS CLI
npm install -g eas-cli
eas build --platform android --profile production
```

## Estructura

```
src/
├── context/        # Estado global (AppContext + AsyncStorage)
├── navigation/     # Stack Navigator + Bottom Tabs
├── screens/        # Pantallas de la app
├── components/     # UI primitivos e iconos SVG
├── data/           # Mock data (plan semanal base)
└── tokens/         # Design tokens (colores, tipografía, radios)
```

## Estado del proyecto

Aplicación funcional con autenticación local, plan semanal editable por IA, sesiones en vivo con tracking de volumen, racha y estadísticas semanales. Distribuida como APK vía EAS Build.
