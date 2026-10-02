# DEVLOG — followup-ai

Registro técnico bilingüe (ES / EN) para estudio y replicación en otros proyectos.

---

## 2026-10-02 — Sesión 0: Scaffold + deploy

### ES: ¿Qué hicimos?

- Creamos el vehículo `followup-ai` con `create-next-app@16.3.8`.
- Alineamos `package.json` con el STACK-PIN del sistema.
- Configuramos **Vitest 5** para tests unitarios.
- Configuramos **GitHub Actions** para correr lint, test y build en cada push.
- Subimos el repo a GitHub como repo público.
- Hicimos deploy en **Vercel** conectando el repo de GitHub.

### EN: What we did

- Created the `followup-ai` vehicle using `create-next-app@16.3.8`.
- Aligned `package.json` with the project's STACK-PIN.
- Set up **Vitest 5** for unit tests.
- Set up **GitHub Actions** to run lint, test, and build on every push.
- Pushed the repo to GitHub as a public repository.
- Deployed to **Vercel** connected to the GitHub repo.

### Decisiones técnicas / Technical decisions

| Decisión | ES: Por qué | EN: Why |
|----------|-------------|---------|
| Repo aparte en `proyectos/followup-ai/` | Cada vehículo de build debe ser un repo público independiente. | Each build vehicle must be an independent public repo. |
| `react@19.3.0` forzado | El scaffold instaló `19.2.8`; corregimos al pin. | Scaffold installed `19.2.8`; we pinned to `19.3.0`. |
| `@types/node@^24` | Vitest 5 requiere Node types ^22 o ^24. | Vitest 5 requires Node types ^22 or ^24. |
| Tests en `app/lib/` | Lógica pura primero; UI tests se agregan después con jsdom. | Pure logic first; UI tests added later with jsdom. |

### URLs

- Repo: https://github.com/jhonatanqr90/followup-ai
- Production: https://followup-ai-sigma.vercel.app

---

## 2026-10-02 — Sesión 1: NextAuth v5 beta

### ES: Concepto

**NextAuth v5 beta** (también llamado Auth.js para Next.js) es una librería que maneja autenticación en aplicaciones Next.js. En lugar de escribir tu propio sistema de login, password, tokens, etc., configuras **providers** (Google, GitHub, email…) y NextAuth se encarga del flujo OAuth, sesiones, cookies y rutas de API.

**Flujo típico:**
1. El usuario hace clic en "Sign in with Google".
2. NextAuth redirige a Google.
3. Google valida y redirige de vuelta a tu app con un código.
4. NextAuth convierte ese código en una sesión segura almacenada en una cookie.
5. Tu app puede leer esa sesión con `auth()` (server) o `useSession()` (client).

**Archivos clave en v5:**
- `auth.ts`: configuración central (providers, callbacks, session strategy).
- `app/api/auth/[...nextauth]/route.ts`: handlers HTTP que NextAuth expone.
- `middleware.ts`: protege rutas antes de que carguen.
- `app/layout.tsx` o página: botones `signIn` / `signOut`.

### EN: Concept

**NextAuth v5 beta** (also called Auth.js for Next.js) is a library that handles authentication in Next.js apps. Instead of writing your own login, passwords, and token system, you configure **providers** (Google, GitHub, email…) and NextAuth manages the OAuth flow, sessions, cookies, and API routes.

**Typical flow:**
1. User clicks "Sign in with Google".
2. NextAuth redirects to Google.
3. Google validates and redirects back with a code.
4. NextAuth converts that code into a secure session stored in a cookie.
5. Your app reads the session with `auth()` (server) or `useSession()` (client).

**Key files in v5:**
- `auth.ts`: central config (providers, callbacks, session strategy).
- `app/api/auth/[...nextauth]/route.ts`: HTTP handlers exposed by NextAuth.
- `middleware.ts`: protects routes before they render.
- `app/layout.tsx` or page: `signIn` / `signOut` buttons.

### Snippets clave / Key snippets

#### `auth.ts`

```ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
})
```
##### ES: Por qué así:
- `NextAuth(...)` devuelve un objeto con todo lo que necesitas.
- `handlers` son las funciones GET/POST para la API route.
- `auth()` se usa en Server Components y middleware para leer la sesión.
- `signIn / signOut` se usan en Client Components.

##### EN: Why this way:
- `NextAuth(...)` returns an object with everything you need.
- `handlers` are the GET/POST functions for the API route.
- `auth()` reads the session in Server Components and middleware.
- `signIn / signOut` are used in Client Components.

#### `app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```
##### ES: Por qué así:
`Por qué [...nextauth]:` es una catch-all route. NextAuth maneja múltiples sub-rutas (/api/auth/signin, /api/auth/callback/google, /api/auth/session, etc.) desde un solo archivo.

##### EN: Why this way:
`Why [...nextauth]:` it's a catch-all route. NextAuth handles multiple sub-routes (/api/auth/signin, /api/auth/callback/google, /api/auth/session, etc.) from a single file.

#### `.env.local`

```env
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_SECRET=un-secreto-local-de-prueba
```
#### ES: Variables de entorno que NextAuth v5 espera
- Para Google Provider, por defecto busca: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`
- `AUTH_SECRET` se usa para firmar las cookies de sesión. En local puedes generar uno con: 
  ```bash 
  openssl rand -base64 32
  ```
- En Vercel lo configuras en Settings → Environment Variables.
#### EN: Environment variables NextAuth v5 expects
- For Google Provider, by default it looks for: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`
- `AUTH_SECRET` signs session cookies. In local dev generate one with: 
  ```bash 
  openssl rand -base64 32
  ```
- In Vercel set it in Settings → Environment Variables.

---

## 2026-10-02 — Sesión 1 (continuación): Google OAuth credentials

### ES: Concepto

Para que Google permita login en tu app, debes registrar tu aplicación en **Google Cloud Console**. Esto crea un `CLIENT_ID` y `CLIENT_SECRET` que usa NextAuth para identificar tu app y validar el login.

**Pasos:**
1. Ir a https://console.cloud.google.com/
2. Crear un nuevo proyecto (o seleccionar uno existente).
3. Ir a **APIs & Services → OAuth consent screen**.
   - Tipo: **External** (si es un app pública) o **Internal**.
   - Rellenar nombre, email, dominio opcional.
4. Ir a **Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://followup-ai-sigma.vercel.app/api/auth/callback/google`
5. Copiar **Client ID** y **Client Secret**.

### EN: Concept

To let Google allow logins in your app, you must register your application in **Google Cloud Console**. This creates a `CLIENT_ID` and `CLIENT_SECRET` that NextAuth uses to identify your app and validate the login.

**Steps:**
1. Go to https://console.cloud.google.com/
2. Create a new project (or select an existing one).
3. Go to **APIs & Services → OAuth consent screen**.
   - Type: **External** (for public apps) or **Internal**.
   - Fill name, email, optional domain.
4. Go to **Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://followup-ai-sigma.vercel.app/api/auth/callback/google`
5. Copy **Client ID** and **Client Secret**.

---

## 2026-10-02 — Sesión 1 (continuación): Environment variables + Auth UI

### ES: Variables de entorno

NextAuth v5 lee las credenciales desde variables de entorno. Por defecto, para Google Provider busca:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_SECRET` (usado para firmar las cookies de sesión)

**Local:** se guardan en `.env.local` (ya está en `.gitignore`).
**Producción:** se configuran en Vercel en **Settings → Environment Variables**.

### EN: Environment variables

NextAuth v5 reads credentials from environment variables. By default, for Google Provider it looks for:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_SECRET` (used to sign session cookies)

**Local:** stored in `.env.local` (already in `.gitignore`).
**Production:** configured in Vercel under **Settings → Environment Variables**.

### ES: UI de login/logout

En Client Components no se puede usar `auth()` (server-only). Se usa `useSession`, `signIn` y `signOut` desde `next-auth/react`.

`useSession` devuelve:
- `data`: la sesión actual.
- `status`: `"loading"`, `"authenticated"` o `"unauthenticated"`.

