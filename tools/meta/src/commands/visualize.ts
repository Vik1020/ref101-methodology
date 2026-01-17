import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import YAML from 'yaml';
import { getProjectRoot, namespaceExists, getAvailableNamespaces } from '../lib/parser.js';
import type { Methodology } from '../lib/types.js';

type DiagramFormat = 'mermaid' | 'plantuml' | 'drawio';
type DiagramType = 'state' | 'actors' | 'artifacts' | 'processes';
type DiagramLevel = 'overview' | 'detail' | 'full';

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
  validators?: string[];
  template?: string;
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
  level?: DiagramLevel;
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
  const level = options.level || 'full';

  if (format === 'mermaid') {
    output = generateMermaid(methodology, diagramType, namespace);
  } else if (format === 'plantuml') {
    output = generatePlantUML(methodology, diagramType);
  } else if (format === 'drawio') {
    output = generateDrawio(namespace, diagramType, level);
  } else {
    console.error(`Error: Unknown format '${format}'. Supported: mermaid, plantuml, drawio`);
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
    if (format === 'drawio') {
      console.log('Open with: https://app.diagrams.net/ or VS Code Draw.io extension');
    }
  } else {
    const formatNames: Record<DiagramFormat, string> = {
      mermaid: 'Mermaid',
      plantuml: 'PlantUML',
      drawio: 'Draw.io XML',
    };
    console.log(`\n--- ${formatNames[format]} Diagram (${diagramType}) ---\n`);
    console.log(output);
    console.log('\n--- End Diagram ---');
    if (format === 'mermaid') {
      console.log('\nTip: Copy to https://mermaid.live to visualize');
    } else if (format === 'plantuml') {
      console.log('\nTip: Copy to https://www.plantuml.com/plantuml to visualize');
    } else if (format === 'drawio') {
      console.log('\nTip: Save as .drawio file and open with https://app.diagrams.net/');
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

// ============== DRAW.IO GENERATORS ==============

// Layout constants
const DRAWIO_LAYOUT = {
  PHASE_WIDTH: 100,
  PHASE_HEIGHT: 50,
  PHASE_GAP: 50,
  SWIMLANE_PADDING: 20,
  SWIMLANE_HEADER: 30,
  SWIMLANE_GAP: 30,
  ERROR_OFFSET_Y: 80,
  VALIDATORS_OFFSET_Y: 40,
};

// Style definitions
const DRAWIO_STYLES = {
  initial: 'ellipse;whiteSpace=wrap;html=1;fillColor=#90EE90;strokeColor=#2d7f2d;fontColor=#000000;',
  working: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#333333;fontColor=#000000;',
  approval: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFD700;strokeColor=#B8860B;fontColor=#000000;',
  terminal: 'ellipse;whiteSpace=wrap;html=1;fillColor=#87CEEB;strokeColor=#4682B4;fontColor=#000000;',
  error: 'ellipse;whiteSpace=wrap;html=1;fillColor=#FA8072;strokeColor=#DC143C;fontColor=#000000;',
  transition: 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#333333;',
  errorTransition: 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;strokeColor=#DC143C;',
  swimlane: 'swimlane;startSize=30;whiteSpace=wrap;html=1;fillColor=#F5F5F5;strokeColor=#666666;fontStyle=1;',
  note: 'shape=note;whiteSpace=wrap;html=1;fillColor=#FFFFCC;strokeColor=#CCCC00;fontSize=10;align=left;',
  actionCard: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E8F4EA;strokeColor=#4A7C59;fontSize=9;align=left;verticalAlign=top;spacing=5;',
  legend: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFF9E6;strokeColor=#D4A017;fontSize=10;align=left;verticalAlign=top;spacing=8;',
};

interface DrawioCell {
  id: string;
  value: string;
  style: string;
  vertex?: boolean;
  edge?: boolean;
  parent: string;
  source?: string;
  target?: string;
  geometry: { x: number; y: number; width: number; height: number; relative?: boolean };
  link?: string;
}

interface DrawioPage {
  id: string;
  name: string;
  cells: DrawioCell[];
}

function generateDrawio(namespace: string, type: DiagramType, level: DiagramLevel): string {
  if (type !== 'processes') {
    return '<!-- Draw.io export currently only supports --type processes -->';
  }

  const pages: DrawioPage[] = [];

  // Load processes
  const processes = loadProcessDefinitions(namespace);
  if (processes.length === 0) {
    return `<!-- No processes found for namespace: ${namespace} -->`;
  }

  // Load methodology.yaml for detail pages
  const methodologyPath = join(getProjectRoot(), 'namespaces', namespace, 'methodology.yaml');
  let methodology: Methodology | null = null;
  if (existsSync(methodologyPath)) {
    const content = readFileSync(methodologyPath, 'utf-8');
    methodology = YAML.parse(content) as Methodology;
  }

  // Generate overview page
  if (level !== 'detail') {
    pages.push(generateDrawioOverviewPage(namespace, processes));
  }

  // Generate detail pages
  if (level !== 'overview') {
    for (const process of processes) {
      pages.push(generateDrawioDetailPage(process, methodology));
    }
  }

  return wrapDrawioFile(pages);
}

function loadProcessDefinitions(namespace: string): ProcessDefinition[] {
  const processesDir = join(getProjectRoot(), 'namespaces', namespace, 'processes');

  if (!existsSync(processesDir)) {
    return [];
  }

  const processFiles = readdirSync(processesDir).filter(f => f.endsWith('.json'));

  const processes: ProcessDefinition[] = processFiles
    .map(f => {
      const content = readFileSync(join(processesDir, f), 'utf-8');
      return JSON.parse(content) as ProcessDefinition;
    })
    .filter(p => p.process_id);

  // Sort by lifecycle order
  const order = PROCESS_ORDER[namespace] || processes.map(p => p.process_id);
  processes.sort((a, b) => {
    const aIdx = order.indexOf(a.process_id);
    const bIdx = order.indexOf(b.process_id);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  return processes;
}

function generateDrawioOverviewPage(namespace: string, processes: ProcessDefinition[]): DrawioPage {
  const cells: DrawioCell[] = [];
  let cellIdCounter = 2; // 0 and 1 are reserved for root cells
  let currentY = 20;

  for (let pIdx = 0; pIdx < processes.length; pIdx++) {
    const process = processes[pIdx];
    const mainPhases = process.phases.filter(p => p.type !== 'Error');
    const errorPhase = process.phases.find(p => p.type === 'Error');

    // Calculate swimlane dimensions
    const swimlaneWidth = (mainPhases.length * (DRAWIO_LAYOUT.PHASE_WIDTH + DRAWIO_LAYOUT.PHASE_GAP)) + DRAWIO_LAYOUT.SWIMLANE_PADDING * 2;
    const swimlaneHeight = DRAWIO_LAYOUT.SWIMLANE_HEADER + DRAWIO_LAYOUT.PHASE_HEIGHT + DRAWIO_LAYOUT.SWIMLANE_PADDING * 2 +
      (errorPhase ? DRAWIO_LAYOUT.ERROR_OFFSET_Y : 0);

    const swimlaneId = `swimlane_${pIdx}`;

    // Swimlane container with link to detail page
    cells.push({
      id: swimlaneId,
      value: `${pIdx + 1}. ${process.name}`,
      style: DRAWIO_STYLES.swimlane,
      vertex: true,
      parent: '1',
      geometry: { x: 20, y: currentY, width: swimlaneWidth, height: swimlaneHeight },
      link: `data:page/id,${process.process_id}`,
    });

    // Phase nodes
    const phaseNodes: Map<string, string> = new Map();
    let phaseX = DRAWIO_LAYOUT.SWIMLANE_PADDING;
    const phaseY = DRAWIO_LAYOUT.SWIMLANE_HEADER + DRAWIO_LAYOUT.SWIMLANE_PADDING;

    for (let i = 0; i < mainPhases.length; i++) {
      const phase = mainPhases[i];
      const nodeId = `node_${cellIdCounter++}`;
      phaseNodes.set(phase.id, nodeId);

      // Infer type from position if not specified
      const inferredType = phase.type || (i === 0 ? 'Initial' : i === mainPhases.length - 1 ? 'Terminal' : 'Working');
      const style = getDrawioPhaseStyle(inferredType, phase.approval?.required);

      cells.push({
        id: nodeId,
        value: phase.id,
        style: style,
        vertex: true,
        parent: swimlaneId,
        geometry: { x: phaseX, y: phaseY, width: DRAWIO_LAYOUT.PHASE_WIDTH, height: DRAWIO_LAYOUT.PHASE_HEIGHT },
      });

      phaseX += DRAWIO_LAYOUT.PHASE_WIDTH + DRAWIO_LAYOUT.PHASE_GAP;
    }

    // Error phase
    let errorNodeId: string | null = null;
    if (errorPhase) {
      errorNodeId = `node_${cellIdCounter++}`;
      phaseNodes.set(errorPhase.id, errorNodeId);

      const errorX = swimlaneWidth - DRAWIO_LAYOUT.SWIMLANE_PADDING - DRAWIO_LAYOUT.PHASE_WIDTH;
      const errorY = phaseY + DRAWIO_LAYOUT.ERROR_OFFSET_Y;

      cells.push({
        id: errorNodeId,
        value: errorPhase.id,
        style: DRAWIO_STYLES.error,
        vertex: true,
        parent: swimlaneId,
        geometry: { x: errorX, y: errorY, width: DRAWIO_LAYOUT.PHASE_WIDTH, height: DRAWIO_LAYOUT.PHASE_HEIGHT },
      });
    }

    // Transitions between main phases
    for (let i = 0; i < mainPhases.length - 1; i++) {
      const sourceId = phaseNodes.get(mainPhases[i].id)!;
      const targetId = phaseNodes.get(mainPhases[i + 1].id)!;
      const edgeId = `edge_${cellIdCounter++}`;

      cells.push({
        id: edgeId,
        value: '',
        style: DRAWIO_STYLES.transition,
        edge: true,
        parent: swimlaneId,
        source: sourceId,
        target: targetId,
        geometry: { x: 0, y: 0, width: 0, height: 0, relative: true },
      });
    }

    // Error transitions
    if (errorNodeId) {
      for (const phase of process.phases) {
        if (phase.on_failure && phaseNodes.has(phase.id)) {
          const sourceId = phaseNodes.get(phase.id)!;
          const edgeId = `edge_${cellIdCounter++}`;

          cells.push({
            id: edgeId,
            value: '',
            style: DRAWIO_STYLES.errorTransition,
            edge: true,
            parent: swimlaneId,
            source: sourceId,
            target: errorNodeId,
            geometry: { x: 0, y: 0, width: 0, height: 0, relative: true },
          });
        }
      }
    }

    currentY += swimlaneHeight + DRAWIO_LAYOUT.SWIMLANE_GAP;
  }

  return {
    id: 'overview',
    name: `Overview - ${namespace}`,
    cells,
  };
}

function generateDrawioDetailPage(process: ProcessDefinition, methodology: Methodology | null): DrawioPage {
  const cells: DrawioCell[] = [];
  let cellIdCounter = 2;

  const mainPhases = process.phases.filter(p => p.type !== 'Error');
  const errorPhase = process.phases.find(p => p.type === 'Error');

  // Build map of phase.id → actions from methodology
  type ActionType = NonNullable<Methodology['actions']>[0];
  const actionsForPhase = new Map<string, ActionType[]>();
  const usedActorIds = new Set<string>();
  const usedToolIds = new Set<string>();

  if (methodology?.actions) {
    for (const action of methodology.actions) {
      for (const stateId of action.allowed_in_states || []) {
        if (!actionsForPhase.has(stateId)) {
          actionsForPhase.set(stateId, []);
        }
        actionsForPhase.get(stateId)!.push(action);
      }
    }
  }

  // Phase nodes
  const phaseNodes: Map<string, string> = new Map();
  const phaseActions: Map<string, ActionType> = new Map(); // For fact lookup
  let phaseX = 50;
  const phaseY = 60;
  const ACTION_CARD_HEIGHT = 55;
  const PHASE_SPACING = DRAWIO_LAYOUT.PHASE_WIDTH + DRAWIO_LAYOUT.PHASE_GAP + 40;

  for (let i = 0; i < mainPhases.length; i++) {
    const phase = mainPhases[i];
    const nodeId = `node_${cellIdCounter++}`;
    phaseNodes.set(phase.id, nodeId);

    const inferredType = phase.type || (i === 0 ? 'Initial' : i === mainPhases.length - 1 ? 'Terminal' : 'Working');
    const style = getDrawioPhaseStyle(inferredType, phase.approval?.required);

    cells.push({
      id: nodeId,
      value: phase.id,
      style: style,
      vertex: true,
      parent: '1',
      geometry: { x: phaseX, y: phaseY, width: DRAWIO_LAYOUT.PHASE_WIDTH, height: DRAWIO_LAYOUT.PHASE_HEIGHT },
    });

    // Add approval annotation above phase
    if (phase.approval?.required) {
      const approvalId = `approval_${cellIdCounter++}`;
      cells.push({
        id: approvalId,
        value: `Approval: ${phase.approval.role}`,
        style: 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=9;fontColor=#B8860B;',
        vertex: true,
        parent: '1',
        geometry: { x: phaseX, y: phaseY - 18, width: DRAWIO_LAYOUT.PHASE_WIDTH, height: 15 },
      });
    }

    // Add Action card below phase (if methodology has actions for this phase)
    const actions = actionsForPhase.get(phase.id) || [];
    if (actions.length > 0 && methodology) {
      const action = actions[0];
      phaseActions.set(phase.id, action);

      const actor = methodology.actors?.find(a => a.id === action.actor);
      const tool = methodology.tools?.find(t => t.id === action.tool);

      if (actor) usedActorIds.add(actor.id);
      if (tool) usedToolIds.add(tool.id);

      const actorIcon = actor?.type === 'AI' ? '🤖' : actor?.type === 'Human' ? '👤' : '⚙️';
      const cardContent = `<b>${action.name || action.id}</b>&lt;br/&gt;${actorIcon} ${actor?.name || action.actor}&lt;br/&gt;🔧 ${tool?.name || action.tool}`;

      cells.push({
        id: `action_${cellIdCounter++}`,
        value: cardContent,
        style: DRAWIO_STYLES.actionCard,
        vertex: true,
        parent: '1',
        geometry: {
          x: phaseX - 10,
          y: phaseY + DRAWIO_LAYOUT.PHASE_HEIGHT + 12,
          width: DRAWIO_LAYOUT.PHASE_WIDTH + 20,
          height: ACTION_CARD_HEIGHT,
        },
      });
    } else if (phase.validators && phase.validators.length > 0) {
      // Fallback: show validators if no actions
      const noteId = `note_${cellIdCounter++}`;
      const validatorsText = phase.validators.slice(0, 3).join('\\n');

      cells.push({
        id: noteId,
        value: validatorsText,
        style: DRAWIO_STYLES.note,
        vertex: true,
        parent: '1',
        geometry: {
          x: phaseX - 10,
          y: phaseY + DRAWIO_LAYOUT.PHASE_HEIGHT + 12,
          width: DRAWIO_LAYOUT.PHASE_WIDTH + 20,
          height: 15 + Math.min(phase.validators.length, 3) * 12,
        },
      });
    }

    phaseX += PHASE_SPACING;
  }

  // Error phase
  let errorNodeId: string | null = null;
  if (errorPhase) {
    errorNodeId = `node_${cellIdCounter++}`;
    phaseNodes.set(errorPhase.id, errorNodeId);

    const errorX = phaseX - PHASE_SPACING;
    const errorY = phaseY + DRAWIO_LAYOUT.ERROR_OFFSET_Y + ACTION_CARD_HEIGHT + 20;

    cells.push({
      id: errorNodeId,
      value: errorPhase.id,
      style: DRAWIO_STYLES.error,
      vertex: true,
      parent: '1',
      geometry: { x: errorX, y: errorY, width: DRAWIO_LAYOUT.PHASE_WIDTH, height: DRAWIO_LAYOUT.PHASE_HEIGHT },
    });
  }

  // Transitions between main phases with Fact labels
  for (let i = 0; i < mainPhases.length - 1; i++) {
    const sourceId = phaseNodes.get(mainPhases[i].id)!;
    const targetId = phaseNodes.get(mainPhases[i + 1].id)!;
    const edgeId = `edge_${cellIdCounter++}`;

    // Find fact name from action output
    let factLabel = '';
    const action = phaseActions.get(mainPhases[i].id);
    if (action?.output && typeof action.output === 'object' && action.output.fact && methodology?.facts) {
      const factId = action.output.fact;
      const fact = methodology.facts.find(f => f.id === factId);
      factLabel = fact?.name || factId;
    }

    cells.push({
      id: edgeId,
      value: factLabel,
      style: DRAWIO_STYLES.transition,
      edge: true,
      parent: '1',
      source: sourceId,
      target: targetId,
      geometry: { x: 0, y: 0, width: 0, height: 0, relative: true },
    });
  }

  // Error transitions
  if (errorNodeId) {
    for (const phase of process.phases) {
      if (phase.on_failure && phaseNodes.has(phase.id)) {
        const sourceId = phaseNodes.get(phase.id)!;
        const edgeId = `edge_${cellIdCounter++}`;

        cells.push({
          id: edgeId,
          value: 'on_failure',
          style: DRAWIO_STYLES.errorTransition,
          edge: true,
          parent: '1',
          source: sourceId,
          target: errorNodeId,
          geometry: { x: 0, y: 0, width: 0, height: 0, relative: true },
        });
      }
    }
  }

  // Title
  cells.push({
    id: `title_${cellIdCounter++}`,
    value: `<b>${process.name}</b>`,
    style: 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=16;',
    vertex: true,
    parent: '1',
    geometry: { x: 50, y: 10, width: 400, height: 30 },
  });

  // Legend at bottom
  if (methodology && (usedActorIds.size > 0 || usedToolIds.size > 0)) {
    const actors = methodology.actors?.filter(a => usedActorIds.has(a.id)) || [];
    const tools = methodology.tools?.filter(t => usedToolIds.has(t.id)) || [];

    const actorLine = actors.map(a => `${a.type === 'AI' ? '🤖' : '👤'} ${a.name}`).join(', ');
    const toolLine = tools.map(t => `🔧 ${t.name}`).join(', ');

    const legendY = phaseY + DRAWIO_LAYOUT.PHASE_HEIGHT + ACTION_CARD_HEIGHT + (errorPhase ? DRAWIO_LAYOUT.ERROR_OFFSET_Y + 80 : 40);
    const legendContent = `<b>Actors:</b> ${actorLine}&lt;br/&gt;<b>Tools:</b> ${toolLine}`;

    cells.push({
      id: `legend_${cellIdCounter++}`,
      value: legendContent,
      style: DRAWIO_STYLES.legend,
      vertex: true,
      parent: '1',
      geometry: { x: 50, y: legendY, width: Math.max(400, phaseX - 100), height: 45 },
    });
  }

  return {
    id: process.process_id,
    name: process.name,
    cells,
  };
}

function getDrawioPhaseStyle(type: string, hasApproval?: boolean): string {
  if (hasApproval) return DRAWIO_STYLES.approval;

  switch (type) {
    case 'Initial':
      return DRAWIO_STYLES.initial;
    case 'Terminal':
      return DRAWIO_STYLES.terminal;
    case 'Error':
      return DRAWIO_STYLES.error;
    default:
      return DRAWIO_STYLES.working;
  }
}

function cellToXml(cell: DrawioCell): string {
  const attrs: string[] = [
    `id="${cell.id}"`,
    `value="${escapeXml(cell.value)}"`,
    `style="${cell.style}"`,
  ];

  if (cell.vertex) attrs.push('vertex="1"');
  if (cell.edge) attrs.push('edge="1"');
  attrs.push(`parent="${cell.parent}"`);
  if (cell.source) attrs.push(`source="${cell.source}"`);
  if (cell.target) attrs.push(`target="${cell.target}"`);

  const geo = cell.geometry;
  const geoAttrs = cell.geometry.relative
    ? 'relative="1"'
    : `x="${geo.x}" y="${geo.y}" width="${geo.width}" height="${geo.height}"`;

  let linkAttr = '';
  if (cell.link) {
    linkAttr = ` link="${escapeXml(cell.link)}"`;
  }

  return `        <mxCell ${attrs.join(' ')}${linkAttr}>
          <mxGeometry ${geoAttrs} as="geometry"/>
        </mxCell>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapDrawioFile(pages: DrawioPage[]): string {
  const diagrams = pages.map(page => {
    const cellsXml = page.cells.map(cellToXml).join('\n');
    return `  <diagram name="${escapeXml(page.name)}" id="${page.id}">
    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
${cellsXml}
      </root>
    </mxGraphModel>
  </diagram>`;
  });

  return `<mxfile host="ref101-meta" modified="${new Date().toISOString()}" version="1.0" type="device">
${diagrams.join('\n')}
</mxfile>`;
}
