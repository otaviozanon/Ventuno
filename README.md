<p align="center">
  <img src="./public/icon.svg" width="120" alt="Ventuno" />
</p>

<h1 align="center">Ventuno</h1>
<p align="center"><strong>Blackjack Multiplayer</strong> — Jogo de cartas em tempo real</p>

<p align="center">
  <a href="https://ventuno.onrender.com/"><strong>🎰 JOGAR</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/jogadores-2%20a%207-red" />
  <img src="https://img.shields.io/badge/objetivo-10k%20chips-gold" />
  <img src="https://img.shields.io/badge/multiplayer-online-green" />
  <img src="https://img.shields.io/badge/timer-15s-orange" />
  <img src="https://img.shields.io/badge/testes-46-green" />
</p>

---

## 🎮 Como Jogar

**Objetivo:** Seja o primeiro a acumular **10.000 chips**!

### Regras

- 🃏 **2-7 jogadores** por sala
- 💰 **Saldo inicial:** 2.500 chips
- 💵 **Aposta mínima:** 10 chips
- ⏱️ **Timers:** 15s para apostar, 15s para agir
- 🏆 **Blackjack:** Paga 2.5x (aposta + 1.5x ganho)
- ✅ **Vitória:** Paga 2x (aposta + ganho)
- 🔄 **Empate (Push):** Aposta devolvida
- 🎲 **Dealer:** Compra até 17, para em todos os 17
- 🔁 **Rebuy:** 1 rebuy de 1.000 chips permitido por jogador

### Penalidades

- ⚠️ **-50 chips** por não apostar ou não agir no tempo
- ❌ **Sem chips?** Recebe rebuy automático (uma vez)

---

## 🚀 Tech Stack

**Frontend:**

- Next.js 15.5 (App Router)
- React 19.2
- TypeScript 5.8
- Tailwind CSS 4.3
- Motion (Framer Motion)
- Zustand (state)

**Backend:**

- Socket.IO 4.8 (real-time)
- Custom Next.js server
- In-memory game state

**Testing:**

- Vitest (46/46 testes)
- TDD completo no game engine

## 💻 Desenvolvimento

### Rodar localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Build de produção

```bash
npm run build
npm start
```

### Rodar testes

```bash
npm test          # Roda tsc + vitest
npm run test:watch # Watch mode
```

## 📂 Estrutura do Projeto

```
VigintiUnus/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Menu inicial (criar/entrar sala)
│   │   ├── sala/[id]/page.tsx  # Sala de espera (lobby)
│   │   ├── jogo/[id]/page.tsx  # Jogo (blackjack)
│   │   ├── layout.tsx          # Layout raiz
│   │   ├── error.tsx           # Error boundary
│   │   └── globals.css         # Estilos globais
│   ├── components/             # Componentes UI
│   │   ├── Card.tsx            # Carta visual
│   │   ├── ChipStack.tsx       # Pilha de fichas
│   │   ├── PlayerSlot.tsx      # Área do jogador
│   │   ├── DealerArea.tsx      # Mesa do dealer
│   │   ├── ActionButtons.tsx   # Hit/Stand/Double
│   │   └── BettingPanel.tsx    # Painel de apostas
│   ├── game-engine/            # Motor do jogo (puro, testado)
│   │   ├── types.ts            # Tipos do estado
│   │   ├── deck.ts             # Operações de baralho
│   │   ├── rules.ts            # Regras do Blackjack
│   │   ├── BlackjackGame.ts    # Classe do jogo
│   │   └── __tests__/          # 46 testes unitários
│   └── lib/
│       ├── stores/             # Zustand stores
│       └── hooks/              # Socket.IO hooks
├── server/
│   ├── types.ts                # Tipos Socket.IO
│   └── GameRoomManager.ts      # Gerenciador de salas
├── server.mts                  # Servidor customizado
├── SECURITY.md                 # Auditoria de segurança
└── render.yaml                 # Config deploy Render
```

## 🚢 Deploy

### Render

1. Push para GitHub
2. Conectar Render ao repo
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Environment vars:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_WS_URL=https://vigintiunus.onrender.com`

### Variáveis de Ambiente

```bash
# .env.local (dev)
NEXT_PUBLIC_WS_URL=http://localhost:3000
NODE_ENV=development
PORT=3000

# Produção (Render)
NEXT_PUBLIC_WS_URL=https://vigintiunus.onrender.com
NODE_ENV=production
PORT=3000
```

---

## 🔒 Segurança

Ver [`SECURITY.md`](./SECURITY.md) para auditoria completa de segurança.

**Destaques:**

- ✅ IDs criptograficamente seguros (`crypto.getRandomValues`)
- ✅ CORS configurado
- ✅ Validação de inputs
- ✅ Limpeza automática de salas inativas
- ✅ Health endpoint (`/api/health`)

---

## 🎯 Arquitetura

```
Engine (Pure TypeScript) → Server (Socket.IO) → Client (Zustand) → UI (React)
       46 testes                Room Manager        State Hooks      Components
```

**Fluxo:**

1. **Engine:** Lógica pura do jogo (sem I/O)
2. **Server:** Gerencia salas e sincroniza estado via Socket.IO
3. **Client:** Hooks React conectam ao servidor e atualizam Zustand
4. **UI:** Componentes React renderizam o estado

---

## 📜 Créditos

- **Motor do jogo:** Desenvolvido do zero com TDD
- **Inspiração visual:** Blackjack-master (design de cartas)
- **Arquitetura multiplayer:** Otto-master (padrão Socket.IO)

---

## 📄 Licença

MIT
