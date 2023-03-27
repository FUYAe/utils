function updateState(state: BoxState, ele: HTMLElement) {
  let style = compStyle(ele)
  state.meta.left = style.left + "px"
  state.meta.top = style.top + "px"
  state.meta.width = style.width + "px"
  state.meta.height = style.height + "px"
}
class BoxController {
  target: HTMLElement
  private static isCalled = false
  protected static mouseMoveListeners: Set<Listener> = new Set()
  protected static mouseDownListeners: Set<Listener> = new Set()
  protected static mouseUpListeners: Set<Listener> = new Set()
  protected state: BoxState = {
    meta: {
      left: "0",
      top: "0",
      width: "0",
      height: "0"
    }
  }
  constructor(target: HTMLElement) {
    checkTarget(target)
    this.target = target
    this.initState()
    this.runOnce()
  }
  runOnce() {
    if (!BoxController.isCalled) {
      BoxController.createMouseListener()
      BoxController.isCalled = true
    }
  }
  initState() {
    let self = this
    let style = compStyle(self.target)
    self.state.meta = new Proxy({
      left: style.left + "px",
      top: style.top + "px",
      width: style.width + "px",
      height: style.height + "px"
    },
      {
        get(target: BoxMeta, prop: keyof BoxMeta, rec) {
          return target[prop]
        },
        set(target: BoxMeta, prop: keyof BoxMeta, newVal: string | number, rec) {
          if (typeof newVal === "number") {
            newVal = newVal + "px"
          }
          if (typeof newVal === "string") {
            target[prop] = newVal
            self.target.style[prop] = newVal
          } else {
            throw Error("type of state value need to be string or number ")
          }
          return true
        }
      })
  }
  private static createMouseListener() {
    document.addEventListener("mousemove", function (e) {
      BoxController.mouseMoveListeners.forEach(fn => fn.call(this, e))
    })
    document.addEventListener("mousedown", function (e) {
      BoxController.mouseDownListeners.forEach(fn => fn.call(this, e))
    })
    document.addEventListener("mouseup", function (e) {
      BoxController.mouseUpListeners.forEach(fn => fn.call(this, e))
    })
  }
}

function checkTarget(target: any) {
  if (!(target instanceof HTMLElement)) {
    throw Error("target need to be instance of HTMLElement")
  }
}
function instanceOfHTMLEle(ele: any) {
  return ele instanceof HTMLElement
}




class Draggable extends BoxController {
  private dragBar: HTMLElement | null = null;
  private onMouseMoveFn: any;
  private options: DraggableOptions = {
    padding: 5,
    remember: true,
    movable: true,
    position: "fixed"
  }
  private onMove = false
  private mouseDownLoc = {
    x: 0,
    y: 0
  }
  private mouseDownBoxLoc = {
    x: 0,
    y: 0
  }
  private localStoreKey: string | null = ''
  private starts: Set<DraggableEvent> = new Set()
  private stops: Set<DraggableEvent> = new Set()
  private movings: Set<DraggableEvent> = new Set()


  constructor(target: HTMLElement, options?: DraggableOptions) {
    super(target)
    this.handleOptions(options)
    this.handleStore()
    this.initMouseDown()
  }

  private handleOptions(options: DraggableOptions | any) {
    if (!options) {
      this.dragBar = this.target
      return
    }
    const { dragBar } = options
    if (!instanceOfHTMLEle(dragBar)) {
      this.dragBar = this.target
    }
    Object.assign(this.options, options)
  }
  private handleStore() {
    this.localStoreKey = this.target.getAttribute("drkey")
    if (this.options.remember && this.localStoreKey) {
      let localStore = localStorage.getItem(this.localStoreKey)
      if (localStore) {
        let lcstore = localStore && JSON.parse(localStore)
        setEleLocation(this.state, lcstore.x, lcstore.y)
        updateState(this.state, this.target)
      }
    }
  }

