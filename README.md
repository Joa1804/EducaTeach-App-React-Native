# EducaTech 📚💻

**Uma plataforma educacional para tornar o aprendizado de programação mais acessível, interativo e divertido.**

O EducaTech é um aplicativo educacional desenvolvido com React Native e Expo, com o objetivo de oferecer um ambiente de aprendizagem por meio de atividades e recursos interativos de programação.

O projeto utiliza tecnologias como Blockly, Firebase e SQLite para construir uma experiência de aprendizagem com atividades, armazenamento de progresso e recursos de acompanhamento.

---

## 📋 Índice

- [Sobre o projeto](#-sobre-o-projeto)
- [Objetivos](#-objetivos)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias utilizadas](#-tecnologias-utilizadas)
- [Demonstração](#-demonstração)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração do Firebase](#-configuração-do-firebase)
- [Emuladores locais](#-emuladores-locais)
- [Execução do aplicativo](#-execução-do-aplicativo)
- [Testes e qualidade de código](#-testes-e-qualidade-de-código)
- [Equipe de desenvolvimento](#-equipe-de-desenvolvimento)
- [Licença](#-licença)

---

## 🎯 Sobre o projeto

O EducaTech é um aplicativo mobile voltado à educação e ao aprendizado de programação.

A proposta é proporcionar um ambiente no qual os estudantes possam desenvolver o raciocínio lógico e aprender conceitos de programação por meio de atividades interativas.

O aplicativo foi desenvolvido utilizando React Native e Expo, permitindo a construção de uma aplicação mobile com tecnologias modernas e uma arquitetura organizada.

Além disso, o projeto conta com integração ao Firebase para recursos de autenticação e ranking global, enquanto o SQLite permite armazenar informações localmente no dispositivo.

## 🎓 Objetivos

O projeto tem como principais objetivos:

- Incentivar o aprendizado de programação.
- Desenvolver o raciocínio lógico dos estudantes.
- Proporcionar atividades interativas de aprendizagem.
- Oferecer uma experiência de utilização simples e acessível.
- Permitir o acompanhamento do progresso dos estudantes.
- Aplicar conhecimentos de desenvolvimento mobile, banco de dados e integração com serviços externos.

## ✨ Funcionalidades

O projeto possui os seguintes recursos implementados ou previstos em sua estrutura atual:

- **Atividades educacionais:** ambiente de atividades voltadas ao aprendizado de programação.
- **Cadastro e autenticação:** gerenciamento de contas por meio do Firebase Authentication.
- **Progresso do estudante:** armazenamento do progresso das atividades realizadas.
- **Ranking global:** sistema de pontuação e classificação dos estudantes.
- **Armazenamento local:** utilização do SQLite para manter informações no dispositivo.
- **Funcionamento offline:** possibilidade de utilizar os recursos locais sem conexão com a internet, com sincronização posterior quando aplicável.
- **Sincronização com Firebase:** envio de informações de progresso e pontuação para o Firestore.

## 🛠️ Tecnologias utilizadas

O EducaTech foi desenvolvido utilizando as seguintes tecnologias:

| Tecnologia | Utilização |
|---|---|
| React Native | Desenvolvimento da aplicação mobile |
| Expo SDK 58 | Ambiente e ferramentas de desenvolvimento |
| TypeScript | Tipagem e organização do código |
| React 19 | Construção da interface |
| Expo Router | Navegação entre telas |
| React Navigation | Recursos de navegação |
| Firebase Authentication | Autenticação de usuários |
| Cloud Firestore | Armazenamento e sincronização de dados |
| SQLite | Banco de dados local |
| AsyncStorage | Armazenamento local de informações |
| Jest | Testes automatizados |
| Prettier | Formatação de código |
| ESLint | Análise e padronização do código |

## 📱 Demonstração

Nesta seção podem ser adicionadas imagens das principais telas do aplicativo.

Sugestões de capturas de tela:

- Tela inicial.
- Tela de login e cadastro.
- Menu principal.
- Tela de atividades.
- Ambiente de programação com Blockly.
- Tela de progresso.
- Tela de ranking.

> As imagens podem ser adicionadas posteriormente para apresentar visualmente o funcionamento do EducaTech.

## 📁 Estrutura do projeto

O projeto está organizado da seguinte maneira:

```text
EducaTeach-App-React-Native/
│
├── .claude/
├── .github/
│   └── workflows/
│
├── .vscode/
│
├── app/
│   └── Telas e rotas da aplicação
│
├── assets/
│   └── images/
│
├── components/
│   └── Componentes reutilizáveis
│
├── constants/
│   └── Constantes da aplicação
│
├── context/
│   └── Contextos e estados compartilhados
│
├── data/
│   └── Dados utilizados pela aplicação
│
├── db/
│   └── Recursos do banco de dados local
│
├── firestore-tests/
│   └── Testes relacionados ao Firestore
│
├── hooks/
│   └── Hooks personalizados
│
├── lib/
│   └── Bibliotecas e configurações auxiliares
│
├── scripts/
│   └── Scripts de desenvolvimento
│
├── services/
│   └── Serviços e integrações
│
├── test/
│   └── Testes automatizados
│
├── types/
│   └── Definições de tipos TypeScript
│
├── .env.example
├── app.json
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── jest.config.js
├── jest.rules.config.js
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## ⚙️ Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- [Node.js](https://nodejs.org/) versão 22.13 ou superior.
- [Git](https://git-scm.com/).
- [Visual Studio Code](https://code.visualstudio.com/) ou outro editor de código.
- [Expo](https://expo.dev/).
- Android Studio, caso deseje utilizar um emulador Android.

Para utilizar os recursos de autenticação e ranking global, também será necessário configurar um projeto no Firebase.

## 🚀 Instalação

**1. Clone o repositório:**

```bash
git clone https://github.com/Joa1804/EducaTeach-App-React-Native.git
```

**2. Entre na pasta do projeto:**

```bash
cd EducaTeach-App-React-Native
```

**3. Instale as dependências:**

```bash
npm install
```

**4. Configure as variáveis de ambiente**, seguindo a seção de configuração do Firebase.

## 🔥 Configuração do Firebase

O EducaTech utiliza Firebase Authentication e Cloud Firestore para os recursos de autenticação, sincronização e ranking global.

Para configurar:

**1.** Acesse o [Firebase Console](https://console.firebase.google.com/).

**2.** Crie um projeto no Firebase.

**3.** Adicione um aplicativo Web ao projeto e obtenha as configurações do Firebase.

**4.** Ative o método de autenticação por e-mail e senha em:

`Authentication → Sign-in method → E-mail/senha`

**5.** Crie um banco de dados no Cloud Firestore, utilizando o modo de produção.

**6.** Na raiz do projeto, copie o arquivo `.env.example` e crie um arquivo chamado `.env`.

No Windows, também é possível copiar o arquivo manualmente pelo explorador de arquivos.

**7.** Preencha as variáveis com as informações disponibilizadas pelo Firebase:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=

EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=
```

As variáveis de Analytics e do emulador são opcionais.

**Importante:** as variáveis `EXPO_PUBLIC_*` ficam disponíveis no aplicativo. Portanto, não coloque senhas ou chaves privadas nelas. A proteção dos dados deve ser feita por meio das regras de segurança do Firebase e das restrições apropriadas da API.

**8.** Publique as regras e os índices do Firestore:

```bash
npx -y firebase-tools@15.36.0 login
```

Depois:

```bash
npx -y firebase-tools@15.36.0 deploy --only firestore:rules,firestore:indexes --project SEU_PROJECT_ID
```

Substitua `SEU_PROJECT_ID` pelo identificador do seu projeto Firebase.

**9.** Reinicie o Expo:

```bash
npx expo start -c
```

### Como funciona o armazenamento de dados

O aplicativo possui dois modos de funcionamento:

- **Modo local:** sem as configurações do Firebase, as contas e o ranking ficam armazenados localmente no SQLite do dispositivo.
- **Modo Firebase:** com as configurações preenchidas, o aplicativo utiliza Firebase Authentication e Firestore para autenticação e sincronização dos dados.

O progresso continua sendo armazenado localmente e pode ser sincronizado com o Firestore quando há conexão com a internet.

O ranking utiliza a coleção `ranking/{uid}`, enquanto o progresso individual é armazenado em `usuarios/{uid}/progresso/{licao}`.

As regras de segurança do Firestore controlam as operações de pontuação e acesso aos dados.

## 🧪 Emuladores locais

O projeto disponibiliza um ambiente de emulação do Firebase para testes durante o desenvolvimento.

Para iniciar os emuladores, execute:

```bash
npm run emuladores
```

É necessário ter Java instalado.

No arquivo `.env`, configure:

```env
EXPO_PUBLIC_FIREBASE_PROJECT_ID=demo-educateach
EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1
```

Esse ambiente permite testar os recursos de autenticação e Firestore sem utilizar diretamente o projeto Firebase real.

## ▶️ Execução do aplicativo

Depois de instalar as dependências e configurar o ambiente, utilize os seguintes comandos:

**Iniciar o Expo:**

```bash
npm start
```

**Executar no Android:**

```bash
npm run android
```

**Executar no iOS:**

```bash
npm run ios
```

**Executar na Web:**

```bash
npm run web
```

Também é possível utilizar o comando:

```bash
npx expo start
```

Com o servidor iniciado, escolha a plataforma desejada ou utilize o QR Code para abrir o aplicativo em um dispositivo compatível com Expo Go.

## 🧹 Testes e qualidade de código

O projeto conta com ferramentas para verificar a qualidade, a organização e o funcionamento do código.

| Comando | Descrição |
|---|---|
| `npm run lint` | Executa a análise do código com ESLint |
| `npm run typecheck` | Verifica os tipos TypeScript |
| `npm test` | Executa os testes automatizados |
| `npm run test:watch` | Executa os testes em modo de observação |
| `npm run test:coverage` | Gera relatório de cobertura dos testes |
| `npm run format` | Formata os arquivos com Prettier |
| `npm run format:check` | Verifica a formatação dos arquivos |
| `npm run validate` | Executa lint, verificação de tipos e testes |
| `npm run test:rules` | Executa testes das regras do Firestore |

O repositório também possui um workflow de integração contínua no GitHub Actions, responsável por executar verificações de qualidade durante os pushes e pull requests na branch `master`.

## 👥 Equipe de desenvolvimento

O EducaTech foi desenvolvido por:

- **João Emanoel**
- **Murilo Sobral**
- **Gustavo L. Molina**

## 📄 Licença

A licença do projeto ainda não foi definida pela equipe.

Até que uma licença seja escolhida e adicionada ao repositório por meio de um arquivo `LICENSE`, não há uma licença de código aberto declarada para o EducaTech.

---

**EducaTech — Aprender programação pode ser uma experiência interativa!**
