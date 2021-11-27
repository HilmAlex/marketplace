#!/usr/bin/env node
const cmd = 'npm i -g nx && npm i && nx run rest-api:deploy && nx run client:deploy  && cd ../ && docker-compose up --scale rest-api=5';
const spawn = require('child_process').spawn;
const path = require('path');

(async () => {
  console.log("\x1b[32m",'Deploying...\n');
  const invocations = [
    ['npm', 'i', '-g', 'nx'],
    ['npm', 'i'],
    ['nx', 'run', 'rest-api:deploy'],
    ['nx', 'run', 'client:deploy'],
    ['cd', path.join(__dirname, '../')],
    ['docker-compose', 'up', '--scale', 'rest-api=5']
  ];
  for (const [program, ...args] of invocations) {
    console.log("\x1b[32m",`EXECUTING: ${program} ${args.join(' ')}`);
    await spawnAsync(program, args, {
      stdio: 'inherit',
    });
  }
})();

async function spawnAsync(program, args, options) {
  options = (Array.isArray(args) ? options : args) || {};
  args = Array.isArray(args) ? args : [];
  const code = await new Promise((resolve, reject) => {
    const cp = spawn(program, args, options);
    cp.on('error', ex => reject(ex));
    cp.on('close', code => resolve(code));
  });
  if (code !== 0) {
    throw new Error(`${program}${args.length ? ` ${JSON.stringify(args)}` : ''} exited with non-zero code ${code}.`);
  }
}
