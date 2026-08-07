import type { AiCompletionRequest, AiProvider } from '../types';

export type MockResponder = (request: AiCompletionRequest) => string | Promise<string>;

const unconfiguredResponder: MockResponder = () => {
  throw new Error(
    'MockProvider has no responder configured. Pass one explicitly: ' +
      'new MockProvider((request) => JSON.stringify({...}))',
  );
};

/**
 * Deterministic, network-free provider used in development and tests.
 * Production providers (e.g. an Anthropic-backed one) implement the same
 * AiProvider interface and are selected via createAiGatewayFromEnv.
 */
export class MockProvider implements AiProvider {
  readonly name = 'mock';

  constructor(private readonly responder: MockResponder = unconfiguredResponder) {}

  async complete(request: AiCompletionRequest): Promise<string> {
    return this.responder(request);
  }
}