  private initMouseDown() {
    this.dragBar?.addEventListener("mousedown", this.onMouseDown.bind(this))
    BoxController.mouseUpListeners.add(this.onMouseUp.bind(this))
  }
  private runStartEvent(e: MouseEvent) {
    this.starts.forEach(fn => fn(this.state, e))
  }
  private runDoingEvent(e: MouseEvent) {
    this.movings.forEach(fn => fn(this.state, e))
  }
  private runStopEvent(e: MouseEvent) {
    this.stops.forEach(fn => fn(this.state, e))
  }
  private onMouseDown(e: MouseEvent) {
    if (!boxInnerDetect(e, this.dragBar || this.target, this.options.padding) || !this.options.movable) return
    console.log('34', 34)
    this.onMove = true
    this.runStartEvent(e)
    this.mouseDownLoc = {
      x: e.x,
      y: e.y
    }
    this.mouseDownBoxLoc = {
      x: compStyle(this.target).left,
      y: compStyle(this.target).top
    }
    BoxController.mouseMoveListeners.add((this.onMouseMoveFn = this.onMouseMove.bind(this)))
  }
  private onMouseMove(e: MouseEvent) {

    if (!this.onMove) return
    this.runDoingEvent(e)
    setEleLocation(this.state, this.mouseDownBoxLoc.x + e.x - this.mouseDownLoc.x, this.mouseDownBoxLoc.y + e.y - this.mouseDownLoc.y)
    updateState(this.state, this.target)
  }
  private onMouseUp(e: MouseEvent) {
    if (!boxInnerDetect(e, this.target, this.options.padding)) return
    this.runStopEvent(e)
    this.onMove = false
    BoxController.mouseMoveListeners.delete(this.onMouseMoveFn)
    if (this.options.remember && this.localStoreKey) {
      let currentStyle = compStyle(this.target)
      localStorage.setItem(this.localStoreKey, JSON.stringify({ x: currentStyle.left, y: currentStyle.top }))
    }

  }


  setOptions(options: DraggableOptions) {
    options && this.handleOptions(options)
    Object.assign(this.options, options)
  }
  addStartListener(fn: DraggableEvent) {
    this.starts.add(fn)
  }
  removeStartListener(fn: DraggableEvent) {
    this.starts.delete(fn)
  }
  addStopListener(fn: DraggableEvent) {
    this.stops.add(fn)
  }
  removeStopListener(fn: DraggableEvent) {
    this.stops.delete(fn)
  }
  addDoingListener(fn: DraggableEvent) {
    this.movings.add(fn)
  }
  removeDoingListener(fn: DraggableEvent) {
    this.movings.delete(fn)
  }
}
function boxInnerDetect(e: MouseEvent, ele: HTMLElement, span: number) {
  let style = compStyle(ele)
  const { x, y } = globalXY2localXY(e, ele)
  console.log('x', x)
  return x >= style.left + span && x <= style.left + style.width - span && y >= style.top + span && y <= style.top + style.height - span
}
function setEleLocation(state: BoxState, x: number, y: number) {
  state.meta.left = `${x}px`
  state.meta.top = `${y}px`

}
function compStyle(ele: Element) {
  let cs = getComputedStyle(ele)
  return {
    width: parseFloat(cs.width),
    height: parseFloat(cs.height),
    left: parseFloat(cs.left),
    top: parseFloat(cs.top),
    right: parseFloat(cs.right),
    bottom: parseFloat(cs.bottom),
  }
}





class Expandable extends BoxController {



  private mouseHaveDown = false;
  private localStoreKey: string | undefined | null
  private options: ExpandableOptions = {
    remember: true,
    edgeSpan: 6,
    cursur: {
      rowResize: "row-resize",
      colResize: "col-resize",
      corner: "move"
    }

  }
  private starts: Set<ExpandableEvent> = new Set()
  private stops: Set<ExpandableEvent> = new Set()
  private expandings: Set<ExpandableEvent> = new Set()



