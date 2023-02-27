import { run } from '..'
import { join } from 'path'

// ts-node --skip-project src\test\index.spec.ts
run(join(__dirname,'./test.ts'),true)