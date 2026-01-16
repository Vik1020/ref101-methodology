/**
 * generate command
 * Generates processes/*.json from methodology.yaml (SSOT)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import YAML from 'yaml';
import { getProjectRoot, getNamespacePath, namespaceExists, getAvailableNamespaces } from '../lib/parser.js';
import type { Methodology, Process, PhaseDefault, ApprovalPoint, SCCUProcess, SCCUPhase } from '../lib/types.js';

interface GenerateOptions {
  output?: string;
  dryRun?: boolean;
  force?: boolean;
}

export async function generateCommand(namespace: string, options: GenerateOptions): Promise<void> {
  console.log(`\nGenerating processes from methodology.yaml for namespace: ${namespace}\n`);

  // Validate namespace exists
  if (!namespaceExists(namespace)) {
    const available = getAvailableNamespaces();
    console.error(`Error: Namespace '${namespace}' not found.`);
    console.error(`Available namespaces: ${available.join(', ')}`);
    process.exit(1);
  }

  // Load methodology.yaml
  const methodologyPath = join(getNamespacePath(namespace), 'methodology.yaml');

  if (!existsSync(methodologyPath)) {
    console.error(`Error: methodology.yaml not found at ${methodologyPath}`);
    console.error('Run extract first to create methodology.yaml');
    process.exit(1);
  }

  const content = readFileSync(methodologyPath, 'utf-8');
  const methodology = YAML.parse(content) as Methodology;

  if (!methodology.processes || methodology.processes.length === 0) {
    console.error('Error: No processes defined in methodology.yaml');
    process.exit(1);
  }

  if (!methodology.phase_defaults) {
    console.warn('Warning: No phase_defaults defined. Using empty defaults.');
  }

  const phaseDefaults = methodology.phase_defaults || {};

  console.log(`Found ${methodology.processes.length} process(es) to generate`);
  console.log(`Phase defaults for ${Object.keys(phaseDefaults).length} phases\n`);

  // Output directory
  const outputDir = options.output || join(getNamespacePath(namespace), 'processes');

  if (!options.dryRun && !existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Generate each process
  const generated: string[] = [];
  const errors: string[] = [];

  for (const process of methodology.processes) {
    try {
      const scceProcess = generateProcess(process, phaseDefaults);
      const outputPath = join(outputDir, `${process.id}.json`);

      if (options.dryRun) {
        console.log(`--- ${process.id}.json ---`);
        console.log(JSON.stringify(scceProcess, null, 2));
        console.log('');
      } else {
        // Check if file exists and was manually modified
        if (existsSync(outputPath) && !options.force) {
          const existing = JSON.parse(readFileSync(outputPath, 'utf-8'));
          if (existing._generated === false) {
            console.log(`  ⚠ Skipping ${process.id}.json (manually modified, use --force to overwrite)`);
            continue;
          }
        }

        writeFileSync(outputPath, JSON.stringify(scceProcess, null, 2) + '\n', 'utf-8');
        console.log(`  ✓ Generated ${process.id}.json`);
      }

      generated.push(process.id);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`${process.id}: ${msg}`);
      console.error(`  ✗ Failed to generate ${process.id}: ${msg}`);
    }
  }

  // Summary
  console.log(`\n${'─'.repeat(40)}`);
  if (options.dryRun) {
    console.log(`Dry run complete. ${generated.length} process(es) would be generated.`);
  } else {
    console.log(`Generated ${generated.length} process file(s) to ${outputDir}`);
  }

  if (errors.length > 0) {
    console.log(`${errors.length} error(s) occurred.`);
    process.exit(1);
  }
}

function generateProcess(
  process: Process,
  phaseDefaults: Record<string, PhaseDefault>
): SCCUProcess {
  const phases: SCCUPhase[] = [];

  // Parse approval_points - can be string[] (legacy) or Record (SSOT)
  const approvalPoints: Record<string, ApprovalPoint> = parseApprovalPoints(process.approval_points);

  for (const stateId of process.states_sequence) {
    const normalizedId = stateId.toUpperCase();

    // Get defaults for this phase
    const defaults = phaseDefaults[normalizedId] || {};

    // Get overrides from process
    const overrides = process.phase_overrides?.[normalizedId] || {};

    // Merge defaults + overrides
    const phase: SCCUPhase = {
      id: denormalizePhaseId(stateId),
      skip_allowed: overrides.skip_allowed ?? defaults.skip_allowed ?? false,
    };

    // Template
    const template = overrides.template || defaults.template;
    if (template) {
      phase.template = template;
    }

    // Validators
    const validators = overrides.validators || defaults.validators;
    if (validators && validators.length > 0) {
      phase.validators = validators;
    }

    // Approval (from approval_points)
    if (approvalPoints[normalizedId]) {
      const role = overrides.approval_role || approvalPoints[normalizedId].role;
      phase.approval = {
        required: true,
        role: role,
      };
    }

    phases.push(phase);
  }

  // Build the SCCU process object
  const result: SCCUProcess = {
    process_id: process.id,
    version: process.version || '1.0.0',
    name: process.name || process.id,
    description: process.description || '',
    type: process.type || 'feature_development',
    phases,
  };

  // Add nodes if present
  if (process.nodes && Object.keys(process.nodes).length > 0) {
    result.nodes = process.nodes;
  }

  return result;
}

function parseApprovalPoints(
  points: string[] | Record<string, ApprovalPoint> | undefined
): Record<string, ApprovalPoint> {
  if (!points) return {};

  // Legacy string array format
  if (Array.isArray(points)) {
    const result: Record<string, ApprovalPoint> = {};
    for (const point of points) {
      const normalized = point.toUpperCase();
      result[normalized] = { role: 'approver' }; // default role
    }
    return result;
  }

  // New Record format
  const result: Record<string, ApprovalPoint> = {};
  for (const [key, value] of Object.entries(points)) {
    result[key.toUpperCase()] = value;
  }
  return result;
}

/**
 * Convert normalized phase ID back to SCCU format
 * BC_DELTA -> BC_delta (preserve existing conventions)
 */
function denormalizePhaseId(id: string): string {
  // Common patterns
  const patterns: Record<string, string> = {
    'BC_DELTA': 'BC_delta',
    'AC_DELTA': 'AC_delta',
    'PLAN_FINALIZE': 'PLAN_FINALIZE',
    'APPLY_DELTAS': 'APPLY_DELTAS',
  };

  const upper = id.toUpperCase();
  return patterns[upper] || upper;
}
