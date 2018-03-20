/***********************************************************************************
/* Create a new Phaser Game on window load
/***********************************************************************************/

window.onload = function () {
	var game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'game');
	
	game.state.add('Main', App.Main);
	game.state.start('Main');
};

/***********************************************************************************
/* Main program
/***********************************************************************************/

var App = {};

App.Main = function(game){
	this.STATE_INIT = 1;
	this.STATE_START = 2;
	this.STATE_PLAY = 3;
	this.STATE_GAMEOVER = 4;
	
	//this.BARRIER_DISTANCE = 300;  //左右两棵树之间的距离，源程序默认值是300；
	this.BARRIER_DISTANCE = 200;
	this.BARRIER_FIRST_DISTANCE = this.BARRIER_DISTANCE * 2; //每次重新启动后，左边第一颗树距离屏幕最左端鸟儿触发的距离；
	//讨论及测试结论：
	//如果将BARRIER_FIRST_DISTANCE设为原来的700，远大于两颗树之间的距离200，则会让上次成功的鸟（原始算法是4个）很容易再下次情况下失败！
	//因为开始这700是INPUT1，而且仅在restart的情况下才有，强化学习一遍遍的retry，它占的比重少，情况只在restart后几秒出现，不容易学习！
	//而如果将这个参数调节为和之后所有的两棵树水平间距相同，也就是等于有利于将上期的优势鸟，更容易保留到下期依然为优势鸟，因为它可以不用在
	//RESTART之后这个INPUT1和平时飞行不太一样的而且出现情况少的无法很好学习的这段RESTART时间内就随机的死掉！
	//结论：BARRIER_FIRST_DISTANCE和BARRIER_DISTANCE，差异越小，更有利于成功鸟的继承和保活，分数就更快更高！
	//详见“genetic.js”中函数“evolvePopulation”的解释；


}

