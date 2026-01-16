// Meta-methodology types based on the 8 elements

export type StateType = 'Initial' | 'Working' | 'Waiting' | 'Terminal' | 'Error';
export type ActorType = 'Human' | 'AI' | 'System';
export type ToolType = 'API' | 'UI' | 'LLM' | 'Script' | 'Manual' | 'MCP';
export type RuleType = 'Precondition' | 'Postcondition' | 'Guard' | 'Invariant' | 'Constraint';
export type ViolationAction = 'Block' | 'Redirect' | 'Compensate' | 'Alert' | 'Retry';

export interface State {
  id: string;
  name: string;
  type: StateType;
  allowed_actions?: string[];
  entry_conditions?: string[];
  exit_conditions?: string[];
  timeout?: string;
  on_timeout?: {
    action?: string;
    target_state?: string;
  };
}

export interface Actor {
  id: string;
  name: string;
  type: ActorType;
  tools?: string[];
  permissions?: string[];
}

export interface Tool {
  id: string;
  name: string;
  type: ToolType;
  compatible_actors?: ActorType[];
  operations?: string[];
}

export interface Action {
  id: string;
  name: string;
  actor?: string;
  tool?: string;
  allowed_in_states?: string[];
  input?: string;
  output?: string | { fact?: string; artifact?: string };
  retry?: {
    max_attempts?: number;
    delay?: 'fixed' | 'exponential';
    on_exhausted?: string;
  };
}

export interface Entity {
  id: string;
  type: string;
  role?: 'primary' | 'secondary';
  schema?: Record<string, unknown>;
  artifacts?: string[];
}

export interface Artifact {
  id: string;
  name: string;
  type: string;
  template?: string;
  created_by?: string;
  entity_id?: string;
}

export interface Fact {
  id: string;
  name: string;
  from_state?: string;
  to_state?: string;
  triggered_by?: string;
  requires?: string[];
}

export interface Rule {
  id: string;
  name: string;
  type: RuleType;
  condition?: string;
  scope?: string;
  on_violation?: ViolationAction;
  redirect_to?: string;
}

export interface Process {
  id: string;
  description?: string;
  states_sequence: string[];
  approval_points?: string[];
  skip_allowed?: string[];
}

export interface Methodology {
  methodology_id: string;
  version: string;
  name: string;
  meta_version?: string;
  description?: string;
  entities?: Entity[];
  states: State[];
  actors: Actor[];
  tools?: Tool[];
  actions: Action[];
  artifacts?: Artifact[];
  facts: Fact[];
  rules?: Rule[];
  processes?: Process[];
}

// SCCU-specific types for parsing

export interface SCCUPhase {
  id: string;
  template?: string;
  validators?: string[];
  approval?: {
    required: boolean;
    role: string;
  };
  skip_allowed: boolean;
}

export interface SCCUProcess {
  process_id: string;
  version: string;
  name: string;
  description: string;
  type: string;
  phases: SCCUPhase[];
  nodes?: Record<string, string>;
}

export interface SCCUSkillFrontmatter {
  name: string;
  description: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
