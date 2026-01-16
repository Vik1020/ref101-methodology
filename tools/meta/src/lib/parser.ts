import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { SCCUProcess, SCCUSkillFrontmatter } from './types.js';

export function getProjectRoot(): string {
  // Find project root by looking for manifest.yaml
  let current = process.cwd();
  while (current !== '/') {
    if (existsSync(join(current, 'manifest.yaml'))) {
      return current;
    }
    current = resolve(current, '..');
  }
  // Fallback: assume we're running from tools/meta
  return resolve(process.cwd(), '..', '..');
}

export function getNamespacePath(namespace: string): string {
  return join(getProjectRoot(), 'namespaces', namespace);
}

export function parseProcesses(namespace: string): SCCUProcess[] {
  const processesDir = join(getNamespacePath(namespace), 'processes');

  if (!existsSync(processesDir)) {
    console.warn(`Warning: Processes directory not found: ${processesDir}`);
    return [];
  }

  const files = readdirSync(processesDir)
    .filter(f => f.endsWith('.json'))
    .filter(f => !f.includes('.schema.')); // Skip schema files
  const processes: SCCUProcess[] = [];

  for (const file of files) {
    try {
      const content = readFileSync(join(processesDir, file), 'utf-8');
      const process = JSON.parse(content) as SCCUProcess;

      // Validate it's actually a process (has process_id and phases)
      if (process.process_id && Array.isArray(process.phases)) {
        processes.push(process);
      } else {
        console.warn(`Warning: Skipping ${file} - not a valid process definition`);
      }
    } catch (error) {
      console.warn(`Warning: Failed to parse process ${file}:`, error);
    }
  }

  return processes;
}

export function parseSkills(namespace: string): SCCUSkillFrontmatter[] {
  const skillsDir = join(getNamespacePath(namespace), 'skills');

  if (!existsSync(skillsDir)) {
    console.warn(`Warning: Skills directory not found: ${skillsDir}`);
    return [];
  }

  const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const skills: SCCUSkillFrontmatter[] = [];

  for (const dir of skillDirs) {
    const skillFile = join(skillsDir, dir, 'SKILL.md');

    if (!existsSync(skillFile)) {
      continue;
    }

    try {
      const content = readFileSync(skillFile, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      if (frontmatter) {
        skills.push(frontmatter);
      }
    } catch (error) {
      console.warn(`Warning: Failed to parse skill ${dir}:`, error);
    }
  }

  return skills;
}

function extractFrontmatter(content: string): SCCUSkillFrontmatter | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const lines = match[1].split('\n');
  const result: Record<string, string> = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      result[key] = value;
    }
  }

  if (result.name && result.description) {
    return {
      name: result.name,
      description: result.description,
    };
  }

  return null;
}

export function getAvailableNamespaces(): string[] {
  const namespacesDir = join(getProjectRoot(), 'namespaces');

  if (!existsSync(namespacesDir)) {
    return [];
  }

  return readdirSync(namespacesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

export function namespaceExists(namespace: string): boolean {
  const path = getNamespacePath(namespace);
  return existsSync(path);
}
