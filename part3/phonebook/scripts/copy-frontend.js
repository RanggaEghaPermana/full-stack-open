import { cp, rm } from 'node:fs/promises'
await rm(new URL('../public/', import.meta.url), { recursive: true, force: true })
await cp(new URL('../frontend/dist/', import.meta.url), new URL('../public/', import.meta.url), { recursive: true })
console.log('Copied frontend build into backend public/')