  constructor(target: HTMLElement, options?: ExpandableOptions) {
    super(target)
    this.handleStore()
    this.handleOptions(options)
    this.edgeDetect()
    this.onMouseDownEdge()
    BoxController.mouseDownListeners.add((e) => {
      if (isInEdge(e, this.target, this.options.edgeSpan)) {
        this.runStartEvent(e)
      }
    })
  }
  handleStore() {
    this.localStoreKey = this.target.getAttribute("exkey")
    if (this.options.remember && this.localStoreKey) {
      let localStore = localStorage.getItem(this.localStoreKey)
      if (localStore) {
        let lcstore = localStore && JSON.parse(localStore)
        setEleScale(this.state, lcstore.width, lcstore.height)
        setEleLocation(this.state, lcstore.x, lcstore.y,)
      }
    }
  }
  private runStartEvent(e: MouseEvent) {
    this.starts.forEach(fn => fn(this.state, e))
  }
  private runDoingEvent(e: MouseEvent) {
    this.expandings.forEach(fn => fn(this.state, e))
  }
  private runStopEvent(e: MouseEvent) {
    this.stops.forEach(fn => fn(this.state, e))
  }
  handleOptions(options: ExpandableOptions | any) {
    Object.assign(this.options, options)
  }

  setOptions(options: ExpandableOptions) {
    Object.assign(this.options, options)
  }
  addStartListener(fn: ExpandableEvent) {
    this.starts.add(fn)
  }
  removeStartListener(fn: ExpandableEvent) {
    this.starts.delete(fn)
  }
  addStopListener(fn: ExpandableEvent) {
    this.stops.add(fn)
  }
  removeStopListener(fn: ExpandableEvent) {
    this.stops.delete(fn)
  }
  addDoingListener(fn: ExpandableEvent) {
    this.expandings.add(fn)
  }
  removeDoingListener(fn: ExpandableEvent) {
    this.expandings.delete(fn)
  }