Además, `useSession` requiere que la app esté envuelta en `SessionProvider` (normalmente en `layout.tsx`).

### EN: Login/logout UI

In Client Components you cannot use `auth()` (server-only). Use `useSession`, `signIn`, and `signOut` from `next-auth/react`.

`useSession` returns:
- `data`: the current session.
- `status`: `"loading"`, `"authenticated"`, or `"unauthenticated"`.

Also, `useSession` requires the app to be wrapped in `SessionProvider` (usually in `layout.tsx`).

### Snippets clave / Key snippets

#### `.env.local`

```env
AUTH_GOOGLE_ID=tu-client-id
AUTH_GOOGLE_SECRET=tu-client-secret
AUTH_SECRET=un-secreto-largo-aleatorio
```

#### `app/components/auth-buttons.tsx`

```tsx
"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export function AuthButtons() {
  const { data: session, status } = useSession()

  if (status === "loading") return <p>Loading...</p>

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    )
  }

  return <button onClick={() => signIn("google")}>Sign in with Google</button>
}
```

#### `app/layout.tsx`

```tsx
import { SessionProvider } from "next-auth/react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

#### `middleware.ts`

```ts
export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/api/generate/:path*"],
}
```

##### ES: Por qué así:
`middleware.ts` corre antes de renderizar la página. Exportar `auth` como middleware hace que NextAuth verifique la sesión automáticamente. `matcher` indica qué rutas proteger.

Protegemos tanto `/dashboard/:path*` (futura página de historial) como `/api/generate/:path*` (API de IA). Esto evita que usuarios no autenticados consuman la API de generación de mensajes.

##### EN: Why this way:
`middleware.ts` runs before the page renders. Exporting `auth` as middleware makes NextAuth check the session automatically. `matcher` tells which routes to protect.

We protect both `/dashboard/:path*` (future history page) and `/api/generate/:path*` (AI API). This prevents unauthenticated users from consuming the message generation API.

---

## 2026-10-02 — Sesión 1 (continuación): Ecosistema Google AI / Change from OpenAI to Gemini

### ES: ¿Qué es qué?

| Nombre | Qué es | Analogía |
|--------|--------|----------|
| **Gemini** | Los modelos de IA de Google (como GPT de OpenAI). | GPT-4, GPT-4o |
| **Google AI Studio** | Una web para probar prompts y generar API keys gratis. | OpenAI Playground |
| **Vertex AI** | La plataforma de ML/IA de Google Cloud para empresas. | AWS SageMaker / Azure ML |
| **Google Cloud Console** | Donde gestionas proyectos, billing, APIs, OAuth. | Dashboard de AWS |

### EN: What is what?

| Name | What it is | Analogy |
|------|-----------|---------|
| **Gemini** | Google's AI models (like OpenAI's GPT). | GPT-4, GPT-4o |
| **Google AI Studio** | A web UI to test prompts and get free API keys. | OpenAI Playground |
| **Vertex AI** | Google Cloud's enterprise ML/AI platform. | AWS SageMaker / Azure ML |
| **Google Cloud Console** | Where you manage projects, billing, APIs, OAuth. | AWS Dashboard |

### ES: ¿Por qué cambiamos de OpenAI a Gemini?

La API key de OpenAI devolvió el error `insufficient_quota` / `credit_balance_exhausted`: no tenía créditos. Como ya teníamos Google Cloud configurado, migrar a **Google AI Studio + Gemini 1.5 Flash** fue el camino más rápido y gratuito.

### EN: Why did we switch from OpenAI to Gemini?

The OpenAI API key returned `insufficient_quota` / `credit_balance_exhausted`: no credits left. Since we already had Google Cloud configured, migrating to **Google AI Studio + Gemini 1.5 Flash** was the fastest and free path.

### ES: Otros proveedores para conocer

- **Groq**: muy rápido, buen tier gratuito.
- **OpenRouter**: unifica muchos modelos.
- **Cohere / Mistral**: alternativas europeas.

### EN: Other providers to know

- **Groq**: very fast, good free tier.
- **OpenRouter**: unifies many models.
- **Cohere / Mistral**: European alternatives.

