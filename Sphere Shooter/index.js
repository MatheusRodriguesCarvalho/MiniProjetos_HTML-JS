const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth-10
canvas.height = innerHeight-10


// define a Class to the player
class Player {
	// this one is going to set and define the essntials properties of the player
	constructor(x, y, radius, color) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
	}
	// this will efectvily create the player, showing it on the screen
	draw() {
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
	}
}


class Projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}
	draw() {
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
	}
	// the UPDATE ones are going do make the object move on the screen, the player dosen't have it
	// because it is stuck in the middle of the screen
	update() {
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
	}
}

class Enemy {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}
	draw() {
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
	}
	update() {
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
	}
}

const friction = 0.99
class Particle {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
		this.alpha = 1
	}
	draw() {
		c.save()
		c.globalAlpha = this.alpha
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
		c.restore()
	}
	update() {
		this.draw()
		this.velocity.x *= friction
		this.velocity.y *= friction
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
		this.alpha -= 0.01
	}
}

// set the dimensions of the canvas, when the window may change its lenghts
const x = canvas.width / 2
const y = canvas.height / 2

// create ENTETIES that will be apperin on the screen
let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []
let timer = 1500

function init() {
	player = new Player(x, y, 10, 'white')
	projectiles = []
	enemies = []
	particles = []
	score = 0
	ScoreEL.innerHTML = 0
	bigScoreEL.innerHTML = 0
	timer = 1500
}

// create an ENEMY over time, and set its movements
function spawnEnemies() {
	setTimeout(() => {  
		const radius = Math.random() * (45 - 5) + 5
		
		let x
		let y
		
		// randomize its spawn area
		if (Math.random() > 0.5) {
			x = Math.random() > 0.5 ? 0 - radius : canvas.width + radius
			y = Math.random() * canvas.height
		} else {
			x = Math.random() * canvas.width
			y = Math.random() > 0.5 ? 0 - radius : canvas.height + radius
		}
		
		const color = `hsl( ${Math.random() * 360}, 50%, 50%)`
		
		// set its velocity from its randomly choosen location
		const angle = Math.atan2(
			canvas.height / 2 - y, 
			canvas.width / 2 - x)
		const velocity = {
			x: Math.cos(angle), 
			y: Math.sin(angle)
		}
		
		enemies.push(new Enemy(x, y, radius, color, velocity))
		spawnEnemies()
	}, timer)
}

let animationID
let score = 0

function animate() {
	animationID = requestAnimationFrame(animate)
	c.fillStyle = 'rgba(0, 0, 0, 0.3)'
	c.fillRect(0, 0, canvas.width, canvas.height)
	
	player.draw()
	
	particles.forEach((particle, index) => {
		if (particle.alpha <= 0) {
			particles.splice(index, 1)
		} else {
			particle.update()
		}
	})
	
	// Loops every PROJECTILE CREATED to: 1 draw it on screen, 2 delete it if hit the border
	projectiles.forEach((projectile, index) => { 
		projectile.update()
		
		if (
		 projectile.x + projectile.radius < 0 ||
		 projectile.x - projectile.radius > canvas.width ||
		 projectile.y + projectile.radius < 0 ||
		 projectile.y - projectile.radius > canvas.height
		) {
			setTimeout(() => {
				projectiles.splice(index, 1)
			})
		}
	})
	
	// Loops every ENEMY CREATED to: 1 see if it hit the player, 2 se if it waas hit by the projectile
	enemies.forEach((enemy, emenyIndex) => { 
		enemy.update() 
		
		// when the enemy hits the player
		const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
		if (dist - player.radius - enemy.radius < 1) {
			cancelAnimationFrame(animationID)
			modalEL.style.display = 'flex'
			bigScoreEL.innerHTML = score
		}
		
		// when a projectile hits the enemy
		projectiles.forEach((projectile, projectileIndex) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
			
			if (dist - enemy.radius - projectile.radius < 1) {
				
				// create particles from enemy when its hit
				for (let i = 0; i < enemy.radius; i++) {
					particles.push(new Particle (
						enemy.x, 
						enemy.y, 
						Math.random() * 3, 
						enemy.color, 
						{
						 x: (Math.random() - 0.5) * (Math.random() * 7), 
						 y: (Math.random() - 0.5) * (Math.random() * 7)
						}))
				}
				
				//shink enemy when its hit
				if (enemy.radius - 15 > 15) {
					score += 10
					ScoreEL.innerText = score
					gsap.to(enemy, {radius: enemy.radius - 15})
					setTimeout(() => {
						projectiles.splice(projectileIndex, 1) 
					}, 0)
				} else {
					if (timer > 500) {timer -=15} 
					// console.log(timer)
					score += 25
					ScoreEL.innerText = score
					setTimeout(() => {
						enemies.splice(emenyIndex, 1)
						projectiles.splice(projectileIndex, 1) 
					}, 0)
				}
			}
		})
	})
}

// add the possibility of interaction with the screen to be able to create the projectiles
addEventListener('click', () => {
	// look at the position of the 'click' to extraxt the x and y to set the projectile diretion
	const angle = Math.atan2(
		event.clientY - canvas.height / 2, 
		event.clientX - canvas.width / 2)
	const velocity = {
		x: Math.cos(angle) * 5,
		y: Math.sin(angle) * 5
	}
	
	// on every click done, it will 'push' (create) a object (a porjectile) and add it in the array	
	projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
	
})


StartGameBtn.addEventListener('click', () => {
	init()
	
	animate()
	spawnEnemies()
	
	modalEL.style.display = 'none'
})