App.Main.prototype = {
	preload : function(){
	    //通过框架提供的函数拿图片（一张图片包含很多子图，切图出来）
		this.game.load.spritesheet('imgBird', 'assets/img_bird.png', 36, 36, 20);
		this.game.load.spritesheet('imgTree', 'assets/img_tree.png', 90, 400, 2);
		this.game.load.spritesheet('imgButtons', 'assets/img_buttons.png', 110, 40, 3);
		
		this.game.load.image('imgTarget', 'assets/img_target.png');
		this.game.load.image('imgGround', 'assets/img_ground.png');
		this.game.load.image('imgPause', 'assets/img_pause.png');
		this.game.load.image('imgLogo', 'assets/img_logo.png');
		//按照框架要求，提供了font字体文件及背景，供逻辑使用；
		this.load.bitmapFont('fnt_chars_black', 'assets/fnt_chars_black.png', 'assets/fnt_chars_black.fnt');
		this.load.bitmapFont('fnt_digits_blue', 'assets/fnt_digits_blue.png', 'assets/fnt_digits_blue.fnt');
		this.load.bitmapFont('fnt_digits_green', 'assets/fnt_digits_green.png', 'assets/fnt_digits_green.fnt');
		this.load.bitmapFont('fnt_digits_red', 'assets/fnt_digits_red.png', 'assets/fnt_digits_red.fnt');
	},
	
	create : function(){
		// set scale mode to cover the entire screen
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignVertically = true;
		this.scale.pageAlignHorizontally = true;

		// set a blue color for the background of the stage
		this.game.stage.backgroundColor = "#89bfdc";
		
		// keep game running if it loses the focus
		this.game.stage.disableVisibilityChange = true;
		
		// start the Phaser arcade physics engine
		this.game.physics.startSystem(Phaser.Physics.ARCADE);

		// set the gravity of the world
		// todo: 怎么计算？尺度和鸟的-600往上飞是一致的？
		this.game.physics.arcade.gravity.y = 1300; //设定游戏世界的重力因子(效果)
		
		// create a new Genetic Algorithm with a population of 10 units which will be evolving by using 4 top units
		//这里只给出了生成(遗传)算法的接口（10选4策略）
		//这里可以研究一下；
		this.GA = new GeneticAlgorithm(10, 4);
		
		// create a BirdGroup which contains a number of Bird objects
		this.BirdGroup = this.game.add.group();
		for (var i = 0; i < this.GA.max_units; i++){
			this.BirdGroup.add(new Bird(this.game, 0, 0, i));
		}		
	
		// create a BarrierGroup which contains a number of Tree Groups
		// (each Tree Group contains a top and bottom Tree object)
		// 1个BarrierGroup是多组TREEGROUP，而1个TREEGROUP是上下2两棵树；
		this.BarrierGroup = this.game.add.group();		
		for (var i = 0; i < 4; i++){
			new TreeGroup(this.game, this.BarrierGroup, i);
		}
		
		// create a Target Point sprite
		//目标食物点（两棵树之间）
		this.TargetPoint = this.game.add.sprite(0, 0, 'imgTarget');
		this.TargetPoint.anchor.setTo(0.5);
		
		// create a scrolling Ground object
		this.Ground = this.game.add.tileSprite(0, this.game.height-100, this.game.width-370, 100, 'imgGround');
		this.Ground.autoScroll(-300, 0);//底部背景草地的平移速度不同，营造视觉层次感效果！
		
		// create a BitmapData image for drawing head-up display (HUD) on it
		// 右侧的计分统计显示
		this.bmdStatus = this.game.make.bitmapData(370, this.game.height);
		this.bmdStatus.addToWorld(this.game.width - this.bmdStatus.width, 0);
		
		// create text objects displayed in the HUD header
		new Text(this.game, 1047, 10, "In1  In2  Out", "right", "fnt_chars_black"); // Input 1 | Input 2 | Output
		this.txtPopulationPrev = new Text(this.game, 1190, 10, "", "right", "fnt_chars_black"); // No. of the previous population
		this.txtPopulationCurr = new Text(this.game, 1270, 10, "", "right", "fnt_chars_black"); // No. of the current population
		
		// create text objects for each bird to show their info on the HUD
		this.txtStatusPrevGreen = [];	// array of green text objects to show info of top units from the previous population
		this.txtStatusPrevRed = [];		// array of red text objects to show info of weak units from the previous population
		this.txtStatusCurr = [];		// array of blue text objects to show info of all units from the current population
		
		for (var i=0; i<this.GA.max_units; i++){
			var y = 46 + i*50;
			
			new Text(this.game, 1110, y, "Fitness:\nScore:", "right", "fnt_chars_black")
			this.txtStatusPrevGreen.push(new Text(this.game, 1190, y, "", "right", "fnt_digits_green"));
			this.txtStatusPrevRed.push(new Text(this.game, 1190, y, "", "right", "fnt_digits_red"));
			this.txtStatusCurr.push(new Text(this.game, 1270, y, "", "right", "fnt_digits_blue"));
		}
		
		// create a text object displayed in the HUD footer to show info of the best unit ever born
		this.txtBestUnit = new Text(this.game, 1095, 580, "", "center", "fnt_chars_black");
		
		// create buttons
		this.btnRestart = this.game.add.button(920, 620, 'imgButtons', this.onRestartClick, this, 0, 0);
		this.btnMore = this.game.add.button(1040, 620, 'imgButtons', this.onMoreGamesClick, this, 2, 2);
		this.btnPause = this.game.add.button(1160, 620, 'imgButtons', this.onPauseClick, this, 1, 1);
		this.btnLogo = this.game.add.button(910, 680, 'imgLogo', this.onMoreGamesClick, this);
		
		// create game paused info
		this.sprPause = this.game.add.sprite(455, 360, 'imgPause');
		this.sprPause.anchor.setTo(0.5);
		this.sprPause.kill();
		
		// add an input listener that can help us return from being paused
		this.game.input.onDown.add(this.onResumeClick, this);
				
		// set initial App state
		this.state = this.STATE_INIT;
	},
	
	update : function(){		
		switch(this.state){
			case this.STATE_INIT: // init genetic algorithm
				this.GA.reset();
				this.GA.createPopulation();
				
				this.state = this.STATE_START;
				break;
				
			case this.STATE_START: // start/restart the game
				// update text objects
				this.txtPopulationPrev.text = "GEN "+(this.GA.iteration-1);
				this.txtPopulationCurr.text = "GEN "+(this.GA.iteration);
				
				this.txtBestUnit.text = 
					"The best unit was born in generation "+(this.GA.best_population)+":"+
					"\nFitness = "+this.GA.best_fitness.toFixed(2)+" / Score = " + this.GA.best_score;
				
				// reset score and distance
				this.score = 0;
				this.distance = 0;
				
				// reset barriers
				this.BarrierGroup.forEach(function(barrier){
					//barrier.restart(700 + barrier.index * this.BARRIER_DISTANCE);
					barrier.restart(this.BARRIER_FIRST_DISTANCE + barrier.index * this.BARRIER_DISTANCE);
				}, this);
				
				// define pointer to the first barrier
				this.firstBarrier = this.BarrierGroup.getAt(0);
				
				// define pointer to the last barrier
				this.lastBarrier = this.BarrierGroup.getAt(this.BarrierGroup.length-1);
				
				// define pointer to the current target barrier
				this.targetBarrier = this.firstBarrier;
				
				// start a new population of birds
				this.BirdGroup.forEach(function(bird){
					bird.restart(this.GA.iteration);
					
					if (this.GA.Population[bird.index].isWinner){
						this.txtStatusPrevGreen[bird.index].text = bird.fitness_prev.toFixed(2)+"\n" + bird.score_prev;
						this.txtStatusPrevRed[bird.index].text = "";
					} else {
						this.txtStatusPrevGreen[bird.index].text = "";
						this.txtStatusPrevRed[bird.index].text = bird.fitness_prev.toFixed(2)+"\n" + bird.score_prev;
					}
				}, this);
							
				this.state = this.STATE_PLAY;
				break;
				
			case this.STATE_PLAY: // play Flappy Bird game by using genetic algorithm AI
				// update position of the target point
				this.TargetPoint.x = this.targetBarrier.getGapX();
				this.TargetPoint.y = this.targetBarrier.getGapY();
				
				var isNextTarget = false; // flag to know if we need to set the next target barrier
				
				this.BirdGroup.forEachAlive(function(bird){
					// calculate the current fitness and the score for this bird
					//鸟的判决函数（fitness）=总距离-鸟到目标点的距离，就是当前的fitness，越大越好；
					bird.fitness_curr = this.distance - this.game.physics.arcade.distanceBetween(bird, this.TargetPoint);
					bird.score_curr = this.score;
					
					// check collision between a bird and the target barrier
					//TODO：待研究
					this.game.physics.arcade.collide(bird, this.targetBarrier, this.onDeath, null, this);
					
					if (bird.alive){
						// check if a bird passed through the gap of the target barrier
						// 只要有一个bird超越了目标点(上下树的中点)就设定下一个目标点RES
						if (bird.x > this.TargetPoint.x) isNextTarget = true;
						
						// check if a bird flies out of vertical bounds
						//飞出上下界限(飞出屏幕)则设定为死亡
						if (bird.y<0 || bird.y>610) this.onDeath(bird);
						
						// perform a proper action (flap yes/no) for this bird by activating its neural network
						//根据神经网络判断当前的input1/2输入后，当前的神经网络NN给出了决策是flap煽动翅膀？还是noflap模拟重力下坠？
						this.GA.activateBrain(bird, this.TargetPoint);
					}
				}, this);
				
				// if any bird passed through the current target barrier then set the next target barrier
				if (isNextTarget){
					this.score++;
					this.targetBarrier = this.getNextBarrier(this.targetBarrier.index);
				}
				
				// if the first barrier went out of the left bound then restart it on the right side
				// 循环用树：当第一颗树移出左边界（屏幕），宽度为负的一棵树宽度，就表示完全移出了屏幕；
				// 则将其节点添加到最后一棵树的右边并间隔一个barrier_distance的距离；
				if (this.firstBarrier.getWorldX() < -this.firstBarrier.width){
					this.firstBarrier.restart(this.lastBarrier.getWorldX() + this.BARRIER_DISTANCE);
					
					this.firstBarrier = this.getNextBarrier(this.firstBarrier.index);
					this.lastBarrier = this.getNextBarrier(this.lastBarrier.index);
				}
				
				// increase the travelled distance
				this.distance += Math.abs(this.firstBarrier.topTree.deltaX);
				
				this.drawStatus();				
				break;
				
			case this.STATE_GAMEOVER: // when all birds are killed evolve the population
				this.GA.evolvePopulation();
				this.GA.iteration++;
					
				this.state = this.STATE_START;
				break;
		}
	},
	
	drawStatus : function(){
		this.bmdStatus.fill(180, 180, 180); // clear bitmap data by filling it with a gray color
		this.bmdStatus.rect(0, 0, this.bmdStatus.width, 35, "#8e8e8e"); // draw the HUD header rect
			
		this.BirdGroup.forEach(function(bird){
			var y = 85 + bird.index*50;
								
			this.bmdStatus.draw(bird, 25, y-25); // draw bird's image
			this.bmdStatus.rect(0, y, this.bmdStatus.width, 2, "#888"); // draw line separator
			
			if (bird.alive){
				var brain = this.GA.Population[bird.index].toJSON();
				var scale = this.GA.SCALE_FACTOR*0.02;
				
				this.bmdStatus.rect(62, y, 9, -(50 - brain.neurons[0].activation/scale), "#000088"); // input 1
				this.bmdStatus.rect(90, y, 9, brain.neurons[1].activation/scale, "#000088"); // input 2
				
				if (brain.neurons[brain.neurons.length-1].activation<0.5) this.bmdStatus.rect(118, y, 9, -20, "#880000"); // output: flap = no
				else this.bmdStatus.rect(118, y, 9, -40, "#008800"); // output: flap = yes
			}
			
			// draw bird's fitness and score
			this.txtStatusCurr[bird.index].setText(bird.fitness_curr.toFixed(2)+"\n" + bird.score_curr);
		}, this);
	},
	
	getNextBarrier : function(index){
		return this.BarrierGroup.getAt((index + 1) % this.BarrierGroup.length);
	},
	
	onDeath : function(bird){
		this.GA.Population[bird.index].fitness = bird.fitness_curr;
		this.GA.Population[bird.index].score = bird.score_curr;
					
		bird.death();
		if (this.BirdGroup.countLiving() == 0) this.state = this.STATE_GAMEOVER;
	},
	
	onRestartClick : function(){
		this.state = this.STATE_INIT;
    },
	
	onMoreGamesClick : function(){
		window.open("http://www.askforgametask.com", "_blank");
	},
	
	onPauseClick : function(){
		this.game.paused = true;
		this.btnPause.input.reset();
		this.sprPause.revive();
    },
	
	onResumeClick : function(){
		if (this.game.paused){
			this.game.paused = false;
			this.btnPause.input.enabled = true;
			this.sprPause.kill();
		}
    }
}

