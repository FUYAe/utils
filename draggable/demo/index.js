
let clock = document.getElementById("clock")
/** @type {CanvasRenderingContext2D} */
let cltx = clock.getContext("2d")

function animate() {
  const now = new Date()
  let sec = now.getSeconds()
  let min = now.getMinutes()
  let hr = now.getHours() % 12
  cltx.save()
  cltx.clearRect(0, 0, 600, 600)
  // cltx.lineWidth = 6
  cltx.translate(300, 300)
  cltx.rotate(-Math.PI / 2)

  cltx.save()
  cltx.lineWidth = 40
  // cltx.strokeStyle = "red"
  cltx.fillStyle = "red"
  cltx.rotate(sec * (Math.PI / 30))
  cltx.beginPath()
  cltx.arc(0, 0, 280, 0, 2 * Math.PI);

  // cltx.fill()
  cltx.stroke()
  cltx.restore()

  cltx.save()
  cltx.lineWidth = 6
  for (let i = 0; i < 12; i++) {
    cltx.beginPath()
    cltx.rotate(Math.PI / 6)
    cltx.moveTo(200, 0)
    cltx.lineTo(230, 0)
    cltx.stroke()
    cltx.closePath()
  }
  cltx.restore()

  cltx.save()
  cltx.lineWidth = 3
  for (let i = 0; i < 60; i++) {
    cltx.beginPath()
    cltx.rotate(Math.PI / 30)
    cltx.moveTo(215, 0)
    cltx.lineTo(230, 0)
    cltx.stroke()
    cltx.closePath()
  }
  cltx.restore()

  cltx.save()
  cltx.lineWidth = 18
  cltx.beginPath()
  cltx.rotate(hr * (Math.PI / 6) + min * (Math.PI / 360) + sec * (Math.PI / (360 * 60)))
  cltx.moveTo(-30, 0)
  cltx.lineTo(150, 0)
  cltx.stroke()
  cltx.closePath()
  cltx.restore()

  cltx.save()
  cltx.lineWidth = 12
  cltx.beginPath()
  cltx.rotate(min * (Math.PI / 30) + sec * (Math.PI / (30 * 60)))
  cltx.moveTo(-30, 0)
  cltx.lineTo(190, 0)
  cltx.stroke()
  cltx.closePath()
  cltx.restore()


  cltx.save()
  cltx.lineWidth = 6
  cltx.strokeStyle = "red"
  cltx.beginPath()
  cltx.rotate(sec * (Math.PI / 30))
  cltx.moveTo(-30, 0)
  cltx.lineTo(180, 0)
  cltx.stroke()
  cltx.closePath()
  cltx.restore()

  cltx.save()
  cltx.lineWidth = 3
  cltx.strokeStyle = "red"
  cltx.fillStyle = "red"
  cltx.rotate(sec * (Math.PI / 30))
  cltx.beginPath()
  cltx.arc(0, 0, 10, 0, 2 * Math.PI);
  cltx.fill()
  cltx.stroke()
  cltx.restore()

  cltx.restore()
  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)


makeitMovable("#clock", {
  type: "absolute",
  scope: [-30]
  , onEleMove() {
    console.log("moving");
  }

})