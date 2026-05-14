# GymFocus

GymFocus é uma aplicação web de treino e comunidade fitness construída com **React**, **Vite**, **Supabase** e **Tailwind CSS**.

O projeto combina acompanhamento de treinos, feed social, ranking, chat, notificações, conquistas e estatísticas para ajudar usuários a manterem consistência na academia.

## Visão geral

A proposta do GymFocus é centralizar em uma única plataforma:

- criação e acompanhamento de planos de treino;
- checklist diário de exercícios;
- sequência inteligente de treino atual;
- histórico de treinos concluídos ou pulados;
- feed social com publicações, imagens, curtidas e comentários;
- inbox e chat entre usuários;
- ranking por XP;
- conquistas e progresso;
- modo claro/escuro;
- layout responsivo para desktop e mobile.

## Tecnologias utilizadas

- **React 18**
- **Vite**
- **Supabase**
  - Auth
  - Database
  - Storage
  - Row Level Security
- **Tailwind CSS v4**
- **React Router**
- **Framer Motion**
- **Lucide React**
- **React Hot Toast**
- **Recharts**
- **Date-fns**

## Funcionalidades principais

### Autenticação

- Cadastro e login com Supabase Auth.
- Criação automática de perfil do usuário.
- Controle de sessão.
- Tratamento para refresh token inválido.
- Status online e `last_seen`.

### Dashboard

- Cards de resumo do usuário.
- Nome exibido com base no `username` do perfil.
- Card de treino atual calculado dinamicamente.
- Feed integrado.
- Ranking e calendário de consistência.
- Botão flutuante para Inbox.
- Interface responsiva.

### Feed social

- Criação de posts.
- Upload de imagem com preview.
- Curtidas.
- Comentários.
- Listagem de posts.
- Integração com perfis de usuários.

### Perfil

- Exibição de informações do usuário.
- Avatar, bio, XP e streak.
- Posts do usuário.
- Card real do treino atual.
- Layout responsivo.

### Inbox e Chat

- Lista de conversas.
- Chat individual.
- Envio de mensagens.
- Suporte a imagem.
- Controle de participantes com RLS no Supabase.
- Correção de permissões para `conversation_participants` e `messages`.

### Ranking

- Ranking global por XP.
- Ranking semanal.
- Exibição do treino atual real de cada usuário.
- Correção do antigo campo fixo `current_workout`.

### Workouts

O módulo de treinos é uma das partes principais do projeto.

Funcionalidades já implementadas:

- criação de plano de treino;
- edição de plano;
- exclusão lógica de plano;
- seleção de plano ativo;
- criação, edição e remoção de exercícios;
- foco por dia de treino;
- templates prontos de treino;
- checklist diário;
- treino atual calculado por sequência;
- botão para concluir treino;
- botão para pular treino;
- histórico recente;
- integração com XP e conquistas;
- calendário de consistência.

#### Lógica da sequência de treinos

O GymFocus não depende mais de dias fixos da semana.

A sequência é baseada nos registros do usuário:

- `completed` avança para o próximo treino;
- `skipped` também avança para o próximo treino;
- falta sem registro não avança;
- logs sem `workout_day` válido são ignorados na sequência;
- o treino atual é calculado com base no último log válido.

Exemplo:

```txt
Treino A concluído
Treino B pulado
Treino C vira o treino atual
```

#### Templates de treino

O projeto possui modelos prontos, como:

- AB Iniciante
- ABC Iniciante
- ABC Hipertrofia
- ABC Avançado
- ABCD Normal
- ABCD Avançado
- ABCDE Avançado
- Full Body Iniciante
- Full Body Intermediário
- PPL - Push Pull Legs
- PPL Avançado
- Emagrecimento e Condicionamento

### Calendário

- Mostra os últimos 7 dias.
- Marca dias concluídos.
- Mostra dias pulados separadamente.
- Usa data local do dispositivo do usuário.
- Evita problemas de fuso horário com `toISOString()`.

### Conquistas e XP

- Usuário ganha XP ao concluir treino.
- Streak é atualizado.
- Conquistas são desbloqueadas por metas, como primeiro treino e sequência de dias.

## Estrutura do projeto

```txt
src/
  components/
    achievements/
    analytics/
    challenges/
    feed/
    layout/
    notifications/
    profile/
    ranking/
    upload/
    workout/
  context/
    AuthContext.jsx
    ThemeContext.jsx
  lib/
    supabase.js
  pages/
    Auth.jsx
    Chat.jsx
    Dashboard.jsx
    Home.jsx
    Inbox.jsx
    Profile.jsx
  routes/
    ProtectedRoute.jsx
  utils/
    achievementSystem.js
    xpSystem.js
```

## Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis do Supabase:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

## Instalação

```bash
npm install
```

## Rodando em desenvolvimento

```bash
npm run dev
```

## Gerando build de produção

```bash
npm run build
```

## Preview do build

```bash
npm run preview
```

## Configuração do Tailwind CSS v4

O projeto usa Tailwind CSS v4 com o plugin oficial para Vite.

O arquivo `vite.config.js` deve conter:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1500,
  },
});
```

O arquivo `src/index.css` deve iniciar com:

```css
@import "tailwindcss";
```

## Banco de dados

O projeto usa Supabase como backend. Algumas tabelas principais:

```txt
profiles
posts
comments
likes
conversations
conversation_participants
messages
workout_plans
workout_exercises
daily_workout_progress
workout_logs
xp_logs
achievements
```

### Tabelas importantes do Workout

#### `workout_plans`

Guarda os planos de treino.

Campos principais:

```txt
id
user_id
title
description
is_active
day_focuses
created_at
```

#### `workout_exercises`

Guarda os exercícios dos planos.

Campos principais:

```txt
id
workout_plan_id
user_id
workout_day
name
sets
reps
load
sort_order
```

#### `daily_workout_progress`

Guarda o checklist diário dos exercícios.

Campos principais:

```txt
id
user_id
workout_plan_id
exercise_id
workout_date
completed
completed_at
```

#### `workout_logs`

Guarda o histórico de treinos concluídos ou pulados.

Campos principais:

```txt
id
user_id
workout_plan_id
workout_day
workout_date
status
created_at
```

Status usados:

```txt
completed
skipped
```

## Melhorias em andamento

O próximo grande módulo em desenvolvimento é o **registro de performance por exercício**.

Objetivo:

- registrar carga por série;
- registrar repetições por série;
- adicionar dificuldade;
- adicionar observações;
- mostrar histórico do exercício;
- futuramente gerar gráficos de evolução.

Tabela planejada:

```txt
workout_set_logs
```

## Deploy

O projeto pode ser publicado na Vercel.

Recomendações:

- manter `manualChunks` removido no `vite.config.js` para evitar erro com Vite/Rolldown;
- garantir que as variáveis de ambiente estejam configuradas na Vercel;
- rodar `npm run build` antes do deploy para verificar erros.

## Scripts disponíveis

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## Status do projeto

O GymFocus está em desenvolvimento ativo.

As principais áreas funcionais já estão implementadas, e o foco atual é evoluir o módulo de treinos para acompanhar performance real e progressão de carga.

## Autor

Projeto desenvolvido por Mateus Dos Anjos.
