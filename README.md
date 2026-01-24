# OliverMath

Oliver's math game is a tool created by my son. He wanted to have a robot that talks and accept answer similar to Alexa.

This tool allows kids between 7+ years old to practice math and use azure speech API to interpret the answer and compare it with the question.

Any correct answers are praised with a start and wrong answer are responded with the correct answer and ask to try again, so give it a go and allow your kid to play around with math in a fun way.

[Available in Gighub Pages](https://victorsaly.github.io/OliverMath/)

![image](https://user-images.githubusercontent.com/2436675/159779323-b3d9bcd6-2b58-466f-a0c6-58b1c8845a51.png)

## Modernization + Azure Backend

- Static UI hosted on GitHub Pages (build outputs to `docs/`).
- Azure Functions backend for:
	- `/api/chat`: Secure proxy to OpenAI Chat (stores `OPENAI_API_KEY` server-side).
	- `/api/speechToken`: Issues Azure Speech token (`AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`).

### Setup

1. Create a `.env` from `.env.example` and set `VUE_APP_API_BASE_URL` to your Functions app URL.
2. Provision Azure resources:
	 - Azure Speech service: obtain `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`.
	 - Azure Functions App (Node 18+): set App Settings `OPENAI_API_KEY`, `OPENAI_MODEL` (optional), `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`.

### Develop

```bash
npm install
npm run serve
```

### Build (GitHub Pages)

```bash
npm run build
# commit and push docs/ to default branch; ensure Pages is configured
```

### Azure Functions (backend)

The Functions app code lives under `azure/functions`.

```bash
cd azure/functions
npm install
# local run (requires Azure Functions Core Tools)
func start

# deploy (choose your subscription/resource)
az login
func azure functionapp publish <your-functions-app-name>
```

### Routing

- New Assistant view at `/assistant` for LLM chat.

### Notes

- Do not expose your OpenAI key in the browser. Always call `/api/chat`.
- Restrict CORS origins in production to your GitHub Pages domain.

