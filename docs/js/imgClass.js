class ImgItem {
  constructor(src, width = 400) {
    const $img = document.createElement('img')
    $img.setAttribute('class', 'img-item')
    $img.src = src
    this.dom = $img 
    this.top = 0
    this.left = 0
    this.width = 0
    this.height = 0
  }

  getDom() {
    return this.dom
  }

  isNearCover(top, bottom) {
    const half = this.top + this.height / 2
    if (top < this.top) return bottom > half
    else return top < half
  }

  toggleMoving() {
    const c = 'moving'
    this.dom.classList.toggle(c)
  }

  resize(top, isExec) {
    this.top = top
    this.height = this.dom.offsetHeight
    if (isExec) {
      this.execDom()
    }
    return this.top + this.height
  }

  storePos() {
    const {offsetTop, offsetLeft} = this.dom
    this.top = offsetTop
    this.left = offsetLeft
  }
  
  execDom() {
    this.dom.setAttribute('style', `top: ${this.top}px;`)
  }

  /** 
    * 纵向移动
    * **/
  vMove(top) {
    this.dom.style.top = this.top + top + 'px' 
  }
  
  /** 
    * 横向移动
    * **/
  hMove(left) {
    this.dom.style.left = left + 'px'
  }

  zIndex(i) {
    this.dom.style.zIndex = i 
  }

  async loaded() {
    if (this._loaded) return Promise.resolve()
    return new Promise((resolve) => {
      this.dom.addEventListener('load', () => {
        this._loaded = true
        resolve()
      })
    })
  }
}


class ImgList {
  constructor($wrap) {
    this.top = $wrap.offsetTop
    this.list = []
    this.index = -1
    this.current = null
    this.wrapH = 0
    this.offsetPos = {}
  }

  getDomList() {
    return this.list.map(item => item.getDom())
  }

  startMove(i, offsetPos) {
    this.current = this.list[i]
    this.index = i
    this.offsetPos = offsetPos
    this.current.toggleMoving()
  }

  findIndex(dom) {
    return this.list.findIndex(item => item.dom === dom)
  }

  completeMove(e) {
    this.getCurrent().storePos()
    this.current.toggleMoving()
    this.index = -1
    this.arrange()
  }

  getCurrent() {
    return this.current
  }

  vMove(top) {
    const o = this.current
    top -= this.offsetPos.y
    o.vMove(top)
  }

  push(item) {
    this.list.push(item)
  }
  
  sort() {
    const top = this.current.dom.offsetTop
    const h = this.current.height 
    const coverIndex = this.list.findIndex((item, i) => item.dom !== this.current.dom && item.isNearCover(top, top + h)) 
    if (coverIndex >= 0) {
      const beCovered = this.list[coverIndex]
      this.list[coverIndex] = this.current
      this.list[this.index] = beCovered
      this.index = coverIndex
      this.arrange(coverIndex)
    }
  }

  arrange(coverIndex) {
    const wrapH = this.list.reduce((top, item, i) => {
      if (i === coverIndex) return item.dom.height + top 
      return item.resize(top, true)
    }, 0)
    this.wrapH = wrapH
    return wrapH
  }

  async allLoaded() {
    return Promise.all(this.list.map(async (item) => await item.loaded()))
  }
}