  private edgeDetect() {
    let self = this

    BoxController.mouseMoveListeners.add(function (e) {
      if (self.mouseHaveDown) return
      if (isInCorner(e, self.target, self.options.edgeSpan)) {
        document.body.style.cursor = self.options.cursur.corner
      } else if (isInEdgeRight(e, self.target, self.options.edgeSpan) || isInEdgeLeft(e, self.target, self.options.edgeSpan)) {
        document.body.style.cursor = self.options.cursur.colResize
      } else if (isInEdgeTop(e, self.target, self.options.edgeSpan) || isInEdgeBottom(e, self.target, self.options.edgeSpan)) {
        document.body.style.cursor = self.options.cursur.rowResize
      } else {
        document.body.style.cursor = ""
      }
    })
  }
  onMouseDownEdge() {
    let self = this
    let onMousedownLoc = {
      x: 0,
      y: 0,
      boxH: 0,
      boxW: 0,
      boxLeft: 0,
      boxTop: 0

    }
    function extRight(e: MouseEvent) {
      self.target.style.width = `${e.x - onMousedownLoc.x + onMousedownLoc.boxW}px`
    }
    function extLeft(e: MouseEvent) {
      self.target.style.left = `${onMousedownLoc.boxLeft + e.x - onMousedownLoc.x}px`
      self.target.style.width = `${onMousedownLoc.x - e.x + onMousedownLoc.boxW}px`
    }
    function extTop(e: MouseEvent) {
      self.target.style.top = `${onMousedownLoc.boxTop + e.y - onMousedownLoc.y}px`
      self.target.style.height = `${onMousedownLoc.y - e.y + onMousedownLoc.boxH}px`
    }
    function extBottom(e: MouseEvent) {
      self.target.style.height = `${e.y - onMousedownLoc.y + onMousedownLoc.boxH}px`
    }
    BoxController.mouseDownListeners.add(function (e) {
      self.mouseHaveDown = true
      let boxStyle = compStyle(self.target)
      onMousedownLoc = {
        x: e.x,
        y: e.y,
        boxW: boxStyle.width,
        boxH: boxStyle.height,
        boxLeft: boxStyle.left,
        boxTop: boxStyle.top
      }
      if (isInCornerRT(e, self.target, self.options.edgeSpan)) {
        BoxController.mouseMoveListeners.add(extRight);
        BoxController.mouseMoveListeners.add(extTop);
      } else if (isInCornerRB(e, self.target, self.options.edgeSpan)) {
        BoxController.mouseMoveListeners.add(extRight);
        BoxController.mouseMoveListeners.add(extBottom);
      } else if (isInCornerLT(e, self.target, self.options.edgeSpan)) {
        BoxController.mouseMoveListeners.add(extLeft);
        BoxController.mouseMoveListeners.add(extTop);
      } else if (isInCornerLB(e, self.target, self.options.edgeSpan)) {
        BoxController.mouseMoveListeners.add(extLeft);
        BoxController.mouseMoveListeners.add(extBottom);
      }
      else if (isInEdgeRight(e, self.target, self.options.edgeSpan)) {
        BoxController.mouseMoveListeners.add(extRight);
      } else if (isInEdgeLeft(e, self.target, self.options.edgeSpan)) {
        BoxController.mouseMoveListeners.add(extLeft);
      } else if (isInEdgeTop(e, self.target, self.options.edgeSpan)) {
        BoxController.mouseMoveListeners.add(extTop);
      } else if (isInEdgeBottom(e, self.target, self.options.edgeSpan)) {
        BoxController.mouseMoveListeners.add(extBottom);
      } else {
        return
      }
      self.runDoingEvent(e)
    })
    BoxController.mouseUpListeners.add((e) => {
      self.mouseHaveDown = false
      this.runStopEvent(e)
      if (this.options.remember && self.localStoreKey) {
        let currentStyle = compStyle(self.target)
        localStorage.setItem(self.localStoreKey, JSON.stringify({ x: currentStyle.left, y: currentStyle.top, width: currentStyle.width, height: currentStyle.height }))
      }
      BoxController.mouseMoveListeners.delete(extRight);
      BoxController.mouseMoveListeners.delete(extLeft);
      BoxController.mouseMoveListeners.delete(extBottom);
      BoxController.mouseMoveListeners.delete(extTop);
    })
  }


}
function correctXY(e: MouseEvent, target: HTMLElement) {
  let style = getComputedStyle(target)
  let parent = target.parentElement
  if (parent && style.position === "absolute") {
    while (parent && !(checkPosition(parent))) {
      parent = parent.parentElement
    }
    let parentStyle = parent && getComputedStyle(parent)
    return {
      x: e.x - (parentStyle ? parseFloat(parentStyle.left) : 0),
      y: e.y - (parentStyle ? parseFloat(parentStyle.top) : 0)
    }
  } else {
    return { x: e.x, y: e.y }
  }

}
function globalXY2localXY(e: MouseEvent, target: HTMLElement) {
  let style = getComputedStyle(target)
  let parent = target.parentElement
  if (parent && style.position === "absolute") {
    while (parent && !(checkPosition(parent))) {
      parent = parent.parentElement
    }

    let parentStyle = parent && getComputedStyle(parent)
    // console.log('parentStyle', parentStyle)
    console.log('parseFloat(parentStyle.left)', parentStyle)
    return {
      x: e.x - parseFloat(parentStyle.left),
      y: e.y - parseFloat(parentStyle.top)
    }
  } else {
    return { x: e.x, y: e.y }
  }
}
function localXY2globalXY(e: MouseEvent, target: HTMLElement) {
  let style = getComputedStyle(target)
  let nstyle = compStyle(target)
  let parent = target.parentElement
  if (parent && style.position === "absolute") {
    while (parent && !(checkPosition(parent))) {
      parent = parent.parentElement
    }

    let parentStyle = parent && getComputedStyle(parent)
    return {
      x: nstyle.left + (parentStyle ? parseFloat(parentStyle.left) : 0),
      y: nstyle.top + (parentStyle ? parseFloat(parentStyle.top) : 0)
    }
  } else {
    return { x: e.x, y: e.y }
  }
}
function checkPosition(ele: HTMLElement) {
  let style = getComputedStyle(ele)
  if (style.position === "relative" || style.position === "absolute" || style.position === "fixed") {
    return true
  }
  return false
}



