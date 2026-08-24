# 🌐 Guia de Alojamento Web & Base de Dados (Deploy Guide)

Este documento contém o passo a passo completo para colocar o **Website**, o **Servidor Backend** e a **Base de Dados PostgreSQL** online.

---

## 🗄️ PASSO 1: Criar a Base de Dados PostgreSQL Online

Recomendado: **Render** (Gratuito), **Supabase**, **Neon.tech** ou **Railway**.

### Exemplo no Render (Render.com):
1. Aceda a [Render.com](https://render.com) e crie uma conta gratuita;
2. Clique em **New +** ➔ **PostgreSQL**;
3. Preencha os campos:
   - **Name**: `pi4-g5-db`
   - **Database**: `pi4_g5`
   - **User**: `grupo5`
   - **Region**: Frankfurt (ou a mais próxima)
4. Clique em **Create Database**;
5. Copie o **External Database URL** ou **Internal Database URL** (ex: `postgresql://grupo5:senha@dpg-xxx.frankfurt-postgres.render.com/pi4_g5`).

### Carregar os Triggers e Estrutura:
Na consola do seu SQL Editor ou no pgAdmin ligado à nova base de dados, execute o ficheiro:
- `backend/schema_triggers.sql`

---

## 📡 PASSO 2: Alojar o Servidor Backend (Node.js / Express)

### No Render.com (Web Service):
1. No dashboard do Render, clique em **New +** ➔ **Web Service**;
2. Conecte o seu repositório GitHub `PI4_Web_Grupo5_2025-26`;
3. Defina as configurações:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Na secção **Environment Variables**, adicione:
   - `DBConnLink` = *(o seu Database URL do Passo 1)*
   - `PORT` = `3000`
   - `USE_SQLITE` = `false`
5. Clique em **Create Web Service**.
6. Guarde o URL gerado do seu backend (ex: `https://pi4-grupo5-backend.onrender.com`).

---

## 🖥️ PASSO 3: Alojar o Website Frontend (React + Vite)

Recomendado: **Vercel**, **Netlify** ou **Render Static Site**.

### No Vercel / Netlify:
1. Aceda a [Vercel.com](https://vercel.com) ou [Netlify.com](https://netlify.com);
2. Importe o seu repositório GitHub `PI4_Web_Grupo5_2025-26`;
3. Configuração do Projeto:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` ou `npx vite build`
   - **Output Directory**: `dist`
4. Na secção **Environment Variables**, adicione:
   - `VITE_API_URL` = `https://pi4-grupo5-backend.onrender.com/` *(URL do seu backend online)*
5. Clique em **Deploy**.

---

## ✅ Verificação Final

Após o deploy:
- Aceda ao URL do frontend (ex: `https://pi4-grupo5.vercel.app/`);
- Faça login com as contas de teste (`dra.maria` / `123456` ou `joao.silva` / `123456`);
- Todas as requisições API, agendamentos e notificações serão guardadas na base de dados PostgreSQL online!
