/** store/index.js - picks PostgreSQL when DATABASE_URL is set, otherwise the JSON file store. */
import { config } from '../config.js';
import { createJsonStore } from './jsonStore.js';
import { createPgStore } from './pgStore.js';

let ready = null;

export function getStore() {
  ready ??= (async () => {
    const store = config.databaseUrl
      ? await createPgStore({ connectionString: config.databaseUrl })
      : createJsonStore({ dir: config.dataDir });
    await store.init();
    return store;
  })().catch((e) => { ready = null; throw e; }); // retry next request instead of caching a failure
  return ready;
}
