import { isMainThread, Worker, workerData, parentPort } from 'node:worker_threads'
import { calculateAgari } from '@ima/server/helpers/agari'

export const calculateAgariThreaded = async (
  ...args: Parameters<typeof calculateAgari>
): Promise<ReturnType<typeof calculateAgari>> => {
  const worker = new Worker(__filename, { workerData: { args } })
  return new Promise((resolve, reject) => {
    worker.once('message', resolve)
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
