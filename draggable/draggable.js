/**
 * 
 * @param {string} selector css selector of draggble tagetElement
 * @param {Object} options 
 * @param {string} options.type  tagetElement`s css position ,default fixed，optional absolute
 * @param {string} options.parent  targetEle`s parentElement selector when position is absolute，first parentElemt as default
 * @param {string} options.dragbar targetElement`s dragbar when mouse down,default to  targetElement itself
 */
function makeitMovable(selector, options) {
  const { type, parent, dragbar } = options
  let onMove = false
  let offsetX;
  let offsetY;
  let maxRight = window.innerWidth
  let maxBottom = window.innerHeight
  /** @type{HTMLElement} */
  const target = document.querySelector(selector)
  const targetStyle = getCompStyle(target)
  if (targetStyle.position !== "fixed" && targetStyle.position !== "absolute") {
    throw new Error("The target element css position is not true, absolute or fixed expected")

  }
  const dragElement = document.querySelector(dragbar || selector)
  dragElement.addEventListener("mousedown", onMouseDown)
  function onMouseDown(e) {
    onMove = true
    offsetX = e.offsetX
    offsetY = e.offsetY
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
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
  function moveTo(ele, { x, y }) {
    const targetlimits = {
      left: 0,
      right: maxRight - getCompStyle(ele).width,
      top: 0,
      bottom: maxBottom - getCompStyle(ele).height
    }
    if (type === "absolute") {

      const { width, position, height, paddingBottom, paddingLeft, paddingRight, paddingTop, boxSizing } = getCompStyle(document.querySelector(parent) || target.parentElement)
      if (targetStyle.position !== "absolute") {
        throw new Error("The target element css position is not true, absolute expected")
      }
      targetlimits.left = 0 + paddingLeft
      targetlimits.top = 0 + paddingTop
      if (boxSizing === "border-box") {
        targetlimits.right = width - getCompStyle(ele).width - paddingRight
        targetlimits.bottom = height - getCompStyle(ele).height - paddingBottom

      } else {

        targetlimits.right = width - getCompStyle(ele).width + paddingLeft
        targetlimits.bottom = height - getCompStyle(ele).height + paddingTop
      }

    }
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
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)
  }


}