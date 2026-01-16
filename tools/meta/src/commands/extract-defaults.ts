/**
 * extract-defaults command
 * Extracts phase_defaults from existing processes/*.json files
 * for migration to SSOT methodology.yaml
 */

import YAML from 'yaml';
import { parseProcesses, namespaceExists, getAvailableNamespaces } from '../lib/parser.js';
import type { PhaseDefault, SCCUProcess, SCCUPhase } from '../lib/types.js';

interface ExtractDefaultsOptions {
  format?: 'yaml' | 'json';
}

interface ExtractedPhaseDefault extends PhaseDefault {
  // Track which processes use this phase
  _used_in?: string[];
}

export async function extractDefaultsCommand(
  namespace: string,
  options: ExtractDefaultsOptions
): Promise<void> {
  console.log(`\nExtracting phase defaults from namespace: ${namespace}\n`);

  // Validate namespace exists
  if (!namespaceExists(namespace)) {
    const available = getAvailableNamespaces();
    console.error(`Error: Namespace '${namespace}' not found.`);
    console.error(`Available namespaces: ${available.join(', ')}`);
    process.exit(1);
  }

  // Parse all processes
  const processes = parseProcesses(namespace);

  if (processes.length === 0) {
    console.error('Error: No processes found in namespace.');
    process.exit(1);
  }

  console.log(`Found ${processes.length} process(es): ${processes.map(p => p.process_id).join(', ')}`);

  // Extract phase defaults from all processes
  const phaseDefaults = extractPhaseDefaults(processes);

  // Also extract extended process info
  const extendedProcesses = extractExtendedProcesses(processes);

  console.log(`\nExtracted defaults for ${Object.keys(phaseDefaults).length} phases:`);
  for (const [phaseId, defaults] of Object.entries(phaseDefaults)) {
    const validators = defaults.validators?.length || 0;
    const approval = defaults.approval_role ? ` (approval: ${defaults.approval_role})` : '';
    const usedIn = defaults._used_in?.join(', ') || '';
    console.log(`  - ${phaseId}: ${validators} validators${approval} [${usedIn}]`);
  }

  // Generate output
  const format = options.format || 'yaml';

  // Clean up internal fields for output
  const cleanDefaults: Record<string, PhaseDefault> = {};
  for (const [key, value] of Object.entries(phaseDefaults)) {
    const { _used_in, ...clean } = value;
    cleanDefaults[key] = clean;
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log('Add this to methodology.yaml:\n');

  if (format === 'yaml') {
    // Output phase_defaults section
    console.log('# Phase defaults for SSOT process generation');
    console.log(YAML.stringify({ phase_defaults: cleanDefaults }, { lineWidth: 100 }));

    // Output extended processes section
    console.log('\n# Extended process definitions (replace existing processes section)');
    console.log(YAML.stringify({ processes: extendedProcesses }, { lineWidth: 100 }));
  } else {
    console.log(JSON.stringify({ phase_defaults: cleanDefaults, processes: extendedProcesses }, null, 2));
  }

  console.log(`${'─'.repeat(60)}`);
}

function extractPhaseDefaults(processes: SCCUProcess[]): Record<string, ExtractedPhaseDefault> {
  const defaults: Record<string, ExtractedPhaseDefault> = {};

  for (const process of processes) {
    for (const phase of process.phases) {
      const phaseId = normalizePhaseId(phase.id);

      if (!defaults[phaseId]) {
        defaults[phaseId] = {
          _used_in: [],
        };
      }

      const current = defaults[phaseId];
      current._used_in!.push(process.process_id);

      // Template (prefer first found)
      if (phase.template && !current.template) {
        current.template = phase.template;
      }

      // Validators (merge unique)
      if (phase.validators && phase.validators.length > 0) {
        if (!current.validators) {
          current.validators = [...phase.validators];
        } else {
          // Add any new validators not already in the list
          for (const v of phase.validators) {
            if (!current.validators.includes(v)) {
              current.validators.push(v);
            }
          }
        }
      }

      // Approval role (prefer first found)
      if (phase.approval?.role && !current.approval_role) {
        current.approval_role = phase.approval.role;
      }

      // Skip allowed (use most permissive - true wins)
      if (phase.skip_allowed === true) {
        current.skip_allowed = true;
      } else if (current.skip_allowed === undefined) {
        current.skip_allowed = phase.skip_allowed;
      }
    }
  }

  return defaults;
}

function extractExtendedProcesses(processes: SCCUProcess[]): Array<{
  id: string;
  version: string;
  name: string;
  type: string;
  description: string;
  states_sequence: string[];
  approval_points: Record<string, { role: string }>;
  nodes?: Record<string, string>;
}> {
  return processes.map(p => {
    // Extract approval points as Record
    const approvalPoints: Record<string, { role: string }> = {};
    for (const phase of p.phases) {
      if (phase.approval?.required && phase.approval.role) {
        const phaseId = normalizePhaseId(phase.id);
        approvalPoints[phaseId] = { role: phase.approval.role };
      }
    }

    return {
      id: p.process_id,
      version: p.version,
      name: p.name,
      type: p.type,
      description: p.description,
      states_sequence: p.phases.map(ph => normalizePhaseId(ph.id)),
      approval_points: approvalPoints,
      ...(p.nodes && Object.keys(p.nodes).length > 0 ? { nodes: p.nodes } : {}),
    };
  });
}

/**
 * Normalize phase ID to uppercase format (BC_delta -> BC_DELTA)
 */
function normalizePhaseId(id: string): string {
  // Convert common patterns like BC_delta to BC_DELTA
  return id.toUpperCase();
}
