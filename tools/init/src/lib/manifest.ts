/**
 * Manifest utilities
 * Read/write manifest.yaml for tracking installed components
 */

import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';
import crypto from 'crypto';

export interface SkillEntry {
  version: string;
  checksum: string;
  modified: boolean;
  source_path: string;
}

export interface ProcessEntry {
  version: string;
  checksum: string;
}

export interface Manifest {
  version: string;
  methodology: string;
  bundle: string;
  initialized_at: string;
  methodology_version: string;
  methodology_path?: string;
  pcc_path?: string;
  skills: Record<string, SkillEntry>;
  processes: Record<string, ProcessEntry>;
}

export async function readManifest(projectRoot: string): Promise<Manifest | null> {
  const manifestPath = path.join(projectRoot, 'manifest.yaml');
  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    return YAML.parse(content) as Manifest;
  } catch {
    return null;
  }
}

export async function writeManifest(projectRoot: string, manifest: Manifest): Promise<void> {
  const manifestPath = path.join(projectRoot, 'manifest.yaml');
  const content = YAML.stringify(manifest, { lineWidth: 0 });
  await fs.writeFile(manifestPath, content, 'utf-8');
}

export async function calculateChecksum(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return `sha256:${hash.substring(0, 12)}`;
}

export async function calculateDirChecksum(dirPath: string): Promise<string> {
  const files = await fs.readdir(dirPath, { recursive: true });
  const hash = crypto.createHash('sha256');

  for (const file of files.sort()) {
    const filePath = path.join(dirPath, file as string);
    const stat = await fs.stat(filePath);
    if (stat.isFile()) {
      const content = await fs.readFile(filePath);
      hash.update(content);
    }
  }

  return `sha256:${hash.digest('hex').substring(0, 12)}`;
}

export function createEmptyManifest(methodology: string, bundle: string, version: string): Manifest {
  return {
    version: '1.0.0',
    methodology,
    bundle,
    initialized_at: new Date().toISOString(),
    methodology_version: version,
    skills: {},
    processes: {},
  };
}

export async function updateSkillInManifest(
  projectRoot: string,
  skillName: string,
  newChecksum: string,
  newVersion: string
): Promise<void> {
  const manifest = await readManifest(projectRoot);
  if (!manifest) {
    throw new Error('No manifest.yaml found');
  }

  if (manifest.skills[skillName]) {
    manifest.skills[skillName].checksum = newChecksum;
    manifest.skills[skillName].version = newVersion;
    manifest.skills[skillName].modified = false;
  }

  await writeManifest(projectRoot, manifest);
}

export async function updateProcessInManifest(
  projectRoot: string,
  processName: string,
  newChecksum: string,
  newVersion: string
): Promise<void> {
  const manifest = await readManifest(projectRoot);
  if (!manifest) {
    throw new Error('No manifest.yaml found');
  }

  if (manifest.processes[processName]) {
    manifest.processes[processName].checksum = newChecksum;
    manifest.processes[processName].version = newVersion;
  }

  await writeManifest(projectRoot, manifest);
}
