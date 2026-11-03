/** One native Workers Builds pipeline: develop builds Preview, main intentionally does nothing. */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
if (process.env.WORKERS_CI !== '1') throw Error('This command is for Workers Builds only. Use npm run build locally.');
const branch = process.env.WORKERS_CI_BRANCH;
if (branch === 'main') {
  console.log('Production build intentionally skipped. Production is not approved in P01.');
} else if (branch === 'develop') {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./preview.mjs', import.meta.url)), 'build'], { stdio: 'inherit', env: process.env });
  process.exitCode = result.status ?? 1;
} else throw Error('Only the approved develop branch may build a Preview.');
