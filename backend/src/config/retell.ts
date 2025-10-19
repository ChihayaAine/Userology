import Retell from 'retell-sdk/index.mjs';

export const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});
