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

O workflow `.github/workflows/ci.yml` roda lint, typecheck e testes em todo PR e push na `master`.

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
