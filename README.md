# Chat2Site API

Serverless function that generates Lovable Build URLs for the Chat2Site GPT.

## Endpoint

POST `/api/lovable-url`

### Request Body
```json
{
  "prompt": "Create a landing page for..."
}
```

### Response
```json
{
  "url": "https://lovable.dev/?autosubmit=true#prompt=...",
  "success": true
}
```

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Import to Vercel
3. Deploy

## Usage

Called by Chat2Site GPT via custom action.
