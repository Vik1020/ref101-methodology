import type {
  State,
  StateType,
  Actor,
  Tool,
  Action,
  Artifact,
  Fact,
  Rule,
  RuleType,
  Process,
  Methodology,
  SCCUProcess,
  SCCUPhase,
} from './types.js';

// Phase ID to State type mapping
const PHASE_TO_STATE_TYPE: Record<string, StateType> = {
  'RELEASE': 'Initial',
  'BC_delta': 'Working',
  'BC_DELTA': 'Working',
  'AC_delta': 'Working',
  'AC_DELTA': 'Working',
  'PLAN_FINALIZE': 'Working',
  'PC': 'Working',
  'PC_DEVELOPMENT': 'Working',
  'IC': 'Working',
  'IC_VALIDATION': 'Working',
  'QA': 'Waiting',  // Requires approval
  'QA_TESTING': 'Waiting',
  'APPLY_DELTAS': 'Working',
  'DEPLOY': 'Terminal',
  'DEPLOYED': 'Terminal',
};

// Validator pattern to Rule type mapping
const VALIDATOR_TO_RULE_TYPE: Record<string, RuleType> = {
  'has_': 'Precondition',
  'valid_schema': 'Invariant',
  'based_on_': 'Precondition',
  'passed': 'Postcondition',
  'coverage': 'Constraint',
  'no_p0': 'Invariant',
  'validated': 'Postcondition',
  'estimated': 'Precondition',
};

function inferRuleType(validatorId: string): RuleType {
  for (const [pattern, ruleType] of Object.entries(VALIDATOR_TO_RULE_TYPE)) {
    if (validatorId.includes(pattern)) {
      return ruleType;
    }
  }
  return 'Precondition'; // default
}

export function mapPhaseToState(phase: SCCUPhase, index: number, totalPhases: number): State {
  const stateType = PHASE_TO_STATE_TYPE[phase.id] ||
    (index === 0 ? 'Initial' : index === totalPhases - 1 ? 'Terminal' : 'Working');

  // States with approval are Waiting states
  const actualType: StateType = phase.approval?.required ? 'Waiting' : stateType;

  return {
    id: phase.id.toUpperCase().replace(/[-_]DELTA$/i, '_DELTA'),
    name: formatPhaseName(phase.id),
    type: actualType,
    allowed_actions: [`create_${phase.id.toLowerCase()}`],
    timeout: actualType === 'Waiting' ? '24h' : undefined,
  };
}

