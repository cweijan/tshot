**💛 You can help the author become a full-time open-source maintainer by [sponsoring him on GitHub](https://github.com/sponsors/egoist).**

---

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

Note that this command will emit temporary files to `./temp` folder, it's recommended to add it to your `.gitignore` file.

**Build a script: (for production)**

```
tshot build your-scripts.ts
```

This command will emit bundled script to `./dist` folder with a filename matching the original filename. i.e. here you will get `./dist/your-script.js`.

## Externals

`dependencies` and `peerDependencies` are automatically excluded from the bundled scripts.

## License

MIT &copy; [EGOIST](https://github.com/sponsors/egoist)