/***********************************************************************************
/* TreeGroup Class extends Phaser.Group
/***********************************************************************************/	
	
var TreeGroup = function(game, parent, index){
	Phaser.Group.call(this, game, parent);

	this.index = index;

	this.topTree = new Tree(this.game, 0); // create a top Tree object
	this.bottomTree = new Tree(this.game, 1); // create a bottom Tree object
	
	this.add(this.topTree); // add the top Tree to this group
	this.add(this.bottomTree); // add the bottom Tree to this group

	//CC: additional parameters
	this.GAP_BETWEEN_TOPTREE_AND_BOTTOMTREE = 100; //上下两棵树之间的(垂直)距离GAP
	this.V_BIRD_FLY = -150; //BIRD水平飞行的速度;
	this.TREE_HEIGHT_RATIO_FACTOR = 0.75; //1颗树高度的多少倍；越大，左右相邻的两排树的高低相差越大，开口通过的通道上次平移越大，难度越大；
	this.TREE_START_Y_FACTOR = -50; //一排树（上下两颗）的上面起始位置的偏移因子，越大，则2颗树越靠下，则2颗树开口通道（鸟飞过）越靠下；难度不变；
};

TreeGroup.prototype = Object.create(Phaser.Group.prototype);
TreeGroup.prototype.constructor = TreeGroup;

