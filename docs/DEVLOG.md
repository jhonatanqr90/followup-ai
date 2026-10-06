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

---

## 2026-10-05 — Sesión 2: Refactorización a capas (domain / infra / API)

### ES: Problema

El endpoint `app/api/generate/route.ts` tenía todo mezclado:
- Configuración del provider de IA.
- Schema de validación Zod.
- Construcción del prompt.
- Llamada al modelo.
- Manejo de errores HTTP.

Esto dificulta los tests, la reutilización y el mantenimiento.

### EN: Problem

The `app/api/generate/route.ts` endpoint had everything mixed together:
- AI provider configuration.
- Zod validation schema.
- Prompt construction.
- Model call.
- HTTP error handling.

This makes testing, reuse, and maintenance harder.

### ES: Solución: separación por capas

Aplicamos una arquitectura en capas simple:

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| **Validación** | `lib/validations/generate.ts` | Schema Zod + tipo TypeScript. |
| **Infraestructura IA** | `lib/ai/openrouter.ts` | Provider de OpenRouter. |
| **Dominio** | `lib/followup/prompt.ts` | Lógica pura: construir el prompt a partir de los datos. |
| **Aplicación/API** | `app/api/generate/route.ts` | Orquestar: validar → construir prompt → llamar IA → responder. |

### EN: Solution: layered architecture

We apply a simple layered architecture:

| Layer | File | Responsibility |
|-------|------|----------------|
| **Validation** | `lib/validations/generate.ts` | Zod schema + TypeScript type. |
| **AI Infrastructure** | `lib/ai/openrouter.ts` | OpenRouter provider. |
| **Domain** | `lib/followup/prompt.ts` | Pure logic: build the prompt from input data. |
| **Application/API** | `app/api/generate/route.ts` | Orchestrate: validate → build prompt → call AI → respond. |

### ES: Beneficios

- **Tests fáciles:** `buildPrompt` es una función pura, se testea sin mocks.
- **Reutilización:** el provider de OpenRouter se puede usar en otros endpoints.
- **Mantenimiento:** cambiar el modelo o el prompt no toca el handler HTTP.
- **Entrevista:** demuestra que entiendes separación de responsabilidades.

### EN: Benefits

- **Easy tests:** `buildPrompt` is a pure function, testable without mocks.
- **Reuse:** OpenRouter provider can be used in other endpoints.
- **Maintenance:** changing the model or prompt doesn't touch the HTTP handler.
- **Interview:** shows you understand separation of concerns.

### Snippets clave / Key snippets

#### `lib/validations/generate.ts`

```ts
import { z } from "zod"

export const generateSchema = z.object({
  amount: z.number().positive(),
  daysLate: z.number().int().nonnegative(),
  tone: z.enum(["friendly", "firm", "urgent"]),
  language: z.enum(["es", "en"]),
})

export type GenerateInput = z.infer<typeof generateSchema>
```

##### ES: Por qué así:
El schema y el tipo viven juntos. `GenerateInput` se exporta para reutilizarlo en API, dominio y cliente.

##### EN: Why this way:
The schema and type live together. `GenerateInput` is exported for reuse in API, domain, and client.

#### `lib/followup/prompt.ts`

```ts
import type { GenerateInput } from "@/lib/validations/generate"

export function buildPrompt(input: GenerateInput): string {
  return `Write a ${input.tone} follow-up message for a client who owes $${input.amount} and is ${input.daysLate} days late...`
}
```

##### ES: Por qué así:
Función pura: sin side effects, sin dependencias de framework. Fácil de testear.

##### EN: Why this way:
Pure function: no side effects, no framework dependencies. Easy to test.

#### `lib/ai/openrouter.ts`

```ts
import { createOpenAI } from "@ai-sdk/openai"

export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://followup-ai-sigma.vercel.app",
    "X-Title": "followup-ai",
  },
})
```

##### ES: Por qué así:
La configuración del provider está aislada. Si cambiamos de OpenRouter a OpenAI, solo tocamos este archivo.

##### EN: Why this way:
Provider config is isolated. If we switch from OpenRouter to OpenAI, we only touch this file.

#### `app/api/generate/route.ts`

```ts
import { openrouter } from "@/lib/ai/openrouter"
import { generateSchema } from "@/lib/validations/generate"
import { buildPrompt } from "@/lib/followup/prompt"

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = generateSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

  const prompt = buildPrompt(parsed.data)

  const result = streamText({
    model: openrouter("openrouter/free"),
    prompt,
  })

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  })
}
```

##### ES: Por qué así:
El handler solo orquesta: valida → construye prompt → llama IA → responde. No sabe cómo se construye el prompt ni cómo se configura el provider.

##### EN: Why this way:
The handler only orchestrates: validate → build prompt → call AI → respond. It doesn't know how the prompt is built or how the provider is configured.

---

## 2026-10-06 — Preguntas conceptuales: `lib/` raíz vs `app/lib/` + arquitectura vs patrón

### ES: ¿Por qué `lib/` está a la par de `app/`?

`lib/` raíz es la convención estándar de Next.js para **código compartido global** que no depende de rutas:

- Validaciones (`lib/validations/`)
- Clientes de API/IA (`lib/ai/`)
- Lógica de negocio pura (`lib/followup/`)
- Utilidades generales (`lib/utils.ts`)

No está atado a ninguna ruta.

### EN: Why is `lib/` at the same level as `app/`?