function formatPhaseName(phaseId: string): string {
  return phaseId
    .replace(/_/g, ' ')
    .replace(/delta/gi, 'Delta')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function mapValidatorToRule(validator: string, phaseId: string): Rule {
  const ruleType = inferRuleType(validator);

  return {
    id: validator,
    name: formatValidatorName(validator),
    type: ruleType,
    condition: `validator("${validator}") == true`,
    scope: `state(${phaseId.toUpperCase()})`,
    on_violation: 'Block',
  };
}

function formatValidatorName(validator: string): string {
  return validator
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function mapApprovalToActor(role: string): Actor {
  const roleToActor: Record<string, { id: string; name: string }> = {
    'product_owner': { id: 'product_owner', name: 'Product Owner' },
    'tech_lead': { id: 'tech_lead', name: 'Technical Lead' },
    'team': { id: 'team', name: 'Development Team' },
    'qa_lead': { id: 'qa_lead', name: 'QA Lead' },
  };

  const actorInfo = roleToActor[role] || { id: role, name: role };

  return {
    id: actorInfo.id,
    name: actorInfo.name,
    type: 'Human',
    tools: ['approval_ui'],
    permissions: [`approve_${role}`],
  };
}

export function mapProcessToMethodology(
  processes: SCCUProcess[],
  namespace: string
): Methodology {
  const allPhases = new Map<string, SCCUPhase>();
  const allValidators = new Set<string>();
  const approvalRoles = new Set<string>();

  // Collect all unique phases and validators
  for (const process of processes) {
    for (const phase of process.phases) {
      if (!allPhases.has(phase.id)) {
        allPhases.set(phase.id, phase);
      }
      if (phase.validators) {
        phase.validators.forEach(v => allValidators.add(`${phase.id}:${v}`));
      }
      if (phase.approval?.role) {
        approvalRoles.add(phase.approval.role);
      }
    }
  }

  // Convert phases to states
  const phasesArray = Array.from(allPhases.values());
  const states: State[] = phasesArray.map((phase, i) =>
    mapPhaseToState(phase, i, phasesArray.length)
  );

  // Generate facts for transitions
  const facts: Fact[] = [];
  for (const process of processes) {
    for (let i = 0; i < process.phases.length - 1; i++) {
      const fromPhase = process.phases[i];
      const toPhase = process.phases[i + 1];
      const factId = `${fromPhase.id.toLowerCase()}_completed`;

      if (!facts.find(f => f.id === factId)) {
        facts.push({
          id: factId,
          name: `${formatPhaseName(fromPhase.id)} Completed`,
          from_state: fromPhase.id.toUpperCase(),
          to_state: toPhase.id.toUpperCase(),
          triggered_by: `complete_${fromPhase.id.toLowerCase()}`,
        });
      }
    }
  }

  // Generate rules from validators
  const rules: Rule[] = [];
  for (const validatorKey of allValidators) {
    const [phaseId, validator] = validatorKey.split(':');
    rules.push(mapValidatorToRule(validator, phaseId));
  }

  // Generate actors
  const actors: Actor[] = [
    {
      id: 'claude_agent',
      name: 'Claude Code Agent',
      type: 'AI',
      tools: ['mcp_pcc', 'edit', 'bash'],
      permissions: ['create_artifact', 'transition_phase', 'read_code', 'write_code'],
    },
  ];

  for (const role of approvalRoles) {
    actors.push(mapApprovalToActor(role));
  }

  // Generate tools
  const tools: Tool[] = [
    {
      id: 'mcp_pcc',
      name: 'PCC MCP Server',
      type: 'MCP',
      compatible_actors: ['AI'],
      operations: ['pcc_init_release', 'pcc_create_artifact', 'pcc_workflow_transition', 'pcc_workflow_status'],
    },
    {
      id: 'edit',
      name: 'File Editor',
      type: 'Script',
      compatible_actors: ['AI'],
      operations: ['read', 'write', 'edit'],
    },
    {
      id: 'bash',
      name: 'Bash Shell',
      type: 'Script',
      compatible_actors: ['AI', 'System'],
      operations: ['execute_command', 'git_operations'],
    },
    {
      id: 'approval_ui',
      name: 'Approval Interface',
      type: 'UI',
      compatible_actors: ['Human'],
      operations: ['approve', 'reject', 'request_changes'],
    },
  ];

  // Generate actions
  const actions: Action[] = [];
  for (const phase of phasesArray) {
    // Create action
    actions.push({
      id: `create_${phase.id.toLowerCase()}`,
      name: `Create ${formatPhaseName(phase.id)}`,
      actor: 'claude_agent',
      tool: 'mcp_pcc',
      allowed_in_states: [phase.id.toUpperCase()],
      output: { artifact: `${phase.id.toLowerCase()}_artifact` },
    });

    // If has approval, add approve action
    if (phase.approval?.required) {
      actions.push({
        id: `approve_${phase.id.toLowerCase()}`,
        name: `Approve ${formatPhaseName(phase.id)}`,
        actor: phase.approval.role,
        tool: 'approval_ui',
        allowed_in_states: [phase.id.toUpperCase()],
        output: { fact: `${phase.id.toLowerCase()}_approved` },
      });

      // Add approval fact
      const existingFact = facts.find(f => f.id === `${phase.id.toLowerCase()}_completed`);
      if (existingFact) {
        facts.push({
          id: `${phase.id.toLowerCase()}_approved`,
          name: `${formatPhaseName(phase.id)} Approved`,
          from_state: phase.id.toUpperCase(),
          to_state: existingFact.to_state,
          triggered_by: `approve_${phase.id.toLowerCase()}`,
          requires: [`${phase.id.toLowerCase()}_completed`],
        });
      }
    }
  }

  // Generate artifacts
  const artifacts: Artifact[] = phasesArray
    .filter(p => p.template)
    .map(phase => ({
      id: `${phase.id.toLowerCase()}_artifact`,
      name: phase.template!.replace('_TEMPLATE', ''),
      type: 'markdown',
      template: `templates/phases/${phase.template}`,
      created_by: `create_${phase.id.toLowerCase()}`,
    }));

  // Generate processes
  const processDefinitions: Process[] = processes.map(p => ({
    id: p.process_id,
    description: p.description,
    states_sequence: p.phases.map(ph => ph.id.toUpperCase()),
    approval_points: p.phases
      .filter(ph => ph.approval?.required)
      .map(ph => ph.id.toUpperCase()),
    skip_allowed: p.phases
      .filter(ph => ph.skip_allowed)
      .map(ph => ph.id.toUpperCase()),
  }));

  return {
    methodology_id: namespace,
    version: '2.0.0',
    name: getNamespaceName(namespace),
    meta_version: '3.1',
    description: `Methodology extracted from ${namespace} namespace`,
    entities: [
      {
        id: 'release',
        type: 'Release',
        role: 'primary',
        schema: {
          version: 'string (required)',
          feature_name: 'string (required)',
          problem_statement: 'string (required)',
          current_phase: 'string',
        },
        artifacts: artifacts.map(a => a.id),
      },
    ],
    states,
    actors,
    tools,
    actions,
    artifacts,
    facts,
    rules,
    processes: processDefinitions,
  };
}

function getNamespaceName(namespace: string): string {
  const names: Record<string, string> = {
    'sccu': 'Self-Contained Context Unit',
    'node-hub': 'Node Hub',
  };
  return names[namespace] || namespace;
}
