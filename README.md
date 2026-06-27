# 🌉 FileBridge - Sistema de Transferência de Arquivos

> **Transfira arquivos do celular pro PC sem perder qualidade**

FileBridge é um sistema web que permite fazer upload de arquivos do celular e baixá-los no PC mantendo a qualidade original. Desenvolvido como projeto de portfólio durante a graduação em Ciência da Computação.

---

## 🎯 O que o projeto faz

1. 📱 Usuário abre o site no celular
2. ⬆️ Faz upload de um arquivo (foto, PDF, vídeo, etc.)
3. 🔗 Recebe um link único para compartilhar
4. 💻 Abre o link no PC e baixa o arquivo original sem perda de qualidade
5. 🗑️ Limpeza automática: mantém os 10 arquivos mais recentes

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
│   ├── download.html        # Página de download
│   ├── style.css            # Estilos
│   ├── script.js            # Lógica do upload/download
│   └── home.svg             # Ícone de home
└── README.md                # Este arquivo
```

---

## 🚀 Como rodar localmente (Passo a Passo)

### FASE 1 - Configurar o Backend

#### 1.1 Instalar Python
- Baixe Python 3.11+ em: https://www.python.org/downloads/
- Durante a instalação, **marque a opção "Add Python to PATH"**
- Verifique se instalou: abra o PowerShell e digite `py --version`

#### 1.2 Criar ambiente virtual
Abra o PowerShell na pasta do projeto:

```powershell
cd FileBridge\backend
py -m venv venv
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

1. Acesse: https://supabase.com e crie uma conta
2. Crie um novo projeto
3. Vá em **Storage** → **New bucket**
   - Nome: `filebridge-uploads`
   - Marque como **Public bucket** ✅
4. Vá em **Storage** → **Policies** → crie uma policy pública para INSERT e SELECT
5. Vá em **Settings** → **API Keys** → copie a **anon public key**
6. Copie também a **Project URL**

7. Na pasta `backend/`, renomeie `.env.example` para `.env` e cole suas credenciais:
```
SUPABASE_URL=sua_url_aqui
SUPABASE_KEY=sua_chave_aqui
```

#### 1.5 Rodar o backend
```powershell
uvicorn main:app --host 127.0.0.1 --port 8000
```

Se tudo deu certo, vai aparecer:
```
INFO: Uvicorn running on http://127.0.0.1:8000
```

Deixe esse terminal aberto!

---

### FASE 2 - Rodar o Frontend

Abra **outro PowerShell** e rode:

```powershell
cd FileBridge\frontend
py -m http.server 5500
```

Acesse no navegador: `http://localhost:5500`

---

### FASE 3 - Testar no celular (mesma rede Wi-Fi)

#### 3.1 Descobrir o IP do seu PC

No PowerShell:
```powershell
ipconfig
```

Procure por "Endereço IPv4" (ex: `192.168.1.100`)

#### 3.2 No celular

1. Conecte o celular no **mesmo Wi-Fi** que o PC
2. Abra o navegador do celular
3. Digite: `http://SEU_IP:5500`
4. Faça upload de uma foto e teste o download!

---

## 🌐 Como colocar online (Deploy)

### Deploy do Backend (Render.com)

1. Crie uma conta em: https://render.com
2. Clique em "New +" → "Web Service"
3. Conecte o repositório FileBridge do GitHub
4. Configure:
   - **Root Directory:** backend
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
5. Adicione as variáveis de ambiente: `SUPABASE_URL` e `SUPABASE_KEY`
6. Copie a URL gerada (ex: `https://filebridge-api.onrender.com`)

### Deploy do Frontend (Vercel)

1. Crie uma conta em: https://vercel.com
2. Importe o repositório FileBridge
3. Configure:
   - **Root Directory:** frontend
   - **Framework Preset:** Other
4. No `script.js` e `download.html`, troque `http://localhost:8000` pela URL do Render
5. Faça commit e push — Vercel atualiza automaticamente!

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
- Verifique se as policies de INSERT estão configuradas no Supabase

**Supabase pausado:**
- Projetos gratuitos pausam após 7 dias sem uso
- Acesse o dashboard do Supabase e clique em "Resume project"

---

## 📚 Próximos Passos (Melhorias)

- [ ] Adicionar autenticação de usuários
- [ ] Preview de imagens antes do download
- [ ] Expiração automática de links após X dias
- [ ] Modo escuro
- [ ] Suporte a múltiplos uploads simultâneos
- [ ] Notificação quando o download estiver pronto

---

## 📝 Licença

MIT - Sinta-se livre para usar como referência!

---

## 👨‍💻 Autor

**Vinicius Ramalho Pereto** - Estudante de Ciência da Computação

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/viniciuspereto/)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/vinicius.ramallho/)
