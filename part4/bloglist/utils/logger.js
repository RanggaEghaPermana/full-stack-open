export const info = (...args) => { if (process.env.NODE_ENV !== 'test') console.log(...args) }
export const error = (...args) => { if (process.env.NODE_ENV !== 'test') console.error(...args) }
