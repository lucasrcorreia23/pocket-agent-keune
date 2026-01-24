# Perfecting Voice Agent - Demo

Aplicacao demo para conversas por voz com agentes ElevenLabs, com interface premium e identidade visual Perfecting.

## Stack

- **Next.js 15** com App Router
- **TypeScript**
- **Tailwind CSS**
- **ElevenLabs React SDK** para conversacao por voz

## Funcionalidades

- Conversa por voz em tempo real com agente ElevenLabs
- Interface premium com diamante animado em SVG
- Indicadores visuais de estado (conectado, ouvindo, falando)
- Suporte a agentes publicos e privados (signed URL)
- Tema escuro com cor primaria #2E63CD

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variaveis de ambiente

Edite o arquivo `.env.local`:

```env
# ElevenLabs Configuration
ELEVENLABS_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_AGENT_ID=seu_agent_id_aqui

# Se agente privado, use true
NEXT_PUBLIC_USE_SIGNED_URL=false
```

### 3. Obter credenciais ElevenLabs

1. Acesse [elevenlabs.io](https://elevenlabs.io) e crie uma conta
2. Va em [API Keys](https://elevenlabs.io/app/settings/api-keys) e copie sua API key
3. Va em [Conversational AI](https://elevenlabs.io/app/conversational-ai) e crie/copie seu Agent ID

### 4. Executar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura

```
app/
  components/
    conversation.tsx       # Componente de conversa ElevenLabs
    diamond-background.tsx # Diamante SVG animado
  api/
    get-signed-url/
      route.ts             # API para agentes privados
  page.tsx                 # Pagina principal
  layout.tsx               # Layout root
  globals.css              # Estilos e animacoes
```

## Uso

1. Acesse a aplicacao
2. Clique em "Iniciar Conversa"
3. Permita acesso ao microfone
4. Fale com o agente
5. Clique em "Encerrar Conversa" para finalizar

## Personalizacao

### Cor primaria
Altere `#2E63CD` em `globals.css` e nos componentes

### Diamante
Edite `app/components/diamond-background.tsx` para ajustar gradientes, tamanho e animacao

## Producao

```bash
npm run build
npm start
```
