import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import YAML from 'yaml';
import { getProjectRoot, namespaceExists, getAvailableNamespaces } from '../lib/parser.js';
import type { Methodology } from '../lib/types.js';

type DiagramFormat = 'mermaid' | 'plantuml';
type DiagramType = 'state' | 'actors' | 'artifacts' | 'processes';

// Process ordering by lifecycle
const PROCESS_ORDER: Record<string, string[]> = {
  meta: ['methodology_creation', 'methodology_validation', 'methodology_migration', 'methodology_evolution'],
  sccu: ['feature_full', 'feature_full_auto', 'bugfix_simple'],
};

interface ProcessPhase {
  id: string;
  name?: string;
  type?: string;
  approval?: { required: boolean; role: string };
  on_failure?: string;
}

interface ProcessDefinition {
  process_id: string;
  name: string;
  phases: ProcessPhase[];
}

interface VisualizeOptions {
  format?: DiagramFormat;
  type?: DiagramType;
  output?: string;
}

export async function visualizeCommand(namespace: string, options: VisualizeOptions): Promise<void> {
  const format = (options.format || 'mermaid') as DiagramFormat;
  const diagramType = (options.type || 'state') as DiagramType;

  console.log(`\nGenerating ${diagramType} diagram (${format}) for namespace: ${namespace}\n`);

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

  // Generate diagram based on format and type
  let output: string;

  if (format === 'mermaid') {
    output = generateMermaid(methodology, diagramType, namespace);
  } else if (format === 'plantuml') {
    output = generatePlantUML(methodology, diagramType);
  } else {
    console.error(`Error: Unknown format '${format}'. Supported: mermaid, plantuml`);
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
    const formatName = format === 'mermaid' ? 'Mermaid' : 'PlantUML';
    console.log(`\n--- ${formatName} Diagram (${diagramType}) ---\n`);
    console.log(output);
    console.log('\n--- End Diagram ---');
    if (format === 'mermaid') {
      console.log('\nTip: Copy to https://mermaid.live to visualize');
    } else {
      console.log('\nTip: Copy to https://www.plantuml.com/plantuml to visualize');
    }
  }
}

// ============== MERMAID GENERATORS ==============

function generateMermaid(m: Methodology, type: DiagramType, namespace?: string): string {
  switch (type) {
    case 'state':
      return generateMermaidStateDiagram(m);
    case 'actors':
      return generateMermaidActorDiagram(m);
    case 'artifacts':
      return generateMermaidArtifactDiagram(m);
    case 'processes':
      return generateMermaidProcessesDiagram(namespace || m.methodology_id);
    default:
      return generateMermaidStateDiagram(m);
  }
}

function generateMermaidStateDiagram(m: Methodology): string {
  const lines: string[] = ['stateDiagram-v2'];

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

  // Collect transitions
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

  // Group transitions
  const normalTransitions = transitions.filter(t => !t.isError);
  const errorTransitions = transitions.filter(t => t.isError);

  if (normalTransitions.length > 0) {
    lines.push('');
    lines.push('    %% Normal transitions');
    for (const t of normalTransitions) {
      lines.push(`    ${t.from} --> ${t.to}: ${t.label}`);
    }
  }

  for (const terminal of terminalStates) {
    lines.push(`    ${terminal.id} --> [*]`);
  }

  if (errorTransitions.length > 0) {
    lines.push('');
    lines.push('    %% Error transitions');
    for (const t of errorTransitions) {
      lines.push(`    ${t.from} --> ${t.to}: ${t.label}`);
    }
  }

  if (waitingStates.length > 0) {
    lines.push('');
    lines.push('    %% Approval points');
    for (const state of waitingStates) {
      lines.push(`    note right of ${state.id}: Requires approval`);
    }
  }

  if (errorState) {
    lines.push('');
    lines.push(`    ${errorState.id}:::errorState`);
    lines.push('    classDef errorState fill:#f96,stroke:#333,stroke-width:2px');
  }

  if (m.processes && m.processes.length > 0) {
    lines.push('');
    lines.push('    %% Processes:');
    for (const process of m.processes) {
      lines.push(`    %% - ${process.id}: ${process.states_sequence.join(' -> ')}`);
    }
  }

  return lines.join('\n');
}

