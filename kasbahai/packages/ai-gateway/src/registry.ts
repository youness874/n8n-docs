import { AiGateway } from './gateway';
import { MockProvider } from './providers/mock-provider';
import type { AiProvider } from './types';

/**
 * Model selection is configuration, not code: which provider and which
 * default model id to use is read from the environment. Add a new
 * `case` here (and a new provider implementing AiProvider) to support a
 * real model backend — nothing above this layer needs to change.
 */
export function createAiGatewayFromEnv(env: NodeJS.ProcessEnv = process.env): AiGateway {
  const providerName = env.AI_GATEWAY_PROVIDER ?? 'mock';
  const defaultModelId = env.AI_GATEWAY_DEFAULT_MODEL ?? 'mock-structured-v1';

  const provider = resolveProvider(providerName);
  return new AiGateway(provider, defaultModelId);
}

function resolveProvider(providerName: string): AiProvider {
  switch (providerName) {
    case 'mock':
      return new MockProvider();
    default:
      throw new Error(
        `Unknown AI_GATEWAY_PROVIDER "${providerName}". Register a provider in ` +
          'packages/ai-gateway/src/registry.ts before selecting it.',
      );
  }
}
