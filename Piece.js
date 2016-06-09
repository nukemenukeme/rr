(function(window) {
	var Piece = function(canvas, config)
	{
		this.initialize(canvas, config);
	}
	var p = Piece.prototype = new BasePiece();
	//
	p.initialize = function(canvas, config)
	{
		BasePiece.prototype.initialize.apply(this, [canvas, config]);
		this.initInteraction();
	}

	p.onKeyUp = function(e)
	{
		BasePiece.prototype.onKeyUp.apply(this, [e]);
		if (!this.config.debug) return;
		var c = String.fromCharCode(e.which);
		if (c=="R") this.reset();
	}
	p.initInteraction = function()
	{
		var that = this;
		var type = isMobile?"stagemousedown":"stagemouseup";
		this.stage.addEventListener(type, this.handleClick.bind(this));
	}

	p.setSize = function(w,h,dpr)
	{
		this.dpr = dpr;
		this.width = Math.floor(w*dpr);
		this.height = Math.floor(h*dpr);
		this.area = this.width*this.height;
		this.diam = Math.sqrt(w*w+h*h)*dpr;
		log("setSize",w,this.width);
		var r = this.radius = Math.sqrt(this.area * this.config.ballSize / Math.PI);
		this.distSquare = r*r*4;
		this.bounds = [r,r,this.width-r, this.height-r];
		if (this.tickLast) this.reset();
	}

	p.start = function()
	{
		BasePiece.prototype.start.apply(this);
		log("start",this.width);
		this.ratios = [0,1];
		this.balls = [];
		this.resetCount = 0;
		this.bg = new Shape();
		if (this.width) this.reset();
	}

	p.reset = function()
	{
		this.balls.length = 0;
		this.stage.removeAllChildren();
		this.stage.addChild(this.bg);
		//redraw bg
		this.bg.x = this.width*.5;
		this.bg.y = this.height*.5;
		var r = this.diam/2;
		this.bg.graphics.c().lf(this.config.colors,this.ratios,-r,0,r,0).dc(0,0,r);
		this.bg.rotation = Math.random()*360;
		this.bg.rs = this.config.bgRotation * (Math.random()<.5?1:-1);//rotation speed
	}


	p.handleClick = function(e)
	{
		if (this.config.noBalls) return;
		var x = e.stageX, y = e.stageY;
		var n = this.balls.length;
		var dsq2 = this.radius*this.radius, dsq = this.distSquare * this.config.distanceMin;
		for (var j=0;j<n;j++)
		{
			var b1 = this.balls[j];
			var dx = b1.x-x, dy = b1.y-y;
			var bd = dx*dx+dy*dy;
			if (bd<dsq2)
			{
				this.deleteBall(j);
				return;
			}
			if (bd<dsq)
			{
				return;
			}
		}
		this.addBall(x,y);
	}

	p.deleteBall = function(idx)
	{
		var b = this.balls[idx];
		this.stage.removeChild(b);
		this.balls.splice(idx,1);
	}

	p.addBall = function(x,y)
	{
		var r = this.radius;
		var s = this.speed = this.config.ballSpeed * this.diam;
		var rs = this.config.ballRotation;
		var b = new Shape();
		b.x = x;
		b.y = y;
		var a = Math.random()*Math.PI*2;
		b.vx = Math.cos(a) * s;
		b.vy = Math.sin(a) * s;
		b.rs = rs * (Math.random()<.5?1:-1);//rotation speed
		b.rotation = Math.random()*360;
		//draw
		//b.graphics.s('#000').ss(1).dc(0,0,r);
		b.graphics.lf(this.config.colors,this.ratios,-r,0,r,0).dc(0,0,r);
		//add/store
		this.stage.addChild(b);
		this.balls.push(b);
	}

	p.normalizeSpeed = function(ball)
	{
		var b = ball;
		var nf = this.speed / Math.sqrt(b.vx*b.vx+b.vy*b.vy);
		b.vx *= nf;
		b.vy *= nf;
	}

	p.update = function()
	{
		this.bg.rotation += this.bg.rs;
		var n = this.balls.length;
		var bs = this.bounds, xmin = bs[0], xmax = bs[2], ymin = bs[1], ymax = bs[3];
		var d = this.radius*2, dsq = this.distSquare;
		var sc = this.config.ballSpeedConstant;
		var np = 10;//nr of passes
		for (var p=0;p<np;p++)
		{
			for (var i=0;i<n;i++)
			{
				var b = this.balls[i];
				//collisions
				for (var j=i+1;j<n;j++)
				{
					var b1 = this.balls[j];
					var dx = b1.x-b.x, dy = b1.y-b.y;
					var db = dx*dx+dy*dy;
					if (db<dsq)
					{
						var a = Math.atan2(dy,dx);
						var ax = Math.cos(a)*d - dx;
						var ay = Math.sin(a)*d - dy;
						b.vx -= ax;
						b.vy -= ay;
						b1.vx += ax;
						b1.vy += ay;
						if (sc)
						{
							//normalize speeds
							this.normalizeSpeed(b);
							this.normalizeSpeed(b1);
						}
					}
				}
				//move
				b.x += b.vx/np;
				b.y += b.vy/np;
				if (b.x>xmax)
				{
					b.x = xmax;
					b.vx *= -1;
				}
				else if (b.x < xmin) {
					b.x = xmin;
					b.vx *= -1;
				}
				if (b.y>ymax)
				{
					b.y = ymax;
					b.vy *= -1;
				}
				else if (b.y < ymin) {
					b.y = ymin;
					b.vy *= -1;
				}
			}
		}
		for (var i=0;i<n;i++)
		{
			var b = this.balls[i];
			b.rotation += b.rs;
		}
		return true;
	}


	window.Piece = Piece;

	// Utils
	var RandomUtil = {};
	RandomUtil.between = function(min, max, integer, extremeFactor)
	{
		var p = Math.random();
		if (extremeFactor)
		{
			var f = Math.pow((p < .5) ? p * 2 : (1 - p) * 2, extremeFactor);
			p = (p < .5) ? f / 2 : 1 - (f / 2);
		}
		if (integer) return Math.floor(min + p * (1+max-min));
		else return min + p * (max-min);
	}

}(window));
