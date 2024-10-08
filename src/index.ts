import path from 'path'
import fs from 'fs'
import { build as esbuild, PluginBuild } from 'esbuild'
import spawn from 'cross-spawn'
import { watch } from 'chokidar'
import kill from 'tree-kill'
const color = process.argv.includes('--color');
const isSingle = process.argv.includes('--single');
const noDependencies = process.argv.includes('----no-dependencies');

const esbuildConfig = (() => {
  return fs.existsSync("./esbuild.json") ? JSON.parse(fs.readFileSync(path.resolve('esbuild.json'), 'utf-8')) : {}
})();

const externals = (() => {
  try {
    return Object.keys(JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8')).dependencies || {});
  } catch (error) {
    return []
  }
})()

const killProcess = ({ pid, signal = 'SIGTERM', }: { pid: number, signal?: string | number }) =>
  new Promise<unknown>((resolve) => {
    kill(pid, signal, resolve)
  })

export const build = async (file: string, outDir: string) => {
  const result = await esbuild({
    entryPoints: [file],
    format: 'cjs',
    bundle: true,
    sourcemap: true,
    outdir: outDir,
    platform: 'node',
    metafile: true,
    write: false,
    target: `node${process.version.slice(1)}`,
    plugins: noDependencies ? [
      {
        name: 'externalize-deps',
        setup(build: PluginBuild) {
          build.onResolve({ filter: /.+/ }, (args) => {
            if (externals.some((external) => args.path === external || args.path.startsWith(`${external}/`),)) {
              return {
                path: args.path,
                external: true,
              }
            }
          })
        },
      },
    ] : [],
    ...esbuildConfig,
  })
  let buildFile: any;
  if (result.outputFiles) {
    for (const output of result.outputFiles) {
      if (!output.path.match(/\.map$/)) buildFile = output;
      fs.mkdirSync(path.dirname(output.path), { recursive: true })
      fs.writeFileSync(output.path, output.text, 'utf8')
    }
  }
  return {
    get watchFiles() {
      return new Set(Object.keys(result.metafile?.inputs || {}))
    },
    filepath: buildFile.path,
  }
}

export const run = async (file: string, singleMode: boolean = isSingle) => {
  let { watchFiles, filepath } = await build(file, 'build')

  const startCommand = () => {
    const cmd = spawn('node', [filepath], {
      env: {
        FORCE_COLOR: color ? '1' : undefined,
        NPM_CONFIG_COLOR: color ? 'always' : undefined,
        ...process.env,
      },
      stdio: 'pipe',
    })
    cmd.stdout?.pipe(process.stdout)
    cmd.stderr?.pipe(process.stderr)
    cmd.stdin?.pipe(process.stdin)
    return cmd
  }

  let cmd = startCommand()

  if (singleMode) { return; }

  watch('.', {
    ignored: '**/{node_modules,dist,build,.git}/**',
    ignoreInitial: true,
    ignorePermissionErrors: true,
    cwd: process.cwd(),
  }).on('all', async (event, filepath) => {
    if (process.platform == 'win32') {
      filepath = filepath.replace(/\\/g, '/')
    }
    if (watchFiles.has(filepath)) {
      await killProcess({ pid: cmd.pid as number })
      const result = await build(file, 'build')
      watchFiles = result.watchFiles
      filepath = result.filepath
      cmd = startCommand()
    }
  })
}
