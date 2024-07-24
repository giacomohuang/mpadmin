// 控制并发任务的数量
class ConcurrentTaskQueue {
  constructor(maxConcurrentRequests) {
    this.MAX_CONCURRENT_REQUESTS = maxConcurrentRequests
    this.queue = []
    this.runningTasksCount = 0
  }

  // 内部方法，用于处理队列中的下一个任务
  async processNextTask() {
    if (this.queue.length > 0 && this.runningTasksCount < this.MAX_CONCURRENT_REQUESTS) {
      const task = this.queue.shift() // 取出队列中的第一个任务
      this.runningTasksCount++
      await task() // 执行任务
      this.runningTasksCount--
      this.processNextTask() // 继续处理下一个任务
    }
  }

  // 公共方法，用于添加任务到队列并自动开始处理
  enqueue(task) {
    this.queue.push(task)
    this.processNextTask() // 开始处理队列中的任务
  }

  async waitForAll() {
    // 只要队列不为空或者还有正在运行的任务，就等待
    while (this.queue.length > 0 || this.runningTasksCount > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}

export default ConcurrentTaskQueue