TreeGroup.prototype.restart = function(x) {
	this.topTree.reset(0, 0);
	//this.bottomTree.reset(0, this.topTree.height + 130);
	this.bottomTree.reset(0, this.topTree.height + this.GAP_BETWEEN_TOPTREE_AND_BOTTOMTREE);

	this.x = x;
	//这里控制一排树（上下两颗加上中间间隔）的显示顶部位置，从而也会影响中间给bird飞过的间隙的上下y位置；
	//this.y = this.game.rnd.integerInRange(110-this.topTree.height, -20);

	//如下定义了一个倍率因子，让一排树的y最高点起点产生的范围[min,max]是TREE的多少倍？tree=400像素；
	this.y = this.game.rnd.integerInRange(0 - this.topTree.height * this.TREE_HEIGHT_RATIO_FACTOR+this.TREE_START_Y_FACTOR, 0+this.TREE_START_Y_FACTOR);

	//this.setAll('body.velocity.x', -200); //velocity：速率
	this.setAll('body.velocity.x', this.V_BIRD_FLY); //velocity：飞鸟(或称“移屏”)速率，太快将无法学习到收敛和始终成功，因为可能物理上飞行无法适应突变，翅膀太慢！
};

TreeGroup.prototype.getWorldX = function() {
	return this.topTree.world.x;
};

