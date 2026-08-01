import type { HostAdapter, HostRegistry } from './types.js';

export class HostRegistryImpl implements HostRegistry {
  private adapters: Map<string, HostAdapter> = new Map();
  private defaultAdapter: string | null = null;

  register(name: string, adapter: HostAdapter): void {
    this.adapters.set(name, adapter);
    if (!this.defaultAdapter) {
      this.defaultAdapter = name;
    }
  }

  get(name: string): HostAdapter | undefined {
    return this.adapters.get(name);
  }

  list(): HostAdapter[] {
    return Array.from(this.adapters.values());
  }

  getDefault(): HostAdapter | undefined {
    return this.defaultAdapter ? this.adapters.get(this.defaultAdapter) : undefined;
  }

  setDefault(name: string): boolean {
    if (this.adapters.has(name)) {
      this.defaultAdapter = name;
      return true;
    }
    return false;
  }
}

let registryInstance: HostRegistryImpl | null = null;

export function createHostRegistry(): HostRegistryImpl {
  registryInstance = new HostRegistryImpl();
  return registryInstance;
}

export function getHostRegistry(): HostRegistryImpl {
  if (!registryInstance) {
    registryInstance = createHostRegistry();
  }
  return registryInstance;
}

export async function initializeHosts(): Promise<HostRegistryImpl> {
  const registry = getHostRegistry();
  // Adapters will be registered by the CLI/daemon on startup
  return registry;
}
