
const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

let canvas, bg, fg, cf, ntiles, tileWidth, tileHeight, map, tools, tool

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
	bg = canvas.getContext("2d")
	ntiles = 7
	tileWidth = 128
	tileHeight = 64
	bg.translate(w/2,tileHeight*2)

	drawMap()

	fg = document.getElementById('fg')
	fg.width = canvas.width
	fg.height = canvas.height
	cf = fg.getContext('2d')
	cf.translate(w/2,tileHeight*2)
	fg.addEventListener('mousemove', viz )
	fg.addEventListener('contextmenu', e => { e.preventDefault() } )
	fg.addEventListener('mouseup', e => {
		const pos = getPosition(e)
		if( pos.x >= 0 && pos.x < ntiles && pos.y >= 0 && pos.y < ntiles){
			map[pos.x][pos.y][0] = (e.which === 3) ? 0 : tool[0]
			map[pos.x][pos.y][1] = (e.which === 3) ? 0 : tool[1]
			drawMap()
			cf.clearRect(-w,-h,w*2,h*2)
		}
	})

	tools = $('#tools')

	for(let i = 0; i < 6; i++){
		for(let j = 0; j < 12; j++){
			const div = $c('div');
			div.style.display = "block"
			div.style.backgroundPosition = `-${j*130}px -${i*230}px`
			div.addEventListener('click', _ => { tool = [i,j] } )
			tools.appendChild( div )
		}
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

	const pos = getPosition(e)

  cf.clearRect(-w,-h,w*2,h*2)
  if( pos.x >= 0 && pos.x < ntiles && pos.y >= 0 && pos.y < ntiles)
    drawTile(cf,pos.x,pos.y,'rgba(0,0,0,0.2)')
}