TreeGroup.prototype.getGapX = function() {
	return this.bottomTree.world.x + this.bottomTree.width;//求两树中心点的水平位置X
};

TreeGroup.prototype.getGapY = function() {
	//return this.bottomTree.world.y - 65;
	return this.bottomTree.world.y - this.GAP_BETWEEN_TOPTREE_AND_BOTTOMTREE/2; //求两树中心点的高Y
};

/***********************************************************************************
/* Tree Class extends Phaser.Sprite
/***********************************************************************************/

var Tree = function(game, frame) {
	Phaser.Sprite.call(this, game, 0, 0, 'imgTree', frame);
	
	this.game.physics.arcade.enableBody(this);
	
	this.body.allowGravity = false;
	this.body.immovable = true;
};

Tree.prototype = Object.create(Phaser.Sprite.prototype);
Tree.prototype.constructor = Tree;

/***********************************************************************************
/* Bird Class extends Phaser.Sprite
/***********************************************************************************/

var Bird = function(game, x, y, index) {
	Phaser.Sprite.call(this, game, x, y, 'imgBird');
	   
	this.index = index;
	this.anchor.setTo(0.5);
	  
	// add flap animation and start to play it
	var i=index*2;
	this.animations.add('flap', [i, i+1]);
	this.animations.play('flap', 8, true);

	// enable physics on the bird
	this.game.physics.arcade.enableBody(this);

	//CC: additional parameters
	this.V_BIRD_FLAPPY = -750; //BIRD垂直往上飞(扑打翅膀)的速度;
};

Bird.prototype = Object.create(Phaser.Sprite.prototype);
Bird.prototype.constructor = Bird;

Bird.prototype.restart = function(iteration){
	this.fitness_prev = (iteration == 1) ? 0 : this.fitness_curr;
	this.fitness_curr = 0;
	
	this.score_prev = (iteration == 1) ? 0: this.score_curr;
	this.score_curr = 0;
	
	this.alpha = 1;
	this.reset(150, 300 + this.index * 20);
};

Bird.prototype.flap = function(){
	//this.body.velocity.y = -400;
	this.body.velocity.y = this.V_BIRD_FLAPPY;
};

Bird.prototype.death = function(){
	this.alpha = 0.5;
	this.kill();
};

/***********************************************************************************
/* Text Class extends Phaser.BitmapText
/***********************************************************************************/

var Text = function(game, x, y, text, align, font){
	Phaser.BitmapText.call(this, game, x, y, font, text, 16);
	
	this.align = align;
	
	if (align == "right") this.anchor.setTo(1, 0);
	else this.anchor.setTo(0.5);
	
	this.game.add.existing(this);
};

Text.prototype = Object.create(Phaser.BitmapText.prototype);
Text.prototype.constructor = Text;

