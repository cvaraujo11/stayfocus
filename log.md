14:52:33.911 Running build in Washington, D.C., USA (East) – iad1
14:52:33.912 Build machine configuration: 2 cores, 8 GB
14:52:33.953 Retrieving list of deployment files...
14:52:34.044 Previous build caches not available
14:52:34.456 Downloading 173 deployment files...
14:52:36.065 Running "vercel build"
14:52:36.485 Vercel CLI 48.2.9
14:52:36.844 Installing dependencies...
14:52:39.539 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
14:52:40.308 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
14:52:40.766 npm warn deprecated glob@7.1.7: Glob versions prior to v9 are no longer supported
14:52:41.592 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
14:52:41.626 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
14:52:41.713 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
14:52:42.059 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
14:52:43.640 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
14:52:51.071 
14:52:51.071 added 500 packages in 14s
14:52:51.072 
14:52:51.072 160 packages are looking for funding
14:52:51.072   run `npm fund` for details
14:52:51.143 Detected Next.js version: 14.2.33
14:52:51.148 Running "npm run build"
14:52:51.256 
14:52:51.257 > painel-neurodivergentes@0.1.0 build
14:52:51.257 > next build
14:52:51.257 
14:52:51.797 Attention: Next.js now collects completely anonymous telemetry regarding usage.
14:52:51.798 This information is used to shape Next.js' roadmap and prioritize features.
14:52:51.798 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
14:52:51.798 https://nextjs.org/telemetry
14:52:51.798 
14:52:51.854   ▲ Next.js 14.2.33
14:52:51.854 
14:52:51.918    Creating an optimized production build ...
14:53:06.719 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (118kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
14:53:18.048  ⚠ Compiled with warnings
14:53:18.048 
14:53:18.048 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
14:53:18.049 A Node.js API is used (process.versions at line: 32) which is not supported in the Edge Runtime.
14:53:18.049 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
14:53:18.049 
14:53:18.049 Import trace for requested module:
14:53:18.049 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
14:53:18.049 ./node_modules/@supabase/realtime-js/dist/module/index.js
14:53:18.049 ./node_modules/@supabase/supabase-js/dist/module/index.js
14:53:18.049 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
14:53:18.049 ./node_modules/@supabase/ssr/dist/module/index.js
14:53:18.049 
14:53:18.049 ./node_modules/@supabase/supabase-js/dist/module/index.js
14:53:18.049 A Node.js API is used (process.version at line: 24) which is not supported in the Edge Runtime.
14:53:18.049 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
14:53:18.049 
14:53:18.049 Import trace for requested module:
14:53:18.049 ./node_modules/@supabase/supabase-js/dist/module/index.js
14:53:18.049 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
14:53:18.050 ./node_modules/@supabase/ssr/dist/module/index.js
14:53:18.050 
14:53:18.051    Linting and checking validity of types ...
14:53:26.664 
14:53:26.665 ./app/components/alimentacao/RegistroRefeicoes.tsx
14:53:26.665 164:19  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
14:53:26.665 247:19  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
14:53:26.665 
14:53:26.665 ./app/components/autoconhecimento/EditorNotas.tsx
14:53:26.665 239:17  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
14:53:26.665 
14:53:26.665 ./app/components/hiperfocos/TemporizadorFoco.tsx
14:53:26.665 52:6  Warning: React Hook useEffect has a missing dependency: 'temporizadorAtivo'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
14:53:26.665 
14:53:26.665 ./app/components/receitas/AdicionarReceitaForm.tsx
14:53:26.666 367:15  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
14:53:26.666 
14:53:26.666 ./app/components/receitas/DetalhesReceita.tsx
14:53:26.666 108:11  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
14:53:26.666 
14:53:26.666 ./app/components/receitas/ListaReceitas.tsx
14:53:26.666 50:19  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
14:53:26.666 
14:53:26.666 info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
14:53:33.037    Collecting page data ...
14:53:34.805    Generating static pages (0/20) ...
14:53:35.147 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.148 
14:53:35.148 Check your Supabase project's API settings to find these values
14:53:35.148 
14:53:35.148 https://supabase.com/dashboard/project/_/settings/api
14:53:35.148     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.148     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.148     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.148     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.149     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:35.149     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.149     at 8143 (/vercel/path0/.next/server/chunks/294.js:4:5492)
14:53:35.149     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.149     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.149     at I (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:94364) {
14:53:35.149   digest: '177824402'
14:53:35.149 }
14:53:35.149 
14:53:35.149 Error occurred prerendering page "/_not-found". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:35.149 
14:53:35.149 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.149 
14:53:35.149 Check your Supabase project's API settings to find these values
14:53:35.150 
14:53:35.150 https://supabase.com/dashboard/project/_/settings/api
14:53:35.150     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.150     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.150     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.150     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.150     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:35.150     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.150     at 8143 (/vercel/path0/.next/server/chunks/294.js:4:5492)
14:53:35.150     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.150     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.150     at I (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:94364)
14:53:35.230 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.231 
14:53:35.231 Check your Supabase project's API settings to find these values
14:53:35.231 
14:53:35.231 https://supabase.com/dashboard/project/_/settings/api
14:53:35.231     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.231     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.232     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.232     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.232     at 6982 (/vercel/path0/.next/server/app/alimentacao/page.js:1:1983)
14:53:35.232     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.232     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.232     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.232     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98819
14:53:35.232     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98906 {
14:53:35.232   digest: '3157101903'
14:53:35.233 }
14:53:35.233 
14:53:35.233 Error occurred prerendering page "/alimentacao". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:35.233 
14:53:35.233 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.233 
14:53:35.233 Check your Supabase project's API settings to find these values
14:53:35.233 
14:53:35.233 https://supabase.com/dashboard/project/_/settings/api
14:53:35.234     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.234     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.234     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.234     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.234     at 6982 (/vercel/path0/.next/server/app/alimentacao/page.js:1:1983)
14:53:35.234     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.234     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.234     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.234     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98819
14:53:35.235     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98906
14:53:35.235    Generating static pages (5/20) 
14:53:35.278 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.278 
14:53:35.278 Check your Supabase project's API settings to find these values
14:53:35.278 
14:53:35.279 https://supabase.com/dashboard/project/_/settings/api
14:53:35.279     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.279     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.279     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.279     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.279     at 7977 (/vercel/path0/.next/server/app/autoconhecimento/page.js:1:1993)
14:53:35.279     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.280     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.280     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.280     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98819
14:53:35.280     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98906 {
14:53:35.280   digest: '422620520'
14:53:35.280 }
14:53:35.280 
14:53:35.280 Error occurred prerendering page "/autoconhecimento". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:35.281 
14:53:35.282 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.282 
14:53:35.282 Check your Supabase project's API settings to find these values
14:53:35.282 
14:53:35.282 https://supabase.com/dashboard/project/_/settings/api
14:53:35.282     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.282     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.283     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.283     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.283     at 7977 (/vercel/path0/.next/server/app/autoconhecimento/page.js:1:1993)
14:53:35.283     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.283     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.283     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.283     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98819
14:53:35.283     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98906
14:53:35.323 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.323 
14:53:35.323 Check your Supabase project's API settings to find these values
14:53:35.323 
14:53:35.323 https://supabase.com/dashboard/project/_/settings/api
14:53:35.323     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.323     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.324     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.324     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.324     at 3443 (/vercel/path0/.next/server/app/financas/page.js:1:6655)
14:53:35.324     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.324     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.324     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.324     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98819
14:53:35.324     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98906 {
14:53:35.325   digest: '2428011948'
14:53:35.325 }
14:53:35.325 
14:53:35.325 Error occurred prerendering page "/financas". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:35.325 
14:53:35.325 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.326 
14:53:35.326 Check your Supabase project's API settings to find these values
14:53:35.326 
14:53:35.326 https://supabase.com/dashboard/project/_/settings/api
14:53:35.326     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.326     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.327     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.327     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.327     at 3443 (/vercel/path0/.next/server/app/financas/page.js:1:6655)
14:53:35.327     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.327     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.327     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.327     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98819
14:53:35.328     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98906
14:53:35.373 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.373 
14:53:35.373 Check your Supabase project's API settings to find these values
14:53:35.373 
14:53:35.374 https://supabase.com/dashboard/project/_/settings/api
14:53:35.374     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.374     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.374     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.374     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.374     at 2676 (/vercel/path0/.next/server/app/hiperfocos/page.js:1:1986)
14:53:35.374     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.374     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.374     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.374     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98819
14:53:35.374     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98906 {
14:53:35.374   digest: '3856075232'
14:53:35.374 }
14:53:35.374 
14:53:35.374 Error occurred prerendering page "/hiperfocos". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:35.374 
14:53:35.374 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.375 
14:53:35.375 Check your Supabase project's API settings to find these values
14:53:35.375 
14:53:35.375 https://supabase.com/dashboard/project/_/settings/api
14:53:35.375     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.375     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.375     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.375     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.375     at 2676 (/vercel/path0/.next/server/app/hiperfocos/page.js:1:1986)
14:53:35.375     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.375     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.375     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.375     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98819
14:53:35.375     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98906
14:53:35.419 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.419 
14:53:35.419 Check your Supabase project's API settings to find these values
14:53:35.419 
14:53:35.419 https://supabase.com/dashboard/project/_/settings/api
14:53:35.419     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.419     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.419     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.419     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.419     at 905 (/vercel/path0/.next/server/app/lazer/page.js:1:13027)
14:53:35.419     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.419     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.419     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.419     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98819
14:53:35.419     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98906 {
14:53:35.419   digest: '2189559128'
14:53:35.419 }
14:53:35.419 
14:53:35.419 Error occurred prerendering page "/lazer". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:35.419 
14:53:35.419 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.419 
14:53:35.419 Check your Supabase project's API settings to find these values
14:53:35.419 
14:53:35.419 https://supabase.com/dashboard/project/_/settings/api
14:53:35.419     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.419     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.420     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.420     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.420     at 905 (/vercel/path0/.next/server/app/lazer/page.js:1:13027)
14:53:35.420     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.420     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.420     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.420     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98819
14:53:35.420     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98906
14:53:35.452 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.453 
14:53:35.453 Check your Supabase project's API settings to find these values
14:53:35.453 
14:53:35.453 https://supabase.com/dashboard/project/_/settings/api
14:53:35.453     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.453     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.453     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.453     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.453     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:35.453     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.453     at 1442 (/vercel/path0/.next/server/app/login/page.js:1:5313)
14:53:35.453     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.453     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.454     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296) {
14:53:35.454   digest: '2690972956'
14:53:35.454 }
14:53:35.459 
14:53:35.459 Error occurred prerendering page "/login". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:35.460 
14:53:35.460 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.460 
14:53:35.460 Check your Supabase project's API settings to find these values
14:53:35.461 
14:53:35.461 https://supabase.com/dashboard/project/_/settings/api
14:53:35.461     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.461     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.461     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.462     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.462     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:35.462     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.462     at 1442 (/vercel/path0/.next/server/app/login/page.js:1:5313)
14:53:35.462     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.463     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.463     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.463    Generating static pages (10/20) 
14:53:35.537 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.537 
14:53:35.537 Check your Supabase project's API settings to find these values
14:53:35.537 
14:53:35.537 https://supabase.com/dashboard/project/_/settings/api
14:53:35.537     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.537     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.538     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.538     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.538     at 2563 (/vercel/path0/.next/server/chunks/484.js:1:8216)
14:53:35.538     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.538     at 4307 (/vercel/path0/.next/server/app/page.js:1:11374)
14:53:35.538     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.538     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.538     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296) {
14:53:35.538   digest: '353762628'
14:53:35.538 }
14:53:35.538 
14:53:35.538 Error occurred prerendering page "/". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:35.538 
14:53:35.539 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.539 
14:53:35.539 Check your Supabase project's API settings to find these values
14:53:35.539 
14:53:35.539 https://supabase.com/dashboard/project/_/settings/api
14:53:35.539     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.539     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.539     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.539     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.539     at 2563 (/vercel/path0/.next/server/chunks/484.js:1:8216)
14:53:35.539     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.539     at 4307 (/vercel/path0/.next/server/app/page.js:1:11374)
14:53:35.539     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.540     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.540     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.607 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.607 
14:53:35.607 Check your Supabase project's API settings to find these values
14:53:35.608 
14:53:35.608 https://supabase.com/dashboard/project/_/settings/api
14:53:35.608     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.608     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.608     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.609     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.609     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:35.609     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.609     at 8143 (/vercel/path0/.next/server/chunks/294.js:4:5492)
14:53:35.609     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.610     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.610     at I (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:94364) {
14:53:35.610   digest: '177824402'
14:53:35.610 }
14:53:35.610 
14:53:35.610 Error occurred prerendering page "/perfil/ajuda". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:35.611 
14:53:35.611 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.611 
14:53:35.611 Check your Supabase project's API settings to find these values
14:53:35.611 
14:53:35.611 https://supabase.com/dashboard/project/_/settings/api
14:53:35.612     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.612     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.612     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.612     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.612     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:35.612     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.613     at 8143 (/vercel/path0/.next/server/chunks/294.js:4:5492)
14:53:35.613     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.613     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.613     at I (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:94364)
14:53:35.647 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.648 
14:53:35.648 Check your Supabase project's API settings to find these values
14:53:35.648 
14:53:35.648 https://supabase.com/dashboard/project/_/settings/api
14:53:35.648     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.649     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.649     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.649     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.649     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:35.649     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.649     at 8267 (/vercel/path0/.next/server/app/perfil/page.js:1:1904)
14:53:35.649     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.649     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.650     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296) {
14:53:35.650   digest: '892289147'
14:53:35.650 }
14:53:35.650 
14:53:35.650 Error occurred prerendering page "/perfil". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:35.650 
14:53:35.651 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.651 
14:53:35.651 Check your Supabase project's API settings to find these values
14:53:35.651 
14:53:35.651 https://supabase.com/dashboard/project/_/settings/api
14:53:35.651     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.652     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.652     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.652     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.652     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:35.652     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.653     at 8267 (/vercel/path0/.next/server/app/perfil/page.js:1:1904)
14:53:35.653     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.654     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.654     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:35.692 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.692 
14:53:35.692 Check your Supabase project's API settings to find these values
14:53:35.692 
14:53:35.693 https://supabase.com/dashboard/project/_/settings/api
14:53:35.693     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.693     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.693     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.693     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.693     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:35.694     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.694     at 8143 (/vercel/path0/.next/server/chunks/294.js:4:5492)
14:53:35.694     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.694     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.694     at I (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:94364) {
14:53:35.694   digest: '177824402'
14:53:35.694 }
14:53:35.694 
14:53:35.695 Error occurred prerendering page "/receitas/adicionar". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:35.695 
14:53:35.695 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.695 
14:53:35.695 Check your Supabase project's API settings to find these values
14:53:35.695 
14:53:35.695 https://supabase.com/dashboard/project/_/settings/api
14:53:35.695     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.695     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.695     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.696     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.696     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:35.696     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.696     at 8143 (/vercel/path0/.next/server/chunks/294.js:4:5492)
14:53:35.696     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.696     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.696     at I (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:94364)
14:53:35.953 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.953 
14:53:35.953 Check your Supabase project's API settings to find these values
14:53:35.953 
14:53:35.953 https://supabase.com/dashboard/project/_/settings/api
14:53:35.954     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.954     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.954     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.954     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.954     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:35.954     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.955     at 8143 (/vercel/path0/.next/server/chunks/294.js:4:5492)
14:53:35.955     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.955     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.955     at I (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:94364) {
14:53:35.955   digest: '177824402'
14:53:35.955 }
14:53:35.955 
14:53:35.955 Error occurred prerendering page "/receitas/lista-compras". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:35.955 
14:53:35.955 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:35.955 
14:53:35.955 Check your Supabase project's API settings to find these values
14:53:35.955 
14:53:35.955 https://supabase.com/dashboard/project/_/settings/api
14:53:35.955     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:35.955     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:35.955     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:35.955     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.955     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:35.956     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.956     at 8143 (/vercel/path0/.next/server/chunks/294.js:4:5492)
14:53:35.956     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:35.956     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:35.956     at I (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:94364)
14:53:36.026    Generating static pages (15/20) 
14:53:36.078 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:36.078 
14:53:36.079 Check your Supabase project's API settings to find these values
14:53:36.079 
14:53:36.079 https://supabase.com/dashboard/project/_/settings/api
14:53:36.079     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:36.079     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:36.079     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:36.079     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.079     at 1309 (/vercel/path0/.next/server/app/receitas/page.js:1:14123)
14:53:36.080     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.080     at 4106 (/vercel/path0/.next/server/app/receitas/page.js:1:10096)
14:53:36.080     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.080     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:36.080     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296) {
14:53:36.080   digest: '2350869722'
14:53:36.080 }
14:53:36.080 
14:53:36.081 Error occurred prerendering page "/receitas". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:36.081 
14:53:36.081 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:36.081 
14:53:36.081 Check your Supabase project's API settings to find these values
14:53:36.081 
14:53:36.081 https://supabase.com/dashboard/project/_/settings/api
14:53:36.081     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:36.082     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:36.082     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:36.082     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.082     at 1309 (/vercel/path0/.next/server/app/receitas/page.js:1:14123)
14:53:36.082     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.082     at 4106 (/vercel/path0/.next/server/app/receitas/page.js:1:10096)
14:53:36.082     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.082     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:36.082     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:36.168 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:36.168 
14:53:36.169 Check your Supabase project's API settings to find these values
14:53:36.169 
14:53:36.170 https://supabase.com/dashboard/project/_/settings/api
14:53:36.170     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:36.170     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:36.171     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:36.171     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.171     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:36.171     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.171     at 4079 (/vercel/path0/.next/server/app/registro/page.js:1:5330)
14:53:36.171     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.171     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:36.171     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296) {
14:53:36.171   digest: '541499348'
14:53:36.175 }
14:53:36.175 
14:53:36.175 Error occurred prerendering page "/registro". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:36.175 
14:53:36.175 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:36.175 
14:53:36.175 Check your Supabase project's API settings to find these values
14:53:36.175 
14:53:36.175 https://supabase.com/dashboard/project/_/settings/api
14:53:36.175     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:36.175     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:36.175     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:36.175     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.176     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:36.176     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.176     at 4079 (/vercel/path0/.next/server/app/registro/page.js:1:5330)
14:53:36.176     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.176     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:36.176     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:36.193 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:36.193 
14:53:36.193 Check your Supabase project's API settings to find these values
14:53:36.193 
14:53:36.193 https://supabase.com/dashboard/project/_/settings/api
14:53:36.194     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:36.194     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:36.194     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:36.194     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.194     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:36.194     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.194     at 8143 (/vercel/path0/.next/server/chunks/294.js:4:5492)
14:53:36.194     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.194     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:36.194     at I (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:94364) {
14:53:36.194   digest: '177824402'
14:53:36.194 }
14:53:36.195 
14:53:36.195 Error occurred prerendering page "/roadmap". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:36.195 
14:53:36.195 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:36.195 
14:53:36.195 Check your Supabase project's API settings to find these values
14:53:36.195 
14:53:36.195 https://supabase.com/dashboard/project/_/settings/api
14:53:36.195     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:36.196     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:36.196     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:36.196     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.196     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:36.196     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.196     at 8143 (/vercel/path0/.next/server/chunks/294.js:4:5492)
14:53:36.196     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.197     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:36.197     at I (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:94364)
14:53:36.233 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:36.233 
14:53:36.233 Check your Supabase project's API settings to find these values
14:53:36.234 
14:53:36.234 https://supabase.com/dashboard/project/_/settings/api
14:53:36.234     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:36.234     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:36.234     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:36.234     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.234     at 2376 (/vercel/path0/.next/server/app/saude/page.js:1:12272)
14:53:36.234     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.235     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:36.235     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:36.235     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98819
14:53:36.235     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98906 {
14:53:36.235   digest: '3867210241'
14:53:36.235 }
14:53:36.235 
14:53:36.236 Error occurred prerendering page "/saude". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:36.236 
14:53:36.236 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:36.236 
14:53:36.236 Check your Supabase project's API settings to find these values
14:53:36.236 
14:53:36.236 https://supabase.com/dashboard/project/_/settings/api
14:53:36.236     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:36.236     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:36.236     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:36.237     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.237     at 2376 (/vercel/path0/.next/server/app/saude/page.js:1:12272)
14:53:36.237     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.237     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:36.237     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:36.238     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98819
14:53:36.238     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:98906
14:53:36.284 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:36.284 
14:53:36.284 Check your Supabase project's API settings to find these values
14:53:36.285 
14:53:36.285 https://supabase.com/dashboard/project/_/settings/api
14:53:36.285     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:36.285     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:36.285     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:36.285     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.286     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:36.288     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.288     at 263 (/vercel/path0/.next/server/app/sono/page.js:1:6242)
14:53:36.288     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.288     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:36.288     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296) {
14:53:36.289   digest: '233480528'
14:53:36.289 }
14:53:36.289 
14:53:36.289 Error occurred prerendering page "/sono". Read more: https://nextjs.org/docs/messages/prerender-error
14:53:36.289 
14:53:36.289 Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
14:53:36.289 
14:53:36.289 Check your Supabase project's API settings to find these values
14:53:36.290 
14:53:36.290 https://supabase.com/dashboard/project/_/settings/api
14:53:36.290     at al (/vercel/path0/.next/server/chunks/108.js:34:48494)
14:53:36.290     at s (/vercel/path0/.next/server/chunks/294.js:4:5322)
14:53:36.290     at 7007 (/vercel/path0/.next/server/chunks/294.js:4:5409)
14:53:36.290     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.290     at 7382 (/vercel/path0/.next/server/chunks/294.js:4:3506)
14:53:36.290     at t (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.290     at 263 (/vercel/path0/.next/server/app/sono/page.js:1:6242)
14:53:36.291     at Object.t [as require] (/vercel/path0/.next/server/webpack-runtime.js:1:128)
14:53:36.291     at require (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:18839)
14:53:36.291     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:88296)
14:53:36.296  ✓ Generating static pages (20/20)
14:53:36.307 
14:53:36.315 > Export encountered errors on following paths:
14:53:36.316 	/_not-found/page: /_not-found
14:53:36.316 	/alimentacao/page: /alimentacao
14:53:36.316 	/autoconhecimento/page: /autoconhecimento
14:53:36.316 	/financas/page: /financas
14:53:36.316 	/hiperfocos/page: /hiperfocos
14:53:36.316 	/lazer/page: /lazer
14:53:36.316 	/login/page: /login
14:53:36.316 	/page: /
14:53:36.316 	/perfil/ajuda/page: /perfil/ajuda
14:53:36.317 	/perfil/page: /perfil
14:53:36.317 	/receitas/adicionar/page: /receitas/adicionar
14:53:36.317 	/receitas/lista-compras/page: /receitas/lista-compras
14:53:36.317 	/receitas/page: /receitas
14:53:36.317 	/registro/page: /registro
14:53:36.317 	/roadmap/page: /roadmap
14:53:36.317 	/saude/page: /saude
14:53:36.317 	/sono/page: /sono
14:53:36.375 Error: Command "npm run build" exited with 1