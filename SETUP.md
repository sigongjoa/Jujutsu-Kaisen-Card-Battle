# Jujutsu Kaisen Card Battle - Setup Guide

## Project Structure

```
Jujutsu-Kaisen-Card-Battle/
├── backend/                 # Express server + Game Engine
│   ├── src/
│   │   ├── types/          # TypeScript type definitions
│   │   ├── services/       # Core services
│   │   │   ├── CardService.ts
│   │   │   ├── GameEngine.ts
│   │   │   ├── AuthService.ts
│   │   │   └── DeckService.ts
│   │   ├── routes/         # API endpoints
│   │   │   ├── auth.ts
│   │   │   ├── deck.ts
│   │   │   └── game.ts
│   │   ├── __tests__/      # Test files
│   │   └── index.ts        # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                # React application
│   ├── src/
│   │   ├── types/          # TypeScript types
│   │   ├── store/          # Redux slices
│   │   │   ├── gameSlice.ts
│   │   │   ├── uiSlice.ts
│   │   │   ├── authSlice.ts
│   │   │   └── index.ts
│   │   ├── services/       # API & WebSocket services
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   ├── components/     # React components
│   │   │   ├── CardView.tsx
│   │   │   └── GameBoard.tsx
│   │   └── styles/         # CSS files
│   │       ├── GameBoard.css
│   │       └── Card.css
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── docs/                    # Documentation
├── db/                      # Database setup
└── README.md
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key-change-this
CORS_ORIGIN=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3001`

### 4. Run Tests

```bash
npm test
npm test:watch
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:8000
```

### 3. Run Development Server

```bash
npm start
```

Application will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Decks

- `POST /api/deck` - Create deck
- `GET /api/deck` - Get user's decks
- `GET /api/deck/:deckId` - Get specific deck
- `PATCH /api/deck/:deckId` - Update deck
- `DELETE /api/deck/:deckId` - Delete deck
- `GET /api/deck/:deckId/stats` - Get deck statistics

### Game

- `POST /api/game/create` - Create new game
- `POST /api/game/:gameId/start` - Start game
- `GET /api/game/:gameId` - Get game state
- `POST /api/game/:gameId/play` - Play card
- `POST /api/game/:gameId/attack` - Declare attacks
- `POST /api/game/:gameId/pass` - Pass turn
- `POST /api/game/:gameId/surrender` - Surrender game

## WebSocket Events

Client sends:
- `PLAY_CARD` - Play a card
- `DECLARE_ATTACKS` - Declare attacks
- `PASS_RESPONSE` - Pass response window
- `PLAY_RESPONSE` - Play response card

Server sends:
- `GAME_STATE_UPDATE` - Full game state update
- `PHASE_CHANGE` - Phase changed
- `ACTION_RESULT` - Action result
- `CARD_PLAYED` - Card was played
- `COMBAT_RESOLVED` - Combat resolved

## Running the Full Stack

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm start
```

## Database (Future Integration)

Currently, data is stored in memory. For production:

1. Set up PostgreSQL database
2. Run migrations: `npm run db:migrate`
3. Update `DatabaseService` to use actual database
4. Update connection strings in `.env`

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Common Issues

### Port 3001 already in use
```bash
# Find and kill process on port 3001
lsof -i :3001
kill -9 <PID>
```

### Port 8000 already in use (WebSocket)
Change `WS_PORT` in backend `.env`

### CORS errors
Update `CORS_ORIGIN` in backend `.env` to match frontend URL

### Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Database Integration**: Connect to PostgreSQL
2. **Authentication**: Add JWT refresh tokens
3. **Game Features**: Implement more card abilities
4. **Animations**: Add card animations and visual effects
5. **Multiplayer**: Implement proper matchmaking
6. **Social**: Add friends, chat, and leaderboards
7. **Mobile**: React Native mobile app
8. **Testing**: Expand test coverage

## Architecture Overview

### Backend (Node.js + Express + TypeScript)

1. **CardService**: Manages card data and instances
2. **GameEngine**: Core game logic (turn processing, combat, abilities)
3. **AuthService**: JWT-based authentication
4. **DeckService**: Deck validation and management
5. **API Routes**: REST endpoints
6. **WebSocket**: Real-time game updates

### Frontend (React + Redux + TypeScript)

1. **Store**: Redux for state management
2. **Services**: API and WebSocket communication
3. **Components**: React UI components
4. **Types**: TypeScript interfaces

## Performance Targets

- Server response time: <100ms
- Card play action: <200ms
- Combat resolution: <300ms
- WebSocket latency: <50ms
- Game state serialization: <50ms

## Security

- JWT authentication for all endpoints
- HTTPS in production
- Rate limiting (100 requests/15min)
- Input validation
- SQL injection prevention (using parameterized queries)
- XSS protection (React escaping)

## Support

For issues or questions, refer to the technical documentation in `/docs`
