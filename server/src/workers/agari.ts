import { isMainThread, Worker, workerData, parentPort } from 'node:worker_threads'
import { calculateAgari } from '@ima/server/helpers/agari'

export const calculateAgariThreaded = async (
  ...args: Parameters<typeof calculateAgari>
): Promise<ReturnType<typeof calculateAgari>> => {
  const key = `agari:${JSON.stringify(args)}`

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { redis } = require('@ima/server/db')

  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  const worker = new Worker(__filename, { workerData: { args } })
  return new Promise((resolve, reject) => {
    worker.once('message', (message) => {
      redis.set(key, JSON.stringify(message), 'EX', 60 * 60)
      resolve(message)
    })
    worker.once('error', reject)
    worker.once('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}

if (!isMainThread) {
  parentPort?.postMessage(calculateAgari(...(workerData.args as Parameters<typeof calculateAgari>)))
  parentPort?.close()
}