Root `lib/` is the standard Next.js convention for **globally shared code** that does not depend on routes:

- Validations (`lib/validations/`)
- API/AI clients (`lib/ai/`)
- Pure business logic (`lib/followup/`)
- General utilities (`lib/utils.ts`)

It is not tied to any route.

### ES: ¿Y `app/lib/`?

`app/lib/` es para código **específico del App Router**:

- Helpers usados solo por Server Components o Server Actions.
- Funciones que usan `headers()`, `cookies()`, `redirect()` de Next.js.

### EN: And `app/lib/`?

`app/lib/` is for **App Router-specific code**:

- Helpers used only by Server Components or Server Actions.
- Functions that use Next.js `headers()`, `cookies()`, `redirect()`.

### ES: Regla simple

| Caso | Dónde ponerlo |
|---|---|
| Schema Zod reutilizable | `lib/validations/` |
| Provider de IA | `lib/ai/` |
| Función pura de negocio | `lib/followup/` |
| Helper que usa `cookies()` de Next.js | `app/lib/` |
| Utilidad genérica | `lib/utils.ts` |

### EN: Simple rule

| Case | Where to put it |
|---|---|
| Reusable Zod schema | `lib/validations/` |
| AI provider | `lib/ai/` |
| Pure business function | `lib/followup/` |
| Helper using Next.js `cookies()` | `app/lib/` |
| Generic utility | `lib/utils.ts` |

### ES: ¿Arquitectura o patrón?

**Ambos**, pero en niveles distintos.

**Arquitectura:** Layered Architecture (arquitectura en capas). Dividimos el sistema en capas con responsabilidades definidas: API, dominio, infraestructura, validación.

**Patrones de diseño aplicados:**
- Separation of Concerns.
- Single Responsibility Principle.
- Dependency Inversion (ligero): `route.ts` depende de abstracciones, no de detalles.

### EN: Architecture or pattern?

**Both**, but at different levels.

**Architecture:** Layered Architecture. We divide the system into layers with defined responsibilities: API, domain, infrastructure, validation.

**Design patterns applied:**
- Separation of Concerns.
- Single Responsibility Principle.
- Dependency Inversion (light): `route.ts` depends on abstractions, not details.

### ES: Analogía rápida

Restaurante:
- **API (`route.ts`)**: el mesero que toma el pedido.
- **Dominio (`prompt.ts`)**: el chef que prepara la receta.
- **Infraestructura (`openrouter.ts`)**: el proveedor de ingredientes.
- **Validación (`generateSchema.ts`)**: el control de calidad.

Cada uno tiene su rol y no se mete en el trabajo del otro.

### EN: Quick analogy

Restaurant:
- **API (`route.ts`)**: waiter taking the order.
- **Domain (`prompt.ts`)**: chef cooking the recipe.
- **Infrastructure (`openrouter.ts`)**: ingredient supplier.
- **Validation (`generateSchema.ts`)**: quality control.

Each has its role and does not interfere with the other's work.

---

## 2026-10-06 — Sesión 2 (continuación): Tests unitarios

### ES: Concepto

`buildPrompt` es una función pura: dado el mismo input siempre devuelve el mismo output. Eso la hace ideal para tests unitarios sin mocks ni llamadas de red.

`generateSchema` también es fácil de testear con `safeParse`:
- Caso válido → `success: true`.
- Caso inválido → `success: false`.

### EN: Concept

`buildPrompt` is a pure function: given the same input it always returns the same output. That makes it ideal for unit tests without mocks or network calls.

`generateSchema` is also easy to test with `safeParse`:
- Valid case → `success: true`.
- Invalid case → `success: false`.

### Snippets clave / Key snippets

#### `lib/followup/prompt.test.ts`

```ts
import { describe, it, expect } from "vitest"
import { buildPrompt } from "./prompt"

describe("buildPrompt", () => {
  it("builds a friendly english prompt", () => {
    const result = buildPrompt({
      amount: 1500,
      daysLate: 7,
      tone: "friendly",
      language: "en",
    })

    expect(result).toContain("friendly")
    expect(result).toContain("$1500")
    expect(result).toContain("7 days late")
    expect(result).toContain("English")
  })
})
```

##### ES: Por qué así:
Testeamos que el prompt contenga las variables clave. No comparamos el string completo porque el prompt puede cambiar; lo importante es que incluya los datos correctos.

##### EN: Why this way:
We test that the prompt contains the key variables. We don't compare the full string because the prompt may change; what matters is that it includes the correct data.

#### `lib/validations/generate.test.ts`

```ts
import { describe, it, expect } from "vitest"
import { generateSchema } from "./generate"

describe("generateSchema", () => {
  it("accepts valid input", () => {
    const result = generateSchema.safeParse({
      amount: 100,
      daysLate: 5,
      tone: "firm",
      language: "es",
    })

    expect(result.success).toBe(true)
  })

  it("rejects negative amount", () => {
    const result = generateSchema.safeParse({
      amount: -10,
      daysLate: 5,
      tone: "firm",
      language: "es",
    })

    expect(result.success).toBe(false)
  })
})
```

##### ES: Por qué así:
`safeParse` no lanza excepciones, así que podemos testear tanto el caso positivo como el negativo sin `try/catch`.

##### EN: Why this way:
`safeParse` does not throw exceptions, so we can test both positive and negative cases without `try/catch`.

### Resultado

```text
Test Files  3 passed (3)
Tests       6 passed (6)
```

