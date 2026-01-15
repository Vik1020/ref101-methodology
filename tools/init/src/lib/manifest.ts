/**
 * Manifest utilities
 * Read/write .installed.yaml for tracking installed components
 */

import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';
import crypto from 'crypto';

const MANIFEST_FILENAME = '.installed.yaml';
const LEGACY_MANIFEST_FILENAME = 'manifest.yaml';

export function getManifestPath(projectRoot: string): string {
  return path.join(projectRoot, MANIFEST_FILENAME);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

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
  const newPath = path.join(projectRoot, MANIFEST_FILENAME);
  const legacyPath = path.join(projectRoot, LEGACY_MANIFEST_FILENAME);

  // Try new format first
  if (await fileExists(newPath)) {
    try {
      const content = await fs.readFile(newPath, 'utf-8');
      return YAML.parse(content) as Manifest;
    } catch {
      return null;
    }
  }

  // Try legacy format and auto-migrate
  if (await fileExists(legacyPath)) {
    try {
      const content = await fs.readFile(legacyPath, 'utf-8');
      const parsed = YAML.parse(content);

      // Check if it's a project manifest (not monorepo manifest)
      // Monorepo manifest has 'type: methodology-monorepo'
      if (parsed.methodology && parsed.bundle && !parsed.type) {
        // Auto-migrate: rename to new filename
        await fs.rename(legacyPath, newPath);
        console.log('Migrated manifest.yaml → .installed.yaml');
        return parsed as Manifest;
      }
    } catch {
      return null;
    }
  }

  return null;
}

export async function writeManifest(projectRoot: string, manifest: Manifest): Promise<void> {
  const manifestPath = path.join(projectRoot, MANIFEST_FILENAME);
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
    throw new Error('No .installed.yaml found');
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
    throw new Error('No .installed.yaml found');
  }

  if (manifest.processes[processName]) {
    manifest.processes[processName].checksum = newChecksum;
    manifest.processes[processName].version = newVersion;
  }

  await writeManifest(projectRoot, manifest);
}
