# 👻 Sussurro

**Rede social de histórias e confissões anônimas**

Suas histórias, seu anonimato, sua comunidade.

---

## 🚀 Stack Tecnológica

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (planned)
- **Type:** Progressive Web App (PWA)

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- NPM ou Yarn
- Conta Supabase

### 1. Clone o repositório
```bash
git clone <repository-url>
cd sussurro
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Sussurro

# Rate Limits
NEXT_PUBLIC_MAX_POSTS_PER_HOUR=5
NEXT_PUBLIC_MAX_POSTS_PER_DAY=20
NEXT_PUBLIC_COMMENT_COOLDOWN_SECONDS=15
```

### 4. Configure o banco de dados

O banco de dados Supabase já está configurado com:
- ✅ 7 tabelas (users, posts, comments, likes, follows, categories, reports)
- ✅ Row Level Security (RLS) ativado
- ✅ Triggers automáticos para contadores
- ✅ 10 categorias pré-definidas

### 5. Execute o servidor de desenvolvimento
```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🎯 Features Implementadas (MVP)

### ✅ Autenticação
- Login com email/senha
- Registro em 3 etapas:
  1. Email e senha
  2. Seleção de username (com verificação de disponibilidade)
  3. Escolha de avatar (40+ opções de ícones)

### ✅ Posts
- Criação de posts de texto
- 10 categorias disponíveis
- Aviso anti-doxxing obrigatório
- Rate limiting (5 posts/hora, 20 posts/dia)
- Flag de conteúdo sensível
- Validação de conteúdo (10-5000 caracteres)

### ✅ Feed
- Feed cronológico de posts recentes
- Exibição de autor (username + avatar)
- Timestamps relativos
- Contadores de likes e comentários
- Design dark theme com tema roxo

### ✅ Segurança
- Row Level Security (RLS) no Supabase
- Proteção contra exposição de identidade
- Sistema de moderação preparado
- Rate limiting anti-spam

---

## 📱 PWA

O aplicativo é configurado como Progressive Web App:
- Instalável em dispositivos móveis
- Ícone personalizado
- Tema roxo (#8b5cf6)
- Suporte offline (planejado)

---

## 🔐 Regras da Comunidade

### ⚠️ **PROIBIDO**
- Nomes reais de pessoas
- Nomes de empresas/lugares específicos
- Números de telefone
- Emails ou redes sociais
- Endereços
- Qualquer informação identificadora

### ✅ **PERMITIDO**
- "Meu chefe", "Minha ex", "Um amigo"
- "Na empresa onde trabalho"
- Cidades grandes (ex: "Em Maputo")

**Violações = Ban permanente**

---

## 📋 Categorias

1. 🤫 Confissão
2. 💔 Desabafo
3. 🤯 WTF
4. 😂 Engraçado
5. 👻 Paranormal
6. 💭 Pensamento
7. 🔥 Polêmico
8. 😱 Chocante
9. 💘 Relacionamentos
10. 👨‍💼 Trabalho

---

## 🗂️ Estrutura do Projeto

```
sussurro/
├── app/
│   ├── feed/               # Página principal do feed
│   ├── login/              # Página de login
│   ├── register/           # Registro multi-etapa
│   ├── criar-post/         # Criação de posts
│   └── layout.tsx          # Layout raiz
├── components/
│   └── ui/                 # Componentes reutilizáveis
│       ├── Avatar.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── lib/
│   ├── supabase/           # Configuração Supabase
│   └── utils/              # Utilitários
├── types/                  # TypeScript types
└── public/                 # Assets estáticos
```

---

## 🚧 Próximos Passos (Roadmap)

### Fase Atual - MVP Básico (70% completo)
- [x] Autenticação
- [x] Criação de posts
- [x] Feed de posts
- [ ] Sistema de likes
- [ ] Sistema de comentários
- [ ] Perfis de usuário
- [ ] Sistema de follows
- [ ] Moderação básica

### Fase 2 - Recursos Sociais
- [ ] Notificações
- [ ] Trending topics
- [ ] Busca de usuários
- [ ] Filtros de categoria

### Fase 3 - Conteúdo Rico
- [ ] Posts com imagens (memes)
- [ ] Séries de posts
- [ ] Hashtags

### Fase 4 - Deploy
- [ ] Deployment no Vercel
- [ ] Domínio personalizado
- [ ] Analytics
- [ ] Monitoramento

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm start

# Linting
npm run lint
```

---

## 🔒 Segurança

- **RLS:** Todas as tabelas possuem Row Level Security
- **Autenticação:** Gerenciada pelo Supabase Auth
- **Validação:** Client-side e server-side com Zod
- **Rate Limiting:** Implementado no nível do banco de dados
- **Sanitização:** Previne XSS e injeção de SQL

---

## 📄 Licença

Projeto privado - Todos os direitos reservados

---

## 👥 Contato

Para dúvidas ou suporte, entre em contato através da plataforma.

---

**Desenvolvido com ❤️ e 👻 por Antigravity AI**
