## start project
npm install
npm run dev

### before commit
npm run build

## Test with strip webhook
stripe listen --forward-to http://localhost:3000/api/stripe-webhook

stripe listen --forward-to https://dreamazebook.com/api/stripe-webhook

stripe trigger payment_intent.succeeded