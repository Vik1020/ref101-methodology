import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import YAML from 'yaml';
import { getProjectRoot, namespaceExists, getAvailableNamespaces } from '../lib/parser.js';
import type { Methodology, State, Fact } from '../lib/types.js';

interface VisualizeOptions {
  format?: 'mermaid';
  output?: string;
}

export async function visualizeCommand(namespace: string, options: VisualizeOptions): Promise<void> {
  console.log(`\nGenerating visualization for namespace: ${namespace}\n`);

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

  // Generate visualization based on format
  const format = options.format || 'mermaid';
  let output: string;

  if (format === 'mermaid') {
    output = generateMermaidDiagram(methodology);
  } else {
    console.error(`Error: Unknown format '${format}'. Supported: mermaid`);
    process.exit(1);
  }

  // Output result
  if (options.output) {
    const outputDir = dirname(options.output);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    writeFileSync(options.output, output, 'utf-8');
    console.log(`\nDiagram written to: ${options.output}`);
  } else {
    console.log('\n--- Mermaid Diagram ---\n');
    console.log(output);
    console.log('\n--- End Diagram ---');
    console.log('\nTip: Copy to https://mermaid.live to visualize');
  }
}

function generateMermaidDiagram(m: Methodology): string {
  const lines: string[] = ['stateDiagram-v2'];

  // Find Initial and Terminal states
  const initialState = m.states.find(s => s.type === 'Initial');
  const terminalStates = m.states.filter(s => s.type === 'Terminal');
  const errorState = m.states.find(s => s.type === 'Error');
  const waitingStates = m.states.filter(s => s.type === 'Waiting');

  // Add note about state types
  lines.push('');
  lines.push('    %% State types:');
  lines.push('    %% Initial: ' + (initialState?.id || 'none'));
  lines.push('    %% Terminal: ' + terminalStates.map(s => s.id).join(', '));
  if (errorState) {
    lines.push('    %% Error: ' + errorState.id);
  }
  if (waitingStates.length > 0) {
    lines.push('    %% Waiting (approval): ' + waitingStates.map(s => s.id).join(', '));
  }
  lines.push('');

  // Collect all transitions from Facts
  const transitions: Array<{ from: string; to: string; label: string; isError?: boolean }> = [];

  for (const fact of m.facts || []) {
    if (fact.from_state && fact.to_state) {
      const isErrorTransition =
        fact.to_state === errorState?.id ||
        fact.from_state === errorState?.id ||
        fact.id.includes('error') ||
        fact.id.includes('fail');

      transitions.push({
        from: fact.from_state,
        to: fact.to_state,
        label: fact.id,
        isError: isErrorTransition,
      });
    }
  }

  // Add [*] -> Initial state
  if (initialState) {
    lines.push(`    [*] --> ${initialState.id}`);
  }

  // Group transitions: normal first, then error
  const normalTransitions = transitions.filter(t => !t.isError);
  const errorTransitions = transitions.filter(t => t.isError);

  // Add normal transitions
  if (normalTransitions.length > 0) {
    lines.push('');
    lines.push('    %% Normal transitions');
    for (const t of normalTransitions) {
      lines.push(`    ${t.from} --> ${t.to}: ${t.label}`);
    }
  }

  // Add Terminal -> [*]
  for (const terminal of terminalStates) {
    lines.push(`    ${terminal.id} --> [*]`);
  }

  // Add error transitions
  if (errorTransitions.length > 0) {
    lines.push('');
    lines.push('    %% Error transitions');
    for (const t of errorTransitions) {
      lines.push(`    ${t.from} --> ${t.to}: ${t.label}`);
    }
  }

  // Add state descriptions for Waiting states (approval points)
  if (waitingStates.length > 0) {
    lines.push('');
    lines.push('    %% Approval points (Waiting states)');
    for (const state of waitingStates) {
      lines.push(`    note right of ${state.id}: Requires approval`);
    }
  }

  // Style Error state if exists
  if (errorState) {
    lines.push('');
    lines.push('    %% Error state styling');
    lines.push(`    ${errorState.id}:::errorState`);
    lines.push('    classDef errorState fill:#f96,stroke:#333,stroke-width:2px');
  }

  // Add processes as separate comments
  if (m.processes && m.processes.length > 0) {
    lines.push('');
    lines.push('    %% Processes defined:');
    for (const process of m.processes) {
      lines.push(`    %% - ${process.id}: ${process.states_sequence.join(' -> ')}`);
    }
  }

  return lines.join('\n');
}
