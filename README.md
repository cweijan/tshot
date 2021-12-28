# tshot

## Install

```bash
npm i -D tshot
```

## Usage

**Run a script: (for development)**

```
tshot your-script.ts
```

This will also watch all the files imported by `your-script.ts` and re-run it on changes.

Note that this command will emit temporary files to `./build` folder, it's recommended to add it to your `.gitignore` file.

**Build a script: (for production)**

```
tshot build your-scripts.ts
```

This command will emit bundled script to `./dist` folder with a filename matching the original filename. i.e. here you will get `./dist/your-script.js`.

你可以通过在项目根目录创建esbuild.json来覆盖esbuild的设置, 内容例子

```json
{
    "outdir":"dist"
}
```

## Externals

`dependencies` and `peerDependencies` are automatically excluded from the bundled scripts.

## License

MIT &copy; [EGOIST](https://github.com/sponsors/egoist)
