# Rumo à Farda

Plataforma de estudos para os concursos da **PMERJ (Soldado)** e da **Guarda Municipal de Maricá**: aulas por matéria, videoaulas, simulados aleatórios com gabarito comentado, prova modelo PMERJ de 50 questões e acompanhamento de desempenho. Funciona no computador e pode ser instalada no celular como app (PWA).

Feita com Next.js 15 (App Router), React 19 e TypeScript. O Firebase é **opcional**.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Publicar na Vercel

1. Suba esta pasta para um repositório no GitHub.
2. Na Vercel: **Add New → Project**, importe o repositório e clique em **Deploy**. Não precisa mudar nenhuma configuração.

Sem Firebase, o progresso (aulas concluídas e histórico de simulados) fica salvo no navegador de cada aparelho.

## Ativar o Firebase (cadastro, login e progresso na nuvem)

Com o Firebase, cada aluno cria a própria conta em `/entrar` (nome, e-mail e senha, ou conta Google) e o progresso aparece igual no celular e no computador. A sessão fica salva no aparelho: depois do primeiro acesso a pessoa continua conectada, sem digitar e-mail de novo.

1. Em https://console.firebase.google.com crie um projeto.
2. **Authentication → Sign-in method**: ative **E-mail/senha** e **Google**.
3. **Authentication → Settings → Authorized domains**: adicione o domínio da Vercel (ex.: `rumo-a-farda.vercel.app`) e o seu domínio próprio, se tiver.
4. **Firestore Database**: crie o banco (modo produção) e, na aba **Rules**, cole o conteúdo de `firestore.rules`.
5. **Configurações do projeto → Seus apps → Web (</>)**: registre um app e copie as chaves.
6. Na Vercel, em **Settings → Environment Variables**, crie as variáveis abaixo (os nomes estão em `.env.example`) e faça um novo deploy:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Para testar localmente, copie `.env.example` para `.env.local` e preencha.

Cada aluno tem um documento em `users/{uid}` no Firestore, com o perfil (`profile`: nome, e-mail, data de cadastro e último acesso) e o progresso. As regras só deixam cada pessoa ler e gravar o próprio progresso. Ao entrar pela primeira vez, o que já estava salvo no aparelho é juntado com a nuvem.

## Onde editar o conteúdo

- `src/data/content.ts`: matérias, aulas (HTML de cada aula) e banco de questões.
  - Em cada questão, `a` é o índice da alternativa correta (0 = primeira). As alternativas são embaralhadas a cada simulado.
  - `l` liga a questão à aula, para o botão "Treinar questões desta aula" e a lista "Revise estas aulas".
- `src/lib/catalog.ts`: pesos de cada matéria por concurso (`TARGETS`) e a estrutura da prova modelo (`PMERJ_MODEL`).

## Estrutura

```
src/
  app/            páginas: início, aulas, aulas/[id], simulado, desempenho, manifest
  components/     menu lateral, barra inferior do celular e peças de interface
  data/content.ts conteúdo das aulas e questões
  lib/            regras do simulado, estado/progresso e Firebase (carregado só se configurado)
```
