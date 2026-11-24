import { getStore } from '../store/index.js';
import * as users from '../services/userService.js';

export async function signup(req, res) {
  res.status(201).json(await users.signup(req.body ?? {}, { store: await getStore() }));
}

export async function login(req, res) {
  res.json(await users.login(req.body ?? {}, { store: await getStore() }));
}

export function me(req, res) {
  res.json({ user: req.user });
}
