
const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

let canvas, bg, fg, cf, ntiles, tileWidth, tileHeight, map, tools, tool, activeTool, isPlacing

/* texture from https://opengameart.org/content/isometric-landscape */
const texture = new Image()
texture.src = "textures/01_130x66_130x230.png"
texture.onload = _ => init()



const init = function(){

	tool = [0,0]

	map = [
		[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
		[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
		[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
		[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
		[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
		[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
		[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]
	]

	canvas = document.getElementById("bg")
	canvas.width = 910
	canvas.height = 666
	w = 910
	h = 462
	texWidth = 12
	texHeight = 6
	bg = canvas.getContext("2d")
	ntiles = 7
	tileWidth = 128
	tileHeight = 64
	bg.translate(w/2,tileHeight*2)

	loadHashState(document.location.hash.substring(1))

	drawMap()

	fg = document.getElementById('fg')
	fg.width = canvas.width
	fg.height = canvas.height
	cf = fg.getContext('2d')
	cf.translate(w/2,tileHeight*2)
	fg.addEventListener('mousemove', viz)
	fg.addEventListener('contextmenu', e => { e.preventDefault() } )
	fg.addEventListener('mouseup', unclick)
	fg.addEventListener('mousedown', click)
	fg.addEventListener('touchend', click)
	fg.addEventListener('pointerup', click)

	tools = $('#tools')

	let toolCount = 0
	for(let i = 0; i < texHeight; i++){
		for(let j = 0; j < texWidth; j++){
			const div = $c('div');
			div.id = 'tool_' + toolCount++
			div.style.display = "block"
			div.style.backgroundPosition = `-${j*130}px -${i*230}px`
			div.addEventListener('click', e => {
				tool = [i,j]
				if (activeTool) {
					document.getElementById(activeTool).classList.remove('selected')
				}
				activeTool = e.target.id
				document.getElementById(activeTool).classList.add('selected')
			})
			tools.appendChild( div )
		}
	}

}

const click = e => {
	const pos = getPosition(e)
	if (pos.x >= 0 && pos.x < ntiles && pos.y >= 0 && pos.y < ntiles) {
		
		map[pos.x][pos.y][0] = (e.which === 3) ? 0 : tool[0]
		map[pos.x][pos.y][1] = (e.which === 3) ? 0 : tool[1]
		isPlacing = true

		drawMap()
		cf.clearRect(-w, -h, w * 2, h * 2)
	}
	updateHashState();
}

// From https://stackoverflow.com/a/36046727
ToBase64 = function (u8) {
	return btoa(String.fromCharCode.apply(null, u8));
}
FromBase64 = function (str) {
	return atob(str).split('').map(function (c) { return c.charCodeAt(0); });
}

function updateHashState() {
	let c = 0
	const u8 = new Uint8Array(ntiles*ntiles);
	for(let i = 0; i < ntiles; i++){
		for(let j = 0; j < ntiles; j++){
			u8[c++] = map[i][j][0]*texWidth + map[i][j][1]
		}
	}
	const state = ToBase64(u8);
	history.replaceState(undefined, undefined, "#"+state)
}

function loadHashState(state) {
	let u8 = FromBase64(state)
	console.log(u8)
	let c = 0
	for(let i = 0; i < ntiles; i++) {
		for(let j = 0; j < ntiles; j++) {
			const t = u8[c++] || 0
			const x = Math.trunc(t / texWidth)
			const y = Math.trunc(t % texWidth)
			map[i][j] = [x,y]
		}
	}
}

const unclick = e => {
	if (isPlacing == true) {
		isPlacing = false
	}
}

const drawMap = function(){
	bg.clearRect(-w,-h,w*2,h*2)
	for(let i = 0; i < ntiles; i++){
		for(let j = 0; j < ntiles; j++){
			drawImageTile(bg,i,j,map[i][j][0],map[i][j][1])
		}
	}
}

const drawTile = function(c,x,y,color){
	c.save()
  c.translate((y-x) * tileWidth/2,(x+y)*tileHeight/2)
  c.beginPath()
  c.moveTo(0,0)
  c.lineTo(tileWidth/2,tileHeight/2)
  c.lineTo(0,tileHeight)
  c.lineTo(-tileWidth/2,tileHeight/2)
  c.closePath()
  c.fillStyle = color
  c.fill()
  c.restore()
}

const drawImageTile = function(c,x,y,i,j){
	c.save()
  c.translate((y-x) * tileWidth/2,(x+y)*tileHeight/2)
  j *= 130
  i *= 230
	c.drawImage(texture,j,i,130,230,-65,-130,130,230)
	c.restore()
}

const getPosition = e => {
	let x = e.offsetX, y = e.offsetY - tileHeight*2;

  const _y = ( y / ( (ntiles * tileHeight) / ntiles ) )
  const _x = ( (x-tileWidth/2) / ( (ntiles * tileWidth) / ntiles ) )-ntiles/2
  x = Math.round(_y-_x-1)
  y = Math.round(_x+_y)
  return {x,y}
}

const viz = function(e){

	if (isPlacing) {
		click(e)
	}
	const pos = getPosition(e)

  cf.clearRect(-w,-h,w*2,h*2)
  if( pos.x >= 0 && pos.x < ntiles && pos.y >= 0 && pos.y < ntiles)
	drawTile(cf,pos.x,pos.y,'rgba(0,0,0,0.2)')


}