function setEleScale(state: BoxState, width: string | number, height: string | number) {
  state.meta.width = width + "px"
  state.meta.height = height + "px"
}
function isInCorner(e: MouseEvent, box: HTMLElement, span: number) {
  return isInCornerLT(e, box, span) || isInCornerLB(e, box, span) || isInCornerRT(e, box, span) || isInCornerRB(e, box, span)
}
function isInCornerLT(e: MouseEvent, box: HTMLElement, span: number) {
  return isInEdgeLeft(e, box, span) && isInEdgeTop(e, box, span)
}
function isInCornerLB(e: MouseEvent, box: HTMLElement, span: number) {
  return isInEdgeLeft(e, box, span) && isInEdgeBottom(e, box, span)
}
function isInCornerRT(e: MouseEvent, box: HTMLElement, span: number) {
  return isInEdgeRight(e, box, span) && isInEdgeTop(e, box, span)
}
function isInCornerRB(e: MouseEvent, box: HTMLElement, span: number) {
  return isInEdgeRight(e, box, span) && isInEdgeBottom(e, box, span)
}
function isInEdgeRight(e: MouseEvent, box: HTMLElement, span: number) {
  const { x, y } = localXY2globalXY(e, box)
  let halfSpan = span / 2
  const { width, height, left, top } = compStyle(box)
  if (between(x, left + width, halfSpan, y, top, height)) {
    return true
  } else {
    return false
  }
}
function isInEdgeLeft(e: MouseEvent, box: HTMLElement, span: number) {
  const { x, y } = localXY2globalXY(e, box)
  let halfSpan = span / 2
  const { width, height, left, top } = compStyle(box)
  if (between(x, left, halfSpan, y, top, height)) {
    return true
  } else {
    return false
  }
}
function isInEdgeTop(e: MouseEvent, box: HTMLElement, span: number) {
  const { x, y } = localXY2globalXY(e, box)
  let halfSpan = span / 2
  const { width, height, left, top } = compStyle(box)
  if (between(y, top, halfSpan, x, left, width)) {
    return true
  } else {
    return false
  }
}
function isInEdgeBottom(e: MouseEvent, box: HTMLElement, span: number) {
  const { x, y } = localXY2globalXY(e, box)
  let halfSpan = span / 2
  const { width, height, left, top } = compStyle(box)
  if (between(y, top + height, halfSpan, x, left, width)) {
    return true
  } else {
    return false
  }
}
function isInEdge(e: MouseEvent, box: HTMLElement, span: number): boolean {
  let targetStyle = compStyle(box)
  const { x, y } = localXY2globalXY(e, box)
  let halfSpan = span / 2
  let boxWidth = targetStyle.width
  let boxHeight = targetStyle.height
  let boxLeft = targetStyle.left
  let boxTop = targetStyle.top
  if (between(x, boxLeft, halfSpan, y, boxTop, boxHeight) || between(x, boxLeft + boxWidth, halfSpan, y, boxTop, boxHeight) || between(y, boxTop, halfSpan, x, boxLeft, boxWidth) || between(y, boxTop + boxHeight, halfSpan, x, boxLeft, boxWidth)) {
    return true
  } else {
    return false
  }
}
function between(loc: number, line: number, tolerance: number, locX?: number, start?: number, len?: number) {

  let isbetween = (loc <= line + tolerance) && (loc >= line - tolerance)
  if (len && start && locX) {
    isbetween = (loc <= line + tolerance) && (loc >= line - tolerance) && (locX >= start) && (locX <= start + len)
  }
  return isbetween
}
export { Draggable, Expandable }