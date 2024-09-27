export class DnD {
  constructor(elRef, onReorder) {
    // console.log(elRef.value)
    this.elRef = elRef
    this.onReorder = onReorder
    this.sourceEl = null
    this.list = null

    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnter = this.onDragEnter.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.onDragOver = this.onDragOver.bind(this)
  }

  onDragStart(e) {
    // console.log('onDragStart')
    this.sourceEl = e.target.closest('li')
    if (!this.sourceEl) return
    e.dataTransfer.effectAllowed = 'move'
    requestAnimationFrame(() => this.sourceEl.classList.add('dragging'))
    e.stopPropagation()
  }

  onDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  onDragEnter(e) {
    e.preventDefault()
    if (!this.sourceEl) return
    const targetEl = e.target.closest('li')
    // 确保目标元素和源元素在同一个父元素内
    if (!targetEl || targetEl === this.sourceEl || targetEl.parentElement !== this.sourceEl.parentElement) return
    if (targetEl.dataset.type !== this.sourceEl.dataset.type) return
    const itemsEl = [...targetEl.parentElement.children]
    const sourceIndex = itemsEl.indexOf(this.sourceEl)
    const targetIndex = itemsEl.indexOf(targetEl)
    const moveTarget = targetIndex > sourceIndex ? targetEl.nextElementSibling : targetEl
    if (moveTarget !== this.sourceEl && moveTarget !== this.sourceEl.nextElementSibling) {
      const oldTop = targetEl.getBoundingClientRect().top
      targetEl.parentElement.insertBefore(this.sourceEl, moveTarget)
      const newTop = targetEl.getBoundingClientRect().top
      const offset = oldTop - newTop
      targetEl.animate([{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0px)' }], { duration: 80, easing: 'ease-in-out' })
    }
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
