# 🌉 FileBridge - Sistema de Transferência de Arquivos

> **Transfira arquivos do celular pro PC sem perder qualidade**

FileBridge é um sistema web que permite fazer upload de arquivos do celular e baixá-los no PC mantendo a qualidade original. Perfeito para portfólio de estudantes de Ciência da Computação!

---

## 🎯 O que o projeto faz

1. 📱 Usuário abre o site no celular
2. ⬆️ Faz upload de um arquivo (foto, PDF, vídeo, etc.)
3. 🔗 Recebe um link único
4. 💻 Abre o link no PC e baixa o arquivo original

---

## 🛠️ Tecnologias Usadas

- **Backend:** Python + FastAPI
- **Frontend:** HTML + CSS + JavaScript puro
- **Armazenamento:** Supabase Storage (gratuito)
- **Deploy Backend:** Render.com (gratuito)
- **Deploy Frontend:** Vercel (gratuito)

---

## 📁 Estrutura do Projeto

```
FileBridge/
├── backend/
│   ├── main.py              # API FastAPI
│   ├── requirements.txt     # Dependências Python
│   └── .env.example         # Exemplo de variáveis de ambiente
├── frontend/
│   ├── index.html           # Página principal
│   ├── style.css            # Estilos
│   └── script.js            # Lógica do upload/download
└── README.md                # Este arquivo
```

---

## 🚀 Como rodar localmente (Passo a Passo)

### FASE 1 - Configurar o Backend

#### 1.1 Instalar Python
- Baixe Python 3.11+ em: https://www.python.org/downloads/
- Durante a instalação, **marque a opção "Add Python to PATH"**
- Verifique se instalou: abra o PowerShell e digite `python --version`

#### 1.2 Criar ambiente virtual
Abra o PowerShell na pasta do projeto:

```powershell
cd C:\Users\vinic\Desktop\FileBridge\backend
python -m venv venv
.\venv\Scripts\activate
```

Se der erro de execução de scripts, rode isso antes:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 1.3 Instalar dependências
```powershell
pip install -r requirements.txt
```

#### 1.4 Configurar Supabase (armazenamento grátis)

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Crie uma conta (pode usar Google/GitHub)
4. Clique em "New Project"
   - Nome: FileBridge
   - Database Password: escolha uma senha forte (guarde ela!)
   - Region: escolha a mais próxima (Brazil East)
   - Clique em "Create new project" (vai demorar ~2 minutos)

5. Após criar o projeto:
   - No menu lateral, clique em **"Storage"**
   - Clique em **"Create a new bucket"**
   - Nome do bucket: `filebridge-uploads`
   - Marque como **Public bucket** ✅
   - Clique em "Create bucket"

6. Pegue as credenciais:
   - Vá em **"Settings"** (engrenagem no menu) → **"API"**
   - Copie:
     - `Project URL` (ex: https://xxxxx.supabase.co)
     - `anon/public key` (uma chave longa começando com `eyJ...`)

7. Na pasta `backend/`, renomeie `.env.example` para `.env` e cole suas credenciais:
```
SUPABASE_URL=sua_url_aqui
SUPABASE_KEY=sua_chave_aqui
```

#### 1.5 Rodar o backend
```powershell
python main.py
```

Se tudo deu certo, vai aparecer:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Deixe esse terminal aberto!

---

### FASE 2 - Configurar o Frontend

#### 2.1 Editar o arquivo script.js

Abra `frontend/script.js` no VS Code e na **linha 2**, substitua:

```javascript
const API_URL = 'http://localhost:8000';
```

Por enquanto deixe assim mesmo (localhost). Quando fizer deploy, você muda.

#### 2.2 Abrir o frontend

Opção 1 - **Live Server (recomendado):**
1. Instale a extensão "Live Server" no VS Code
2. Abra `frontend/index.html`
3. Clique com botão direito → "Open with Live Server"
4. Vai abrir no navegador automaticamente

Opção 2 - **Manualmente:**
1. Navegue até `C:\Users\vinic\Desktop\FileBridge\frontend`
2. Dê duplo clique em `index.html`

---

### FASE 3 - Testar no celular (mesma rede Wi-Fi)

#### 3.1 Descobrir o IP do seu PC

No PowerShell:
```powershell
ipconfig
```

Procure por "Endereço IPv4" (geralmente algo como `192.168.1.100`)

#### 3.2 No celular

1. Conecte o celular no **mesmo Wi-Fi** que o PC
2. Abra o navegador do celular
3. Digite: `http://SEU_IP:5500` (ex: `http://192.168.1.100:5500`)
4. Faça upload de uma foto
5. Copie o link gerado
6. Abra o link no PC e baixe!

---

## 🌐 Como colocar online (Deploy)

### Deploy do Backend (Render.com)

1. Crie uma conta em: https://render.com
2. Conecte seu GitHub
3. Suba o código do projeto pro GitHub
4. No Render, clique em "New +" → "Web Service"
5. Selecione o repositório FileBridge
6. Configure:
   - **Name:** filebridge-api
   - **Root Directory:** backend
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free

7. Adicione as variáveis de ambiente:
   - Clique em "Environment" → "Add Environment Variable"
   - Adicione `SUPABASE_URL` e `SUPABASE_KEY` com os valores do Supabase

8. Clique em "Create Web Service"
9. Copie a URL gerada (ex: `https://filebridge-api.onrender.com`)

### Deploy do Frontend (Vercel)

1. Crie uma conta em: https://vercel.com
2. Clique em "Add New..." → "Project"
3. Importe o repositório FileBridge
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** frontend
   - **Build Command:** (deixe vazio)
   - **Output Directory:** (deixe vazio)

5. Clique em "Deploy"
6. Depois do deploy, edite `frontend/script.js`:
   - Troque `http://localhost:8000` pela URL do Render
   - Exemplo: `https://filebridge-api.onrender.com`

7. Faça commit e push. Vercel atualiza automaticamente!

---

## 📸 Screenshots para o Portfólio

Tire prints de:
- [ ] Interface de upload no celular
- [ ] Lista de arquivos
- [ ] Download no PC
- [ ] Código do backend
- [ ] Código do frontend

---

## ✅ Checklist de Aprendizado

- [ ] Entendi como criar uma API REST com FastAPI
- [ ] Aprendi a conectar frontend com backend via Fetch API
- [ ] Configurei armazenamento na nuvem (Supabase)
- [ ] Fiz deploy de aplicação web completa
- [ ] Testei em diferentes dispositivos
- [ ] Subi código pro GitHub
- [ ] Documentei o projeto

---

## 🐛 Problemas Comuns

**"CORS error" no navegador:**
- Certifique-se que o backend está rodando
- Verifique se a URL no `script.js` está correta

**"Module not found" ao rodar backend:**
- Ative o ambiente virtual: `.\venv\Scripts\activate`
- Reinstale dependências: `pip install -r requirements.txt`

**Upload não funciona:**
- Verifique se o bucket do Supabase é público
- Confirme se as variáveis `.env` estão corretas

---

## 📚 Próximos Passos (Melhorias)

- [ ] Adicionar autenticação de usuários
- [ ] Limitar tamanho máximo de arquivo
- [ ] Adicionar barra de progresso no upload
- [ ] Expiração automática de links após X dias
- [ ] Modo escuro
- [ ] Preview de imagens antes do download

---

## 📝 Licença

MIT - Sinta-se livre para usar em seu portfólio!

---

## 👨‍💻 Autor

**Seu Nome** - Estudante de Ciência da Computação

[LinkedIn](#) | [GitHub](#) | [Portfólio](#)
