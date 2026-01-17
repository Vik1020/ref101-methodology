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
  // Spec 4.3: input/output schemas
  input_schema?: Record<string, string>;
  output_schema?: Record<string, string>;
  // Spec 7.5: Circuit breaker for external tools
  circuit_breaker?: {
    failure_threshold: number;
    timeout: string;
    half_open_after: string;
  };
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
  // Spec 4.5: Instance-level fields
  current_state?: string;  // Entity always in exactly one State
  history?: string[];      // Append-only fact_ids
  version?: string;        // Entity version (separate from artifacts)
}

export interface Artifact {
  id: string;
  name: string;
  type: string;
  template?: string;
  created_by?: string;
  entity_id?: string;
  // Spec 4.6: Versioning independent of Entity
  version?: string;
}

export interface Fact {
  id: string;
  name: string;  // Must be past tense per Spec 4.7
  from_state?: string;
  to_state?: string;
  triggered_by?: string;  // Spec: caused_by
  requires?: string[];
  // Spec 4.7: Runtime attributes (populated at execution)
  timestamp?: string;     // datetime when fact occurred
  actor?: string;         // actor_id who triggered
  entity_id?: string;     // which Entity affected
  payload?: Record<string, unknown>;  // additional event data
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

// Approval point configuration
export interface ApprovalPoint {
  role: string;
  note?: string;
}

// Phase defaults for SSOT generation
export interface PhaseDefault {
  template?: string;
  validators?: string[];
  approval_role?: string;
  skip_allowed?: boolean;
}

// Process definition (extended for SSOT)
export interface Process {
  id: string;
  version?: string;
  name?: string;
  type?: string;  // feature_development | bugfix | etc.
  description?: string;
  states_sequence: string[];

  // Can be string[] (legacy) or Record (SSOT)
  approval_points?: string[] | Record<string, ApprovalPoint>;

  // Per-process phase overrides
  phase_overrides?: Record<string, Partial<PhaseDefault>>;

  // Node dependencies
  nodes?: Record<string, string>;

  // Legacy field
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

  // SSOT: Phase defaults for process generation
  phase_defaults?: Record<string, PhaseDefault>;

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
