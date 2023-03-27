/*
 * @Author: fuya f2956903402@gmail.com
 * @Date: 2023-03-27 12:29:50
 * @LastEditors: fuya f2956903402@gmail.com
 * @LastEditTime: 2023-03-27 13:17:56
 * @FilePath: \utils\draggable\makeitMovable.d.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
interface makeitMovableOptions {
  type?: "fixed" | "absolute",
  parent?: string,
  dragbar?: string
}
declare function makeitMovable(selector: string, option: makeitMovableOptions): void

export { makeitMovable }




