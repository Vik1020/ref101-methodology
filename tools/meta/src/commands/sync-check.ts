/**
 * sync-check command
 * Checks synchronization between methodology.yaml and processes/*.json
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
import { parseProcesses, getNamespacePath, namespaceExists, getAvailableNamespaces } from '../lib/parser.js';
import type { Methodology, Process, PhaseDefault, ApprovalPoint, SCCUProcess, SCCUPhase } from '../lib/types.js';

interface SyncCheckOptions {
  verbose?: boolean;
}

interface SyncIssue {
  processId: string;
  phaseId?: string;
  field: string;
  expected: unknown;
  actual: unknown;
  severity: 'error' | 'warning';
}

export async function syncCheckCommand(namespace: string, options: SyncCheckOptions): Promise<void> {
  console.log(`\nChecking sync between methodology.yaml and processes/*.json`);
  console.log(`Namespace: ${namespace}\n`);

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
    console.error('Cannot check sync without methodology.yaml');
    process.exit(1);
  }

  const content = readFileSync(methodologyPath, 'utf-8');
  const methodology = YAML.parse(content) as Methodology;

  if (!methodology.processes || methodology.processes.length === 0) {
    console.error('Error: No processes defined in methodology.yaml');
    process.exit(1);
  }

  const phaseDefaults = methodology.phase_defaults || {};

  // Load actual processes
  const actualProcesses = parseProcesses(namespace);
  const actualProcessMap = new Map<string, SCCUProcess>();
  for (const p of actualProcesses) {
    actualProcessMap.set(p.process_id, p);
  }

  // Check each process defined in methodology
  const issues: SyncIssue[] = [];

  for (const expectedProcess of methodology.processes) {
    const actual = actualProcessMap.get(expectedProcess.id);

    if (!actual) {
      issues.push({
        processId: expectedProcess.id,
        field: 'process',
        expected: 'exists',
        actual: 'missing',
        severity: 'error',
      });
      continue;
    }

    // Compare process-level fields
    compareProcessFields(expectedProcess, actual, issues);

    // Compare phases
    const expectedPhases = generateExpectedPhases(expectedProcess, phaseDefaults);
    comparePhases(expectedProcess.id, expectedPhases, actual.phases, issues, options.verbose);
  }

  // Check for extra processes not in methodology
  for (const [processId, actual] of actualProcessMap) {
    const inMethodology = methodology.processes.find(p => p.id === processId);
    if (!inMethodology) {
      issues.push({
        processId,
        field: 'process',
        expected: 'not defined in methodology',
        actual: 'exists in processes/',
        severity: 'warning',
      });
    }
  }

  // Print results
  printResults(issues, options.verbose);
}

function compareProcessFields(expected: Process, actual: SCCUProcess, issues: SyncIssue[]) {
  // Compare version
  if (expected.version && expected.version !== actual.version) {
    issues.push({
      processId: expected.id,
      field: 'version',
      expected: expected.version,
      actual: actual.version,
      severity: 'warning',
    });
  }

  // Compare name
  if (expected.name && expected.name !== actual.name) {
    issues.push({
      processId: expected.id,
      field: 'name',
      expected: expected.name,
      actual: actual.name,
      severity: 'warning',
    });
  }

  // Compare type
  if (expected.type && expected.type !== actual.type) {
    issues.push({
      processId: expected.id,
      field: 'type',
      expected: expected.type,
      actual: actual.type,
      severity: 'warning',
    });
  }

  // Compare description
  if (expected.description && !actual.description?.includes(expected.description.slice(0, 50))) {
    issues.push({
      processId: expected.id,
      field: 'description',
      expected: expected.description.slice(0, 50) + '...',
      actual: (actual.description || '').slice(0, 50) + '...',
      severity: 'warning',
    });
  }

  // Compare phase count
  if (expected.states_sequence.length !== actual.phases.length) {
    issues.push({
      processId: expected.id,
      field: 'phases.length',
      expected: expected.states_sequence.length,
      actual: actual.phases.length,
      severity: 'error',
    });
  }
}

function generateExpectedPhases(
  process: Process,
  phaseDefaults: Record<string, PhaseDefault>
): Map<string, SCCUPhase> {
  const phases = new Map<string, SCCUPhase>();

  // Parse approval points
  const approvalPoints = parseApprovalPoints(process.approval_points);

  for (const stateId of process.states_sequence) {
    const normalizedId = stateId.toUpperCase();
    const defaults = phaseDefaults[normalizedId] || {};
    const overrides = process.phase_overrides?.[normalizedId] || {};

    const phase: SCCUPhase = {
      id: denormalizePhaseId(stateId),
      skip_allowed: overrides.skip_allowed ?? defaults.skip_allowed ?? false,
    };

    const template = overrides.template || defaults.template;
    if (template) phase.template = template;

    const validators = overrides.validators || defaults.validators;
    if (validators && validators.length > 0) phase.validators = validators;

    if (approvalPoints[normalizedId]) {
      phase.approval = {
        required: true,
        role: overrides.approval_role || approvalPoints[normalizedId].role,
      };
    }

    phases.set(normalizedId, phase);
  }

  return phases;
}

function comparePhases(
  processId: string,
  expected: Map<string, SCCUPhase>,
  actual: SCCUPhase[],
  issues: SyncIssue[],
  verbose?: boolean
) {
  const actualMap = new Map<string, SCCUPhase>();
  for (const p of actual) {
    actualMap.set(p.id.toUpperCase(), p);
  }

  for (const [phaseId, expectedPhase] of expected) {
    const actualPhase = actualMap.get(phaseId);

    if (!actualPhase) {
      issues.push({
        processId,
        phaseId,
        field: 'phase',
        expected: 'exists',
        actual: 'missing',
        severity: 'error',
      });
      continue;
    }

    // Compare template
    if (expectedPhase.template !== actualPhase.template) {
      issues.push({
        processId,
        phaseId,
        field: 'template',
        expected: expectedPhase.template,
        actual: actualPhase.template,
        severity: 'warning',
      });
    }

    // Compare validators
    const expectedValidators = expectedPhase.validators || [];
    const actualValidators = actualPhase.validators || [];
    if (!arraysEqual(expectedValidators, actualValidators)) {
      issues.push({
        processId,
        phaseId,
        field: 'validators',
        expected: expectedValidators,
        actual: actualValidators,
        severity: 'warning',
      });
    }

    // Compare approval
    if (expectedPhase.approval && !actualPhase.approval) {
      issues.push({
        processId,
        phaseId,
        field: 'approval',
        expected: expectedPhase.approval,
        actual: undefined,
        severity: 'error',
      });
    } else if (!expectedPhase.approval && actualPhase.approval) {
      issues.push({
        processId,
        phaseId,
        field: 'approval',
        expected: undefined,
        actual: actualPhase.approval,
        severity: 'warning',
      });
    } else if (expectedPhase.approval && actualPhase.approval) {
      if (expectedPhase.approval.role !== actualPhase.approval.role) {
        issues.push({
          processId,
          phaseId,
          field: 'approval.role',
          expected: expectedPhase.approval.role,
          actual: actualPhase.approval.role,
          severity: 'warning',
        });
      }
    }

    // Compare skip_allowed
    if (expectedPhase.skip_allowed !== actualPhase.skip_allowed) {
      issues.push({
        processId,
        phaseId,
        field: 'skip_allowed',
        expected: expectedPhase.skip_allowed,
        actual: actualPhase.skip_allowed,
        severity: 'warning',
      });
    }
  }
}

function printResults(issues: SyncIssue[], verbose?: boolean) {
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  // Group by process
  const byProcess = new Map<string, SyncIssue[]>();
  for (const issue of issues) {
    if (!byProcess.has(issue.processId)) {
      byProcess.set(issue.processId, []);
    }
    byProcess.get(issue.processId)!.push(issue);
  }

  for (const [processId, processIssues] of byProcess) {
    console.log(`${processId}:`);

    if (processIssues.length === 0) {
      console.log('  ✓ In sync');
      continue;
    }

    for (const issue of processIssues) {
      const icon = issue.severity === 'error' ? '✗' : '⚠';
      const location = issue.phaseId ? `[${issue.phaseId}]` : '';

      if (verbose) {
        console.log(`  ${icon} ${location} ${issue.field}:`);
        console.log(`      expected: ${formatValue(issue.expected)}`);
        console.log(`      actual:   ${formatValue(issue.actual)}`);
      } else {
        console.log(`  ${icon} ${location} ${issue.field} mismatch`);
      }
    }
  }

  // Summary
  console.log(`\n${'─'.repeat(40)}`);

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✓ All processes in sync with methodology.yaml');
  } else {
    console.log(`Status: ${errors.length} error(s), ${warnings.length} warning(s)`);

    if (errors.length > 0) {
      console.log('\nRun `ref101-meta generate <namespace>` to regenerate processes.');
      process.exit(1);
    }
  }
}

function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.length > 3) return `[${value.slice(0, 3).join(', ')}, ...]`;
    return `[${value.join(', ')}]`;
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

function parseApprovalPoints(
  points: string[] | Record<string, ApprovalPoint> | undefined
): Record<string, ApprovalPoint> {
  if (!points) return {};

  if (Array.isArray(points)) {
    const result: Record<string, ApprovalPoint> = {};
    for (const point of points) {
      result[point.toUpperCase()] = { role: 'approver' };
    }
    return result;
  }

  const result: Record<string, ApprovalPoint> = {};
  for (const [key, value] of Object.entries(points)) {
    result[key.toUpperCase()] = value;
  }
  return result;
}

function denormalizePhaseId(id: string): string {
  const patterns: Record<string, string> = {
    'BC_DELTA': 'BC_delta',
    'AC_DELTA': 'AC_delta',
    'PLAN_FINALIZE': 'PLAN_FINALIZE',
    'APPLY_DELTAS': 'APPLY_DELTAS',
  };
  const upper = id.toUpperCase();
  return patterns[upper] || upper;
}
