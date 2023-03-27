interface DraggableOptions {
  dragBar?: Element,
  padding: number,
  remember?: boolean,
  movable: boolean,
  position: string
}
interface BoxState {
  meta: BoxMeta
}
interface BoxMeta {
  left: string | number,
  top: string | number,
  width: string | number,
  height: string | number
}



interface BoxStateDraggable {
  left: string | number,
  top: string | number,

}

interface DraggableEvent {
  (state: BoxState, e: MouseEvent): void
}

interface DraggableListener {
  (ev: MouseEvent): any
}
interface Listener {
  (this: Document | BoxController, ev: MouseEvent): any
}
interface ExpandableEvent {
  (state: BoxState, e: MouseEvent): any
}
interface ExpandableOptions {
  edgeSpan: number,
  remember: boolean
  cursur: {
    rowResize: string,
    colResize: string,
    corner: string
  }
}
interface LocalExp {
  x: number,
  y: number,
  width: number
  height: number
}