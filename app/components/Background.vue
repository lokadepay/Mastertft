<script setup lang="ts">

import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
    console.log('Background initialisé')

    const canvas = document.getElementById("hexCanvas") as HTMLCanvasElement
    const ctx = canvas.getContext("2d") 
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    function resize() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    window.addEventListener("resize", resize)
    resize()

    window.addEventListener("mousemove", e => {
        mouse.x = e.clientX
        mouse.y = e.clientY
    })

    function drawHex(x, y, s, opacity) {
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i
            const px = x + s * Math.cos(angle)
            const py = y + s * Math.sin(angle)
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.strokeStyle = `rgba(110,90,139,${opacity})`
        ctx.lineWidth = 1
        ctx.stroke()
    }

    const baseSize = 20 // Taille de base
    const gap = 16 // Espace entre les hexagone
    const dx = 1.5 * baseSize + gap
    const dy = Math.sqrt(3) * baseSize + gap

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        for (let col = 0; col < canvas.width / dx + 2; col++) {
            for (let row = 0; row < canvas.height / dy + 2; row++) {
                const x = col * dx
                const y = row * dy + (col % 2 ? (dy / 2) : 0)

                const dist = Math.hypot(mouse.x - x, mouse.y - y)
                const maxDist = 200 // Distance du hover

                // zoom + opacité au hover
                let opacity = 0.15
                let size = baseSize
                if (dist < maxDist) {
                    const t = 1 - dist / maxDist
                    opacity = 0.15 + t * 0.85 // 
                    size = baseSize * (1 + t * 0.5) // % de zoom au hover
                }

                drawHex(x, y, size, opacity)
            }
        }
        requestAnimationFrame(drawGrid)
    }

    drawGrid()
})

</script>

<template>

<div class="background">
    <canvas id="hexCanvas"></canvas>
</div>

</template>

<style lang="scss" scoped>

@use '~/assets/styles/variables' as *;

.background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: $deep-purple;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
}

#hexCanvas {
    display: block;
    width: 100%;
    height: 100%;
}

</style>

