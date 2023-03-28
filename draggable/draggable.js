/**
 * 
 * @param {string} selector css selector of draggble tagetElement
 * @param {Object} options 
 * @param {string} options.type  tagetElement`s css position ,default fixed，optional absolute
 * @param {string} options.parent  targetEle`s parentElement selector when position is absolute，first parentElemt as default
 * @param {string} options.dragbar targetElement`s dragbar selector when mouse down,default to  targetElement itself
 * @param {string} options.grid grid row x Col  like 3x5
 * @param {number[]} options.scope [top,right,bottom,left] in+,out-
 * @param {function(MouseEvent)} options.onEleMove on targetElement moving
 * @param {function(MouseEvent)} options.onStart  on targetElement start moving
 * @param {function(MouseEvent)} options.onStop  on targetElement stop moving
 */
function makeitMovable(selector, options) {
  let { type, parent, dragbar, scope, grid, onEleMove, onStop, onStart } = handleOptions(selector, options)
  let onMove = false
  let offsetX;
  let offsetY;
  let row;
  let col;
  let gridMoveXOld;
  let gridMoveYOld;
  /** @type{HTMLElement} */
  const target = document.querySelector(selector)
  const targetStyle = getCompStyle(target)

  if (grid) {
    let grids = grid.split("x")
    row = Number(grids[0])
    col = Number(grids[1])
  }
  const dragElement = document.querySelector(dragbar) || target
  dragElement.addEventListener("mousedown", onMouseDown)
  function onMouseDown(e) {
    onMove = true
    offsetX = e.offsetX
    offsetY = e.offsetY
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    onStart && onStart(e)
  }

  function moveTo(ele, { x, y }) {
    const targetlimits = {
      left: 0 + scope[3],
      right: window.innerWidth - getCompStyle(ele).width - scope[1],
      top: 0 + scope[0],
      bottom: window.innerHeight - getCompStyle(ele).height - scope[2],

    }
    let MovableWidth = window.innerWidth
    let MovableHeight = window.innerHeight
    if (type === "absolute") {
      const { width, position, height, paddingBottom, paddingLeft, paddingRight, paddingTop, boxSizing } = getCompStyle(document.querySelector(parent) || target.parentElement)
      if (targetStyle.position !== "absolute") {
        throw new Error("The target element css position is not true, absolute expected")
      }
      targetlimits.left = 0 + paddingLeft + scope[3]
      targetlimits.top = 0 + paddingTop + scope[0]
      MovableWidth = width + scope[3] - scope[1]
      MovableHeight = height + scope[0] - scope[2]
      if (boxSizing === "border-box") {
        MovableWidth = width - paddingLeft - paddingRight + scope[3] - scope[1]
        MovableHeight = height - paddingBottom - paddingTop + scope[0] - scope[2]
        targetlimits.right = width - getCompStyle(ele).width - paddingRight - scope[1]
        targetlimits.bottom = height - getCompStyle(ele).height - paddingBottom - scope[2]

      } else {

        targetlimits.right = width - getCompStyle(ele).width + paddingLeft - scope[1]
        targetlimits.bottom = height - getCompStyle(ele).height + paddingTop - scope[2]
      }

    }
    if (grid) {
      let spaceX = MovableWidth / col
      let spaceY = MovableHeight / row
      x = Math.floor(x / spaceX) * spaceX
      y = Math.floor(y / spaceY) * spaceY
      if (gridMoveXOld == x && gridMoveYOld == y) {
        return
      }

      gridMoveXOld = x
      gridMoveYOld = y
    }
    onEleMove && onEleMove()
    ele.style.left = `${Math.min(targetlimits.right, Math.max(targetlimits.left, x))}px`
    ele.style.top = `${Math.min(targetlimits.bottom, Math.max(targetlimits.top, y))}px`
  }
  function onMouseMove(e) {
    if (onMove) {
      moveTo(target, {
        x: e.clientX - offsetX, y: e.clientY - offsetY
      })

    }
  }

  function onMouseUp() {
    onMove = false
    onStop && onStop()
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)
  }


}
/**
 * @param { Object } options
  * @param { string } options.type  tagetElement`s css position ,default fixed，optional absolute
 * @param {string} options.parent  targetEle`s parentElement selector when position is absolute，first parentElemt as default
  * @param { string } options.dragbar targetElement`s dragbar selector when mouse down,default to  targetElement itself
 * @param {string} options.grid grid row x Col  like 3x5
 * @param {number[]} options.scope [top,right,bottom,left] in+,out-
 * @param {function(MouseEvent)} options.onEleMove on targetElement moving
 * @param {function(MouseEvent)} options.onStart  on targetElement start moving
 * @param {function(MouseEvent)} options.onStop  on targetElement stop moving
 */
function handleOptions(selector, options) {
  let { type, parent, dragbar, scope } = options
  if (!type) {
    options["type"] = "fixed"
  }
  const target = document.querySelector(selector)
  const targetStyle = getCompStyle(target)
  if (targetStyle.position !== "fixed" && targetStyle.position !== "absolute") {
    throw new Error("The target element css position is not true, absolute or fixed expected")

  }
  if (targetStyle.position !== type) {
    throw new Error(`The target element css position is not equal to type '${type}' , '${type}' expected`)

  }

  if (scope) {
    if (scope.length == 2) {
      let tb = scope[0]
      let lr = scope[1]
      options["scope"] = [tb, lr, tb, lr]
    } else if (scope.length == 1) {
      let v = scope[0]
      options["scope"] = [v, v, v, v]
    } else {
      new Error("scope wrong")
    }
  } else {
    options["scope"] = [0, 0, 0, 0]
  }
  return options
}
function getCompStyle(ele) {
  let style = getComputedStyle(ele)
  return {
    width: parseFloat(style.width),
    height: parseFloat(style.height),
    paddingBottom: parseFloat(style.paddingBottom),
    paddingLeft: parseFloat(style.paddingLeft),
    paddingRight: parseFloat(style.paddingRight),
    paddingTop: parseFloat(style.paddingTop),
    boxSizing: style.boxSizing,
    position: style.position

  }
}