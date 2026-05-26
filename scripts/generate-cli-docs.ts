#!/usr/bin/env node

import { program } from '../src/index.ts'

function walk(cmd: any, level = 1) {
  const indent = '#'.repeat(level) + '##';

  let md = `${indent} ${cmd.name()} ${cmd.usage()}\n\n`
  md += `${cmd.description() || ''}\n\n`

  for (const opt of cmd.options) {
    md += `- \`${opt.flags}\` — ${opt.description || ''}\n`
  }

  md += '\n'

  for (const sub of cmd.commands) {
    md += walk(sub, level + 1)
  }

  return md
}

let md = `## CLI Reference\n\n`

for (const cmd of program.commands) {
  md += walk(cmd)
}

console.log(md);
