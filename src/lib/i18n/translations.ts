export const translations = {
  pt: {
    // Home
    home: {
      title: "Ventuno",
      subtitle: "Blackjack Multiplayer",
      playerCount: "2-7 jogadores",
      namePlaceholder: "Seu nome",
      createRoom: "Criar Sala",
      or: "ou",
      joinRoom: "Entrar em uma sala",
      codePlaceholder: "CODIGO",
      errorName: "Digite seu nome",
      errorCode: "Código inválido",
    },
    // Lobby
    lobby: {
      title: "Sala de Espera",
      roomCode: "Código da sala",
      copyCode: "Clique para copiar",
      copyLink: "Copiar link da sala",
      waitingPlayers: "Aguardando jogadores",
      minPlayers: "Mínimo 2 jogadores",
      startGame: "Iniciar Jogo",
      leave: "Sair",
      players: "Jogadores",
      you: "(você)",
      host: "HOST",
      loading: "Carregando...",
      waitingHost: "Aguardando o host iniciar...",
    },
    // Game
    game: {
      dealer: "Dealer",
      waiting: "Aguardando apostas...",
      preparing: "Preparando...",
      dealerPlaying: "Dealer jogando...",
      roundComplete: "Rodada completa! Veja os resultados.",
      yourTurn: "SUA VEZ",
      bet: "Aposta",
      available: "Disponível",
      betMin: "Aposta Mínima: $10",
      confirmBet: "Confirmar Aposta",
      clear: "Limpar",
      customAmount: "Valor customizado",
      add: "Adicionar",
      hit: "PEDIR",
      stand: "PARAR",
      double: "DOBRAR",
      loading: "Carregando jogo...",
      waitingPlayers: "⏳ Aguardando jogadores...",
      startRound: "🎲 Iniciar Rodada",
      phase: "Fase: ",
    },
    // Status
    status: {
      won: "GANHOU",
      lost: "PERDEU",
      push: "EMPATE",
      bust: "BUST!",
      blackjack: "BLACKJACK!",
    },
    // Winner Modal
    winner: {
      title: "🏆 Temos um Campeão! 🏆",
      won: "venceu com",
      playAgain: "Jogar Novamente",
    },
    // Rules Modal
    rules: {
      title: "📖 Regras do Blackjack",
      close: "Fechar",
      sections: {
        objective: {
          title: "🎯 Objetivo",
          content:
            "Alcançar 21 pontos ou chegar mais perto que o dealer sem ultrapassar.",
        },
        cardValues: {
          title: "🃏 Valores das Cartas",
          content:
            "• A (Ás) = 1 ou 11\n• J, Q, K = 10\n• Demais cartas = valor nominal",
        },
        gameplay: {
          title: "🎮 Como Jogar",
          content:
            "1. Faça sua aposta (mínimo $10)\n2. Receba 2 cartas\n3. Escolha: HIT (pedir carta) ou STAND (parar)\n4. DOUBLE: dobra aposta e recebe 1 carta\n5. BUST = ultrapassar 21 (você perde)",
        },
        winning: {
          title: "💰 Pagamentos",
          content:
            "• Blackjack (A+10): 2.5x aposta\n• Vitória normal: 2x aposta\n• Empate: devolve aposta\n• Derrota: perde aposta",
        },
        champion: {
          title: "🏆 Campeão",
          content: "Primeiro jogador a alcançar $5,000 ganha!",
        },
      },
    },
  },
  en: {
    // Home
    home: {
      title: "Ventuno",
      subtitle: "Blackjack Multiplayer",
      playerCount: "2-7 players",
      namePlaceholder: "Your name",
      createRoom: "Create Room",
      or: "or",
      joinRoom: "Join a room",
      codePlaceholder: "CODE",
      errorName: "Enter your name",
      errorCode: "Invalid code",
    },
    // Lobby
    lobby: {
      title: "Waiting Room",
      roomCode: "Room code",
      copyCode: "Click to copy",
      copyLink: "Copy room link",
      waitingPlayers: "Waiting for players",
      minPlayers: "Minimum 2 players",
      startGame: "Start Game",
      leave: "Leave",
      players: "Players",
      you: "(you)",
      host: "HOST",
      loading: "Loading...",
      waitingHost: "Waiting for host to start...",
    },
    // Game
    game: {
      dealer: "Dealer",
      waiting: "Waiting for bets...",
      preparing: "Preparing...",
      dealerPlaying: "Dealer playing...",
      roundComplete: "Round complete! Check results.",
      yourTurn: "YOUR TURN",
      bet: "Bet",
      available: "Available",
      betMin: "Minimum Bet: $10",
      confirmBet: "Confirm Bet",
      clear: "Clear",
      customAmount: "Custom amount",
      add: "Add",
      hit: "HIT",
      stand: "STAND",
      double: "DOUBLE",
      loading: "Loading game...",
      waitingPlayers: "⏳ Waiting for players...",
      startRound: "🎲 Start Round",
      phase: "Phase: ",
    },
    // Status
    status: {
      won: "WON",
      lost: "LOST",
      push: "PUSH",
      bust: "BUST!",
      blackjack: "BLACKJACK!",
    },
    // Winner Modal
    winner: {
      title: "🏆 We Have a Champion! 🏆",
      won: "won with",
      playAgain: "Play Again",
    },
    // Rules Modal
    rules: {
      title: "📖 Blackjack Rules",
      close: "Close",
      sections: {
        objective: {
          title: "🎯 Objective",
          content:
            "Reach 21 points or get closer than the dealer without going over.",
        },
        cardValues: {
          title: "🃏 Card Values",
          content:
            "• A (Ace) = 1 or 11\n• J, Q, K = 10\n• Other cards = face value",
        },
        gameplay: {
          title: "🎮 How to Play",
          content:
            "1. Place your bet (minimum $10)\n2. Receive 2 cards\n3. Choose: HIT (take card) or STAND (stop)\n4. DOUBLE: double bet and receive 1 card\n5. BUST = over 21 (you lose)",
        },
        winning: {
          title: "💰 Payouts",
          content:
            "• Blackjack (A+10): 2.5x bet\n• Normal win: 2x bet\n• Push (tie): return bet\n• Loss: lose bet",
        },
        champion: {
          title: "🏆 Champion",
          content: "First player to reach $5,000 wins!",
        },
      },
    },
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKeys = typeof translations.pt;