function generateMermaidActorDiagram(m: Methodology): string {
  const lines: string[] = ['flowchart LR'];
  lines.push('');
  lines.push('    %% Actor interaction diagram');
  lines.push('');

  // Define actor subgraphs by type
  const actorsByType: Record<string, typeof m.actors> = {};
  for (const actor of m.actors || []) {
    if (!actorsByType[actor.type]) actorsByType[actor.type] = [];
    actorsByType[actor.type].push(actor);
  }

  // Create subgraphs for actor types
  for (const [type, actors] of Object.entries(actorsByType)) {
    lines.push(`    subgraph ${type}Actors["${type} Actors"]`);
    for (const actor of actors) {
      const shape = type === 'Human' ? `(["${actor.name}"])` : `[["${actor.name}"]]`;
      lines.push(`        ${actor.id}${shape}`);
    }
    lines.push('    end');
    lines.push('');
  }

  // Define tools
  if (m.tools && m.tools.length > 0) {
    lines.push('    subgraph Tools["Tools"]');
    for (const tool of m.tools) {
      lines.push(`        ${tool.id}[("${tool.name}")]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // Connect actors to tools
  for (const actor of m.actors || []) {
    for (const toolId of actor.tools || []) {
      lines.push(`    ${actor.id} --> ${toolId}`);
    }
  }

  // Add actions as interactions
  lines.push('');
  lines.push('    %% Actions');
  for (const action of m.actions || []) {
    if (action.actor && action.tool) {
      lines.push(`    %% ${action.id}: ${action.actor} uses ${action.tool}`);
    }
  }

  // Styling
  lines.push('');
  lines.push('    classDef human fill:#ffd,stroke:#333');
  lines.push('    classDef ai fill:#ddf,stroke:#333');
  lines.push('    classDef tool fill:#dfd,stroke:#333');

  for (const actor of m.actors || []) {
    if (actor.type === 'Human') {
      lines.push(`    class ${actor.id} human`);
    } else if (actor.type === 'AI') {
      lines.push(`    class ${actor.id} ai`);
    }
  }

  for (const tool of m.tools || []) {
    lines.push(`    class ${tool.id} tool`);
  }

  return lines.join('\n');
}

function generateMermaidArtifactDiagram(m: Methodology): string {
  const lines: string[] = ['flowchart TD'];
  lines.push('');
  lines.push('    %% Artifact flow diagram');
  lines.push('');

  // Group artifacts by state where they're created
  const artifactsByState: Record<string, typeof m.artifacts> = {};

  for (const artifact of m.artifacts || []) {
    // Find which action creates this artifact
    const creatorAction = m.actions?.find(a => a.id === artifact.created_by);
    if (creatorAction?.allowed_in_states?.[0]) {
      const state = creatorAction.allowed_in_states[0];
      if (!artifactsByState[state]) artifactsByState[state] = [];
      artifactsByState[state].push(artifact);
    }
  }

  // Create state subgraphs with artifacts
  for (const state of m.states || []) {
    const stateArtifacts = artifactsByState[state.id] || [];

    lines.push(`    subgraph ${state.id}["${state.name}"]`);
    if (stateArtifacts.length > 0) {
      for (const artifact of stateArtifacts) {
        lines.push(`        ${artifact.id}[/"${artifact.name}"/]`);
      }
    } else {
      lines.push(`        ${state.id}_empty[" "]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // Connect states based on facts
  for (const fact of m.facts || []) {
    if (fact.from_state && fact.to_state && !fact.id.includes('error')) {
      lines.push(`    ${fact.from_state} --> ${fact.to_state}`);
    }
  }

  // Styling
  lines.push('');
  lines.push('    classDef artifact fill:#fff,stroke:#333');
  for (const artifact of m.artifacts || []) {
    lines.push(`    class ${artifact.id} artifact`);
  }

  return lines.join('\n');
}

function generateMermaidProcessesDiagram(namespace: string): string {
  const lines: string[] = ['flowchart TB'];
  lines.push('');
  lines.push('    %% All processes for ' + namespace);

  // Load all processes/*.json from namespace
  const processesDir = join(getProjectRoot(), 'namespaces', namespace, 'processes');

  if (!existsSync(processesDir)) {
    return `%% No processes directory found for namespace: ${namespace}`;
  }

  const processFiles = readdirSync(processesDir).filter(f => f.endsWith('.json'));

  if (processFiles.length === 0) {
    return `%% No process files found in: ${processesDir}`;
  }

  // Load processes (filter out schema files - they don't have process_id)
  const processes: ProcessDefinition[] = processFiles
    .map(f => {
      const content = readFileSync(join(processesDir, f), 'utf-8');
      return JSON.parse(content) as ProcessDefinition;
    })
    .filter(p => p.process_id); // Skip schema files

  if (processes.length === 0) {
    return `%% No valid process definitions found in: ${processesDir}`;
  }

  // Sort by lifecycle order
  const order = PROCESS_ORDER[namespace] || processes.map(p => p.process_id);
  processes.sort((a, b) => {
    const aIdx = order.indexOf(a.process_id);
    const bIdx = order.indexOf(b.process_id);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  let processIndex = 1;
  for (const process of processes) {
    // Create unique prefix: take first letter of each word in process_id
    const prefix = process.process_id.split('_').map(w => w[0]).join('');

    lines.push('');
    lines.push(`    subgraph ${process.process_id}["${processIndex}. ${process.name}"]`);
    lines.push('        direction LR');

    // Separate main phases from error phase
    const mainPhases = process.phases.filter(p => p.type !== 'Error');
    const errorPhase = process.phases.find(p => p.type === 'Error');

    // Build chain of main phases
    if (mainPhases.length > 0) {
      const chainParts: string[] = [];
      for (let i = 0; i < mainPhases.length; i++) {
        const phase = mainPhases[i];
        const nodeId = `${prefix}_${phase.id}`;
        // Infer type from position if not specified
        const inferredType = phase.type || (i === 0 ? 'Initial' : i === mainPhases.length - 1 ? 'Terminal' : 'Working');
        const shape = getProcessPhaseShape({ ...phase, type: inferredType });
        const style = getProcessPhaseStyle({ ...phase, type: inferredType });
        chainParts.push(`${nodeId}${shape}${style}`);
      }
      lines.push(`        ${chainParts.join(' --> ')}`);
    }

    // Add error phase and transitions
    if (errorPhase) {
      const errorNodeId = `${prefix}_${errorPhase.id}`;
      lines.push(`        ${errorNodeId}([${errorPhase.id}]):::error`);

      // Add on_failure transitions
      for (const phase of process.phases) {
        if (phase.on_failure) {
          lines.push(`        ${prefix}_${phase.id} -.-> ${prefix}_${phase.on_failure}`);
        }
      }
    }

    lines.push('    end');
    processIndex++;
  }

  // Add styling
  lines.push('');
  lines.push('    %% Styling');
  lines.push('    classDef initial fill:#90EE90,stroke:#333');
  lines.push('    classDef terminal fill:#87CEEB,stroke:#333');
  lines.push('    classDef error fill:#FA8072,stroke:#333');
  lines.push('    classDef approval fill:#FFD700,stroke:#333');

  return lines.join('\n');
}

function getProcessPhaseShape(phase: ProcessPhase): string {
  if (phase.type === 'Initial' || phase.type === 'Terminal' || phase.type === 'Error') {
    return `([${phase.id}])`;
  }
  return `[${phase.id}]`;
}

function getProcessPhaseStyle(phase: ProcessPhase): string {
  if (phase.type === 'Initial') return ':::initial';
  if (phase.type === 'Terminal') return ':::terminal';
  if (phase.type === 'Error') return ':::error';
  if (phase.approval?.required) return ':::approval';
  return '';
}

// ============== PLANTUML GENERATORS ==============

function generatePlantUML(m: Methodology, type: DiagramType): string {
  switch (type) {
    case 'state':
      return generatePlantUMLStateDiagram(m);
    case 'actors':
      return generatePlantUMLActorDiagram(m);
    case 'artifacts':
      return generatePlantUMLArtifactDiagram(m);
    default:
      return generatePlantUMLStateDiagram(m);
  }
}

function generatePlantUMLStateDiagram(m: Methodology): string {
  const lines: string[] = ['@startuml'];
  lines.push(`title ${m.name} - State Machine`);
  lines.push('');

  const initialState = m.states.find(s => s.type === 'Initial');
  const terminalStates = m.states.filter(s => s.type === 'Terminal');
  const errorState = m.states.find(s => s.type === 'Error');
  const waitingStates = m.states.filter(s => s.type === 'Waiting');

  // Define states with colors
  for (const state of m.states) {
    let color = '';
    if (state.type === 'Initial') color = '#lightgreen';
    else if (state.type === 'Terminal') color = '#lightblue';
    else if (state.type === 'Error') color = '#salmon';
    else if (state.type === 'Waiting') color = '#yellow';

    if (color) {
      lines.push(`state "${state.name}" as ${state.id} ${color}`);
    } else {
      lines.push(`state "${state.name}" as ${state.id}`);
    }
  }
  lines.push('');

  // Initial transition
  if (initialState) {
    lines.push(`[*] --> ${initialState.id}`);
  }

  // Transitions
  for (const fact of m.facts || []) {
    if (fact.from_state && fact.to_state) {
      lines.push(`${fact.from_state} --> ${fact.to_state} : ${fact.id}`);
    }
  }

  // Terminal transitions
  for (const terminal of terminalStates) {
    lines.push(`${terminal.id} --> [*]`);
  }

  // Notes for waiting states
  for (const state of waitingStates) {
    lines.push(`note right of ${state.id} : Requires approval`);
  }

  // Legend
  lines.push('');
  lines.push('legend right');
  lines.push('  |= Type |= Color |');
  lines.push('  | Initial | <#lightgreen> |');
  lines.push('  | Working | <#white> |');
  lines.push('  | Waiting | <#yellow> |');
  lines.push('  | Terminal | <#lightblue> |');
  lines.push('  | Error | <#salmon> |');
  lines.push('endlegend');

  lines.push('');
  lines.push('@enduml');

  return lines.join('\n');
}

function generatePlantUMLActorDiagram(m: Methodology): string {
  const lines: string[] = ['@startuml'];
  lines.push(`title ${m.name} - Actor Interactions`);
  lines.push('');

  // Define actors
  for (const actor of m.actors || []) {
    if (actor.type === 'Human') {
      lines.push(`actor "${actor.name}" as ${actor.id}`);
    } else if (actor.type === 'AI') {
      lines.push(`participant "${actor.name}" as ${actor.id} <<AI>>`);
    } else {
      lines.push(`participant "${actor.name}" as ${actor.id} <<System>>`);
    }
  }
  lines.push('');

  // Define tools as components
  for (const tool of m.tools || []) {
    lines.push(`database "${tool.name}" as ${tool.id}`);
  }
  lines.push('');

  // Connect actors to tools
  for (const actor of m.actors || []) {
    for (const toolId of actor.tools || []) {
      lines.push(`${actor.id} --> ${toolId} : uses`);
    }
  }

  // Actions as interactions
  lines.push('');
  lines.push("' Actions:");
  for (const action of m.actions || []) {
    if (action.actor && action.tool) {
      lines.push(`' ${action.name}: ${action.actor} -> ${action.tool}`);
    }
  }

  lines.push('');
  lines.push('@enduml');

  return lines.join('\n');
}

function generatePlantUMLArtifactDiagram(m: Methodology): string {
  const lines: string[] = ['@startuml'];
  lines.push(`title ${m.name} - Artifact Flow`);
  lines.push('');

  // Define artifacts
  for (const artifact of m.artifacts || []) {
    lines.push(`artifact "${artifact.name}" as ${artifact.id}`);
  }
  lines.push('');

  // Define states as folders
  for (const state of m.states || []) {
    lines.push(`folder "${state.name}" as ${state.id}_folder {`);

    // Find artifacts created in this state
    for (const artifact of m.artifacts || []) {
      const creatorAction = m.actions?.find(a => a.id === artifact.created_by);
      if (creatorAction?.allowed_in_states?.includes(state.id)) {
        lines.push(`  artifact "${artifact.name}" as ${artifact.id}_in_${state.id}`);
      }
    }

    lines.push('}');
  }
  lines.push('');

  // Connect states
  for (const fact of m.facts || []) {
    if (fact.from_state && fact.to_state && !fact.id.includes('error')) {
      lines.push(`${fact.from_state}_folder --> ${fact.to_state}_folder`);
    }
  }

  lines.push('');
  lines.push('@enduml');

  return lines.join('\n');
}
