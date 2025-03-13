# Dual LLM Chat Interface

A web application that provides a dual-window chat interface for interacting with two separate LLM models via OpenRouter API. This interface allows users to enter a prompt, get a response from the first LLM, send that response to a second LLM for refinement, and continue the cycle as needed.

## Features

- Two separate chat windows, each connected to a different LLM model
- Shared prompt input at the bottom
- Ability to send responses from one LLM to the other for refinement
- Responsive design that works on both desktop and mobile devices
- Modern UI with Tailwind CSS
- Python backend with FastAPI for communicating with OpenRouter API
- Integration with Qwen/QwQ-32B and DeepSeek R1 Distill Qwen-32B models

## Project Structure

```
dual-llm-chat/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── run.sh
│   └── .env
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ChatMessage.tsx
│   │   ├── ChatWindow.tsx
│   │   └── PromptInput.tsx
│   ├── services/
│   │   └── llmService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Python 3.8 or later
- pip

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dual-llm-chat.git
   cd dual-llm-chat
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. Start the backend server:
   ```bash
   cd backend
   ./run.sh
   # or
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. In a new terminal, start the frontend development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## OpenRouter API Configuration

This application uses the OpenRouter API to access various LLM models. The API key is configured in the backend's `.env` file:

```
OPENROUTER_API_KEY=your_api_key_here
```

The following models are used:
- **LLM1**: Qwen/QwQ-32B:free
- **LLM2**: DeepSeek/DeepSeek-R1-Distill-Qwen-32B:free

## Customization

- **Models**: You can add or change models by modifying the `MODELS` object in `backend/main.py` and the `defaultModels` array in `src/services/llmService.ts`
- **Styling**: The application uses Tailwind CSS for styling. You can customize the appearance by modifying the classes in the components or by updating the Tailwind configuration in `tailwind.config.js`

## License

MIT 