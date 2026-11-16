# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Variáveis de ambiente

As credenciais do Firebase vêm de variáveis `EXPO_PUBLIC_*`. Copie o modelo e preencha com os dados do app web no console do Firebase:

```bash
cp .env.example .env
```

O `.env` está no `.gitignore`. Lembre que variáveis `EXPO_PUBLIC_*` são embutidas no bundle, então só a config pública do Firebase pode ir nelas; a segurança vem das Security Rules, do App Check e das restrições da API key.

Sem o `.env` o app funciona em **modo local**: contas e ranking ficam só no SQLite do aparelho. Com o `.env` preenchido ele entra em **modo Firebase**.

## Firebase (login e ranking global)

1. No [console do Firebase](https://console.firebase.google.com), crie um app **Web** e copie o `firebaseConfig` para o `.env`.
2. Em **Authentication → Sign-in method**, ative **E-mail/senha**.
3. Em **Firestore Database**, crie o banco (modo produção).
4. Publique as regras e os índices deste repositório:

   ```bash
   npx -y firebase-tools@15.36.0 login
   npx -y firebase-tools@15.36.0 deploy --only firestore:rules,firestore:indexes --project SEU_PROJECT_ID
   ```

5. Reinicie o app com `npx expo start -c`.

Como funciona:

- **Login e cadastro** usam o Firebase Auth (sessão persistida no aparelho). Contas criadas antes, no modo local, migram sozinhas no primeiro login com o mesmo e-mail e senha, levando o progresso.
- **Offline-first:** o progresso continua sendo salvo no SQLite e é enviado ao Firestore quando há conexão (ao entrar, ao terminar uma lição e ao abrir o ranking). Sem internet, o ranking mostra os usuários do aparelho e avisa.
- **Dados no Firestore:** `ranking/{uid}` (nome e pontos, legível por alunos logados, sem e-mail) e `usuarios/{uid}/progresso/{licao}` (só o dono lê).
- **Segurança (`firestore.rules`):** os pontos do ranking só mudam junto com o progresso de uma lição, pela diferença exata, nunca diminuem e nunca passam do máximo da lição (50/100/150). Ao criar uma lição nova, inclua o id e o máximo dela em `pontosMaximos()` nas regras.

### Emuladores locais

Para testar sem tocar no projeto real, rode `npm run emuladores` (precisa de Java) e, no `.env`, use `EXPO_PUBLIC_FIREBASE_PROJECT_ID=demo-educateach` e `EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1`.

## Qualidade de código

Requer Node 22.13 ou superior (os testes do banco usam o SQLite embutido do Node).

| Script | O que faz |
| --- | --- |
| `npm run lint` | ESLint (config do Expo + Prettier) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Jest com `jest-expo` e React Native Testing Library |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run format` / `format:check` | Formata ou confere a formatação com Prettier |
| `npm run validate` | Lint + typecheck + testes, igual ao CI |
| `npm run test:rules` | Security Rules e adaptador do Firestore contra o emulador (precisa de Java) |

O workflow `.github/workflows/ci.yml` roda lint, typecheck, testes e os testes das Security Rules no emulador em todo PR e push na `master`.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
