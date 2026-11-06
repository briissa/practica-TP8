# Laboratorio 01 — experimento A/B de Taller Norte

Aplicación Next.js para probar dos mensajes sobre una misma oferta, con una única URL indexable: `/practica`.

## Requisitos

- Node.js 20 o posterior y pnpm.
- Una base PostgreSQL hospedada. Esta versión usa Neon y el driver serverless de Neon.

## Preparar la base de datos

1. Creá un proyecto PostgreSQL en Neon.
2. En el SQL Editor de Neon, ejecutá el contenido de [`database/schema.sql`](./database/schema.sql).
3. Copiá la URL de conexión de Neon y guardala en `.env.local` como `DATABASE_URL`. Usá [`.env.example`](./.env.example) como referencia; no subas `.env.local` a GitHub.

```env
DATABASE_URL=postgresql://...
```

La URL contiene una contraseña: no la publiques ni la pegues en chats o capturas.

## Ejecutar

```powershell
pnpm install
pnpm dev
```

Abrí `http://localhost:3000/practica` y `http://localhost:3000/bitacora`.
Para verificar tipos, ejecutá `pnpm exec tsc --noEmit`.

## Comportamiento del experimento

- Cada visitante recibe una cookie `httpOnly` de 30 días y una variante derivada de su ID mediante SHA-256. Recargar conserva la asignación.
- La cookie de sesión dura 30 minutos. La base evita duplicar impresiones dentro de la misma sesión y conversiones del mismo visitante.
- Los previews `?preview=a` y `?preview=b` no cambian cookies ni generan eventos; se publican con `noindex`.
- El crawler recibe el control A en `/practica`. La variante no se agrega a la URL y el canonical siempre es `/practica`.
- La bitácora separa los eventos reales del caso fijo: A = 18/240 (7,50%), B = 31/236 (13,14%) y diferencia = 5,64 pp.

## Verificación manual

1. Abrí `/practica`, anotá la variante y recargá: debe mantenerse.
2. Abrí `?preview=b`: debe mostrarse B, sin contar otra impresión ni alterar la variante asignada.
3. Revisá el HTML de `/practica`: title y description deben corresponder al copy asignado; el canonical debe ser `/practica`.
4. Revisá el HTML del preview: debe incluir `noindex`.
5. Hacé clic en el CTA dos veces: debe registrarse una sola conversión.
6. Abrí `/bitacora`: los eventos reales deben persistir y el caso fijo debe mostrar 7,50%, 13,14% y 5,64 pp.
