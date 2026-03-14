import { getAgent } from './server.js';
import * as factories from './factories.js';

type AgentType = ReturnType<typeof getAgent>;

export async function loginAgent(
  agent: AgentType | null | undefined,
  email: string,
  password: string,
) {
  const localAgent = agent ?? getAgent();
  const res = await localAgent
    .post('/api/v1/auth/login')
    .send({ email, password });
  return { agent: localAgent, res };
}

export function extractCookiesFromResponse(res: any): string[] {
  return (res.headers && res.headers['set-cookie']) || [];
}

export async function makeLoggedInAgent(
  opts: { email?: string; password?: string; userOverrides?: any } = {},
) {
  const email = opts.email ?? `i${Date.now()}@example.test`;
  const password = opts.password ?? 'Password1!';
  const user = await factories.createUser({
    email,
    password,
    isAccountVerified: true,
    ...(opts.userOverrides || {}),
  });

  const { agent } = await loginAgent(getAgent(), email, password);
  return { agent, user };
}
