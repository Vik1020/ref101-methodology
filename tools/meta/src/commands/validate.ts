import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
import { getProjectRoot, namespaceExists, getAvailableNamespaces } from '../lib/parser.js';
import type { Methodology, ValidationResult } from '../lib/types.js';

interface ValidateOptions {
  strict?: boolean;
}

export async function validateCommand(namespace: string, options: ValidateOptions): Promise<void> {
  console.log(`\nValidating methodology for namespace: ${namespace}\n`);

  // Validate namespace exists
  if (!namespaceExists(namespace)) {
    const available = getAvailableNamespaces();
    console.error(`Error: Namespace '${namespace}' not found.`);
    console.error(`Available namespaces: ${available.join(', ')}`);
    process.exit(1);
  }

  // Try to load methodology.yaml from different locations
  const possiblePaths = [
    join(getProjectRoot(), 'namespaces', namespace, 'methodology.yaml'),
    join(getProjectRoot(), 'meta', 'generated', `${namespace}.methodology.yaml`),
  ];

  let methodologyPath: string | null = null;
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      methodologyPath = path;
      break;
    }
  }

  if (!methodologyPath) {
    console.error('Error: No methodology.yaml found.');
    console.error('Run extract first: node dist/index.js extract ' + namespace);
    process.exit(1);
  }

  console.log(`Loading: ${methodologyPath}`);

  // Parse methodology
  let methodology: Methodology;
  try {
    const content = readFileSync(methodologyPath, 'utf-8');
    methodology = YAML.parse(content) as Methodology;
  } catch (error) {
    console.error('Error parsing methodology.yaml:', error);
    process.exit(1);
  }

  // Run validations
  const result = validateMethodology(methodology);

  // Print results
  printValidationResults(result, options.strict);

  // Exit with appropriate code
  if (result.errors.length > 0) {
    process.exit(1);
  }
  if (options.strict && result.warnings.length > 0) {
    process.exit(1);
  }
}

