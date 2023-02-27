#!/usr/bin/env node
import { cac } from 'cac'
import { version } from '../package.json'

const cli = cac('tshot')

cli.command('[file]', 'Run a file').action(async (file) => {
  if (!file) return cli.outputHelp()

  const { run } = await import('./')
  await run(file)
})

cli.command('build [file]', 'Build a file').action(async (file) => {
  if (!file) return cli.outputHelp()

  const { build } = await import('./')
  await build(file, 'dist')
})

cli
  .option('--color', 'Force using color.')
  .option('--single', 'Single mode, not watch files.')
  .option('--noDependencies', "Don't including dependencies.")
  .version(version)
  .help()
  .parse()
