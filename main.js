const cvs = document.getElementById('cvs')
const ctx = cvs.getContext('2d')

const img = new Image()

img.src = './img/BlackSilenceIcon.png'

let particleList = []
const mouse = {
    x: null,
    y: null,
    radius: 150
}

class Particle {
    constructor(x, y, color = 'red') {
        this.x = x
        this.y = y
        this.baseX = x
        this.baseY = y
        this.color = color
        this.weight = Math.round(Math.random() * 30) + 1
    }

    draw() {
        ctx.fillStyle = this.color

        ctx.beginPath()
        ctx.arc(this.x, this.y, 1, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.fill()
    }

    update() {
        let dx = mouse.x - this.x
        let dy = mouse.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        const force = (mouse.radius - distance) / mouse.radius
        const forceDirectionX = dx / distance
        const forceDirectionY = dy / distance

        const forceRepulsionX = this.weight * force * forceDirectionX
        const forceRepulsionY = this.weight * force * forceDirectionY

        if (distance <= mouse.radius) {
            this.x -= forceRepulsionX
            this.y -= forceRepulsionY
        } else {
            if (this.x !== this.baseX) {
                dx = this.baseX - this.x

                this.x += dx / 5        
            }

            if (this.y !== this.baseY) {
                dy = this.baseY - this.y

                this.y += dy / 5
            }
        }
    }
}

function init() {
    // zeroing cache
    particleList = []

    const options = [0, 0, 100, 100]

    ctx.drawImage(img, ...options)

    const imageData = ctx.getImageData(...options)

    // pixel skip
    const detalisation = 4

    for (let i = 0; i < imageData.data.length; i += detalisation) {
        const pixelAlpha = imageData.data[i + 3]

        if (pixelAlpha > 128) {
            const position = i / 4

            let particleY = Math.round(position / imageData.width)
            let particleX = (position - (particleY * imageData.width)) * -1
            
            // image mirroring
            particleY = particleX < 1 ? particleY + 1 : particleY
            particleX = particleX > 0 ? 50 - particleX : (50 + particleX) * -1

            // convert rgb alpha to normal values
            const alpha = Math.round(imageData.data[i + 3] / 2.55) / 100
            const color = `rgba(${imageData.data[i]}, ${imageData.data[i + 1]}, ${imageData.data[i + 2]}, ${alpha})`

            particleList.push(
                new Particle(
                    particleX * 5 + cvs.width / 2, 
                    Math.round(particleY * 5 + cvs.height / 4), 
                    color
                )
            )
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, cvs.width, cvs.height)

    particleList.forEach(particle => {
        particle.draw()
        particle.update()
    })

    requestAnimationFrame(animate)
}

animate()

function updateSize() {
    ctx.clearRect(0, 0, cvs.width, cvs.height)

    cvs.width = window.innerWidth
    cvs.height = window.innerHeight

    ctx.fillStyle = 'black'

    init()
}

updateSize()

img.addEventListener('load', init)
window.addEventListener('resize', updateSize) 
window.addEventListener('mousemove', ev => {
    mouse.x = ev.x
    mouse.y = ev.y
}) 