function validateMethodology(m: Methodology): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // === REQUIRED FIELDS ===
  if (!m.methodology_id) {
    errors.push('Missing required field: methodology_id');
  }
  if (!m.version) {
    errors.push('Missing required field: version');
  }
  if (!m.name) {
    errors.push('Missing required field: name');
  }
  if (!m.states || m.states.length < 2) {
    errors.push('Must have at least 2 states (Initial and Terminal)');
  }
  if (!m.actors || m.actors.length < 1) {
    errors.push('Must have at least 1 actor');
  }
  if (!m.actions || m.actions.length < 1) {
    errors.push('Must have at least 1 action');
  }
  if (!m.facts || m.facts.length < 1) {
    errors.push('Must have at least 1 fact');
  }

  // === STATES VALIDATION ===
  if (m.states) {
    // Check for exactly one Initial state
    const initialStates = m.states.filter(s => s.type === 'Initial');
    if (initialStates.length === 0) {
      errors.push('No Initial state defined');
    } else if (initialStates.length > 1) {
      errors.push(`Multiple Initial states defined: ${initialStates.map(s => s.id).join(', ')}`);
    }

    // Check for at least one Terminal state
    const terminalStates = m.states.filter(s => s.type === 'Terminal');
    if (terminalStates.length === 0) {
      errors.push('No Terminal state defined');
    }

    // Check for Error state
    const errorStates = m.states.filter(s => s.type === 'Error');
    if (errorStates.length === 0) {
      warnings.push('No Error state defined (recommended for robustness)');
    }

    // Check Waiting states have timeout
    const waitingStates = m.states.filter(s => s.type === 'Waiting');
    for (const state of waitingStates) {
      if (!state.timeout) {
        warnings.push(`Waiting state '${state.id}' has no timeout defined`);
      }
    }
  }

  // === ACTORS VALIDATION ===
  if (m.actors) {
    for (const actor of m.actors) {
      if (!actor.tools || actor.tools.length === 0) {
        warnings.push(`Actor '${actor.id}' has no tools defined`);
      }
    }

    // Check for Human actor for approvals
    const hasHuman = m.actors.some(a => a.type === 'Human');
    const hasApprovals = m.actions?.some(a => a.name?.toLowerCase().includes('approve'));
    if (hasApprovals && !hasHuman) {
      warnings.push('Approval actions exist but no Human actors defined');
    }
  }

  // === TOOLS VALIDATION ===
  if (m.tools) {
    for (const tool of m.tools) {
      if (!tool.compatible_actors || tool.compatible_actors.length === 0) {
        warnings.push(`Tool '${tool.id}' has no compatible_actors defined`);
      }

      // Check UI tools are not compatible with AI
      if (tool.type === 'UI' && tool.compatible_actors?.includes('AI')) {
        warnings.push(`Tool '${tool.id}' is UI type but marked compatible with AI`);
      }
    }
  }

  // === ACTIONS VALIDATION ===
  if (m.actions) {
    const stateIds = new Set(m.states?.map(s => s.id) || []);
    const actorIds = new Set(m.actors?.map(a => a.id) || []);
    const toolIds = new Set(m.tools?.map(t => t.id) || []);

    for (const action of m.actions) {
      // Check actor exists
      if (action.actor && !actorIds.has(action.actor)) {
        warnings.push(`Action '${action.id}' references unknown actor '${action.actor}'`);
      }

      // Check tool exists
      if (action.tool && !toolIds.has(action.tool)) {
        warnings.push(`Action '${action.id}' references unknown tool '${action.tool}'`);
      }

      // Check allowed_in_states exist
      if (action.allowed_in_states) {
        for (const stateId of action.allowed_in_states) {
          if (!stateIds.has(stateId)) {
            warnings.push(`Action '${action.id}' references unknown state '${stateId}'`);
          }
        }
      }

      // Check action has at least one allowed state
      if (!action.allowed_in_states || action.allowed_in_states.length === 0) {
        warnings.push(`Action '${action.id}' has no allowed_in_states`);
      }
    }
  }

  // === FACTS VALIDATION ===
  if (m.facts) {
    const stateIds = new Set(m.states?.map(s => s.id) || []);
    const actionIds = new Set(m.actions?.map(a => a.id) || []);

    for (const fact of m.facts) {
      // Check from_state exists
      if (fact.from_state && !stateIds.has(fact.from_state)) {
        warnings.push(`Fact '${fact.id}' references unknown from_state '${fact.from_state}'`);
      }

      // Check to_state exists
      if (fact.to_state && !stateIds.has(fact.to_state)) {
        warnings.push(`Fact '${fact.id}' references unknown to_state '${fact.to_state}'`);
      }

      // Check triggered_by action exists
      if (fact.triggered_by && !actionIds.has(fact.triggered_by)) {
        warnings.push(`Fact '${fact.id}' references unknown action '${fact.triggered_by}'`);
      }

      // Facts should have from_state and to_state for transitions
      if (!fact.from_state || !fact.to_state) {
        warnings.push(`Fact '${fact.id}' missing from_state or to_state (may not trigger transition)`);
      }
    }
  }

  // === RULES VALIDATION ===
  if (m.rules) {
    for (const rule of m.rules) {
      if (!rule.condition) {
        warnings.push(`Rule '${rule.id}' has no condition defined`);
      }
      if (!rule.on_violation) {
        warnings.push(`Rule '${rule.id}' has no on_violation action defined`);
      }
    }
  }

  // === PROCESSES VALIDATION ===
  if (m.processes) {
    const stateIds = new Set(m.states?.map(s => s.id) || []);

    for (const process of m.processes) {
      // Check all states in sequence exist
      for (const stateId of process.states_sequence) {
        if (!stateIds.has(stateId)) {
          warnings.push(`Process '${process.id}' references unknown state '${stateId}'`);
        }
      }

      // Check sequence starts with Initial state
      if (process.states_sequence.length > 0) {
        const firstState = m.states?.find(s => s.id === process.states_sequence[0]);
        if (firstState && firstState.type !== 'Initial') {
          warnings.push(`Process '${process.id}' doesn't start with Initial state`);
        }
      }

      // Check sequence ends with Terminal state
      if (process.states_sequence.length > 0) {
        const lastState = m.states?.find(
          s => s.id === process.states_sequence[process.states_sequence.length - 1]
        );
        if (lastState && lastState.type !== 'Terminal') {
          warnings.push(`Process '${process.id}' doesn't end with Terminal state`);
        }
      }
    }
  }

  // === REACHABILITY CHECK ===
  if (m.states && m.facts) {
    const reachableStates = new Set<string>();
    const initialState = m.states.find(s => s.type === 'Initial');
    if (initialState) {
      reachableStates.add(initialState.id);

      // BFS to find reachable states
      const queue = [initialState.id];
      while (queue.length > 0) {
        const current = queue.shift()!;
        for (const fact of m.facts) {
          if (fact.from_state === current && fact.to_state && !reachableStates.has(fact.to_state)) {
            reachableStates.add(fact.to_state);
            queue.push(fact.to_state);
          }
        }
      }

      // Check for unreachable states
      for (const state of m.states) {
        if (!reachableStates.has(state.id) && state.type !== 'Initial') {
          warnings.push(`State '${state.id}' is not reachable from Initial state`);
        }
      }
    }
  }

  // === DEADLOCK DETECTION ===
  // Check that each non-Terminal state has at least one outgoing transition
  if (m.states && m.facts) {
    const statesWithOutgoingFacts = new Set<string>();

    // Collect all states that have outgoing facts
    for (const fact of m.facts) {
      if (fact.from_state && fact.to_state) {
        statesWithOutgoingFacts.add(fact.from_state);
      }
    }

    // Check each non-Terminal, non-Error state has an exit
    for (const state of m.states) {
      if (state.type !== 'Terminal' && state.type !== 'Error') {
        if (!statesWithOutgoingFacts.has(state.id)) {
          errors.push(`Deadlock: State '${state.id}' has no outgoing transitions`);
        }
      }
    }
  }

  // === TERMINATION CHECK ===
  // Check that from each non-Terminal state, at least one Terminal state is reachable
  if (m.states && m.facts) {
    const terminalStates = m.states.filter(s => s.type === 'Terminal').map(s => s.id);

    // Build reverse adjacency for BFS from terminal states
    const reverseAdj = new Map<string, string[]>();
    for (const fact of m.facts) {
      if (fact.from_state && fact.to_state) {
        if (!reverseAdj.has(fact.to_state)) {
          reverseAdj.set(fact.to_state, []);
        }
        reverseAdj.get(fact.to_state)!.push(fact.from_state);
      }
    }

    // BFS from all Terminal states backwards
    const canReachTerminal = new Set<string>(terminalStates);
    const queue = [...terminalStates];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const predecessors = reverseAdj.get(current) || [];
      for (const pred of predecessors) {
        if (!canReachTerminal.has(pred)) {
          canReachTerminal.add(pred);
          queue.push(pred);
        }
      }
    }

    // Check each non-Terminal, non-Error state can reach Terminal
    for (const state of m.states) {
      if (state.type !== 'Terminal' && state.type !== 'Error') {
        if (!canReachTerminal.has(state.id)) {
          warnings.push(`State '${state.id}' cannot reach any Terminal state`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function printValidationResults(result: ValidationResult, strict?: boolean): void {
  console.log('\n--- Validation Results ---\n');

  if (result.errors.length > 0) {
    console.log('ERRORS:');
    for (const error of result.errors) {
      console.log(`  ✗ ${error}`);
    }
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log('WARNINGS:');
    for (const warning of result.warnings) {
      console.log(`  ⚠ ${warning}`);
    }
    console.log();
  }

  // Summary
  const status = result.errors.length > 0 ? '✗ INVALID' :
    (result.warnings.length > 0 ? '⚠ VALID with warnings' : '✓ VALID');

  console.log(`Status: ${status}`);
  console.log(`  Errors:   ${result.errors.length}`);
  console.log(`  Warnings: ${result.warnings.length}`);

  if (strict && result.warnings.length > 0) {
    console.log('\nNote: Running in strict mode - warnings are treated as errors');
  }
}
