export class DnD {
  constructor(elRef, onReorder) {
    // console.log(elRef.value)
    this.elRef = elRef
    this.onReorder = onReorder
    this.sourceEl = null
    this.list = null

    this.canvas = document.createElement('canvas')
    this.canvas.width = 200
    this.canvas.height = 100
    const ctx = this.canvas.getContext('2d')
    ctx.strokeStyle = 'orange'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(0, 0, 200, 100, 5)
    ctx.fillStyle = 'rgba(255, 165, 0, 0.5)' // 半透明橙色
    ctx.fill()
    ctx.stroke()
    this.img = new Image()
    this.img.src = this.canvas.toDataURL()
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnter = this.onDragEnter.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.onDragOver = this.onDragOver.bind(this)
  }

  onDragStart(e) {
    console.log('onDragStart')
    this.sourceEl = e.target.closest('li')
    if (!this.sourceEl) return
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setDragImage(this.img, 50, 25)
    setTimeout(() => this.sourceEl.classList.add('dragging'), 100)
    e.stopPropagation()
  }

  onDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  onDragEnter(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!this.sourceEl) return
    const targetEl = e.target.closest('li')
    if (!targetEl || targetEl === this.sourceEl) return
    if (this.sourceEl.contains(targetEl)) return

    const targetParent = targetEl.parentElement
    if (targetEl.classList.contains('root')) return

    const targetRect = targetEl.querySelector('.node').getBoundingClientRect()

    const mouseY = e.clientY - targetRect.top
    const mouseX = e.clientX - targetRect.left
    const isLeft = mouseX < targetRect.width * 0.3
    const isRight = mouseX > targetRect.width * 0.4
    const isBottom = mouseY > targetRect.height * 0.9

    // 添加一个标志来记录上一次的操作
    if (!this.lastOperation) {
      this.lastOperation = { type: null, target: null }
    }

    let currentOperation = { type: null, target: null }

    if (isBottom) {
      currentOperation.type = 'bottom'
      currentOperation.target = targetEl
    } else if (isLeft) {
      currentOperation.type = 'left'
      currentOperation.target = targetEl
    } else if (isRight) {
      currentOperation.type = 'right'
      currentOperation.target = targetEl
    }

    // 如果当前操作与上一次操作相同，则不执行
    if (currentOperation.type === this.lastOperation.type && currentOperation.target === this.lastOperation.target) {
      return
    }

    // 更新上一次操作
    this.lastOperation = currentOperation

    if (isBottom) {
      let targetChildList = targetEl.querySelector('ul')
      if (!targetChildList) {
        targetChildList = document.createElement('ul')
        targetEl.appendChild(targetChildList)
      }
      targetChildList.appendChild(this.sourceEl)
    } else if (isLeft) {
      targetParent.insertBefore(this.sourceEl, targetEl)
    } else if (isRight) {
      targetParent.insertBefore(this.sourceEl, targetEl.nextElementSibling)
    }

    // // 添加动画效果
    // const oldTop = targetEl.getBoundingClientRect().top
    // const newTop = this.sourceEl.getBoundingClientRect().top
    // const offset = oldTop - newTop
    // this.sourceEl.animate([{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0px)' }], { duration: 80, easing: 'ease-in-out' })
  }
  onDragEnd() {
    if (!this.sourceEl) return
    this.sourceEl.classList.remove('dragging')
    const items = [...this.sourceEl.parentElement.children]
    const ids = items.map((item) => item.dataset.id)
    this.onReorder(ids)
    this.sourceEl = null
  }

  init() {
    this.list = this.elRef.value
    if (!this.list) return
    this.list.addEventListener('dragstart', this.onDragStart)
    this.list.addEventListener('dragenter', this.onDragEnter)
    this.list.addEventListener('dragover', this.onDragOver)
    this.list.addEventListener('dragend', this.onDragEnd)
  }

  destroy() {
    if (!this.list) return
    this.list.removeEventListener('dragstart', this.onDragStart)
    this.list.removeEventListener('dragenter', this.onDragEnter)
    this.list.removeEventListener('dragover', this.onDragOver)
    this.list.removeEventListener('dragend', this.onDragEnd)
  }
}
