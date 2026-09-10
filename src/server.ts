import { env } from "./config/env";
import { createApp } from "./app";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`mpesa-qr-service listening on port ${env.PORT} (${env.DARAJA_ENV})`);
});
