/**
 * Methodology validator
 * Validates methodology.yaml for consistency and correctness
 */

import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';

export interface MethodologyInfo {
  methodology_id: string;
  version: string;
  name: string;
  meta_version?: string;
  states?: Array<{ id: string; type: string; name: string }>;
  actors?: Array<{ id: string; type: string; name: string }>;
  tools?: Array<{ id: string; type: string; name: string }>;
  actions?: Array<{ id: string; name: string; actor?: string }>;
  artifacts?: Array<{ id: string; name: string; template?: string }>;
  facts?: Array<{ id: string; from_state?: string; to_state?: string }>;
  rules?: Array<{ id: string; type: string; condition?: string }>;
  processes?: Array<{ id: string; description?: string; states_sequence: string[] }>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: MethodologyInfo | null;
}

/**
 * Load methodology.yaml from namespace
 */
export async function loadMethodology(
  methodologyPath: string,
  namespace: string
): Promise<MethodologyInfo | null> {
  const possiblePaths = [
    path.join(methodologyPath, 'namespaces', namespace, 'methodology.yaml'),
    path.join(methodologyPath, 'meta', 'generated', `${namespace}.methodology.yaml`),
  ];

  for (const filePath of possiblePaths) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return YAML.parse(content) as MethodologyInfo;
    } catch {
      // Try next path
    }
  }

  return null;
}

/**
 * Validate methodology.yaml
 */
export function validateMethodology(m: MethodologyInfo): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!m.methodology_id) errors.push('Missing methodology_id');
  if (!m.version) errors.push('Missing version');
  if (!m.name) errors.push('Missing name');

  // States validation
  if (!m.states || m.states.length < 2) {
    errors.push('Must have at least 2 states');
  } else {
    const initial = m.states.filter(s => s.type === 'Initial');
    const terminal = m.states.filter(s => s.type === 'Terminal');

    if (initial.length === 0) errors.push('No Initial state');
    if (initial.length > 1) errors.push('Multiple Initial states');
    if (terminal.length === 0) errors.push('No Terminal state');
  }

  // Facts validation (deadlock check)
  if (m.states && m.facts) {
    const statesWithExit = new Set(m.facts.filter(f => f.from_state && f.to_state).map(f => f.from_state));

    for (const state of m.states) {
      if (state.type !== 'Terminal' && state.type !== 'Error') {
        if (!statesWithExit.has(state.id)) {
          errors.push(`Deadlock: State '${state.id}' has no outgoing transitions`);
        }
      }
    }
  }

  // Processes validation
  if (m.processes) {
    const stateIds = new Set(m.states?.map(s => s.id) || []);

    for (const proc of m.processes) {
      for (const stateId of proc.states_sequence) {
        if (!stateIds.has(stateId)) {
          warnings.push(`Process '${proc.id}' references unknown state '${stateId}'`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info: m,
  };
}

/**
 * Validate that processes/*.json match methodology.yaml processes
 */
export async function validateProcessSync(
  methodologyPath: string,
  namespace: string,
  methodology: MethodologyInfo
): Promise<{ synced: boolean; issues: string[] }> {
  const issues: string[] = [];
  const processesDir = path.join(methodologyPath, 'namespaces', namespace, 'processes');

  // Get methodology processes
  const methodologyProcessIds = new Set(methodology.processes?.map(p => p.id) || []);

  // Get filesystem processes
  let fsProcessIds: Set<string>;
  try {
    const files = await fs.readdir(processesDir);
    fsProcessIds = new Set(
      files
        .filter(f => f.endsWith('.json') && !f.includes('.schema.'))
        .map(f => f.replace('.json', ''))
    );
  } catch {
    issues.push(`Cannot read processes directory: ${processesDir}`);
    return { synced: false, issues };
  }

  // Check for processes in methodology but not in filesystem
  for (const procId of methodologyProcessIds) {
    if (!fsProcessIds.has(procId)) {
      issues.push(`Process '${procId}' in methodology.yaml but missing processes/${procId}.json`);
    }
  }

  // Check for processes in filesystem but not in methodology
  for (const procId of fsProcessIds) {
    if (!methodologyProcessIds.has(procId)) {
      issues.push(`Process '${procId}' exists in filesystem but not defined in methodology.yaml`);
    }
  }

  // Validate states_sequence matches process phases
  for (const proc of methodology.processes || []) {
    const processFile = path.join(processesDir, `${proc.id}.json`);
    try {
      const content = await fs.readFile(processFile, 'utf-8');
      const processJson = JSON.parse(content);

      if (processJson.phases) {
        const jsonPhaseIds = processJson.phases.map((p: { id: string }) => p.id.toUpperCase());
        const methodologyStates = proc.states_sequence;

        // Compare (allowing for case differences)
        const jsonSet = new Set(jsonPhaseIds);
        const methodologySet = new Set(methodologyStates);

        for (const state of methodologyStates) {
          if (!jsonSet.has(state) && !jsonSet.has(state.toLowerCase())) {
            issues.push(`Process '${proc.id}': state '${state}' in methodology but not in JSON phases`);
          }
        }
      }
    } catch {
      // Process file might not exist or be invalid, already caught above
    }
  }

  return {
    synced: issues.length === 0,
    issues,
  };
}
