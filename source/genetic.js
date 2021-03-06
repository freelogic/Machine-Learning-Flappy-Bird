document.write('<script src="utils.js" type="text/javascript" ></script>');

/***********************************************************************************
/* Genetic Algorithm implementation
/***********************************************************************************/

var GeneticAlgorithm = function(max_units, top_units){
	this.max_units = max_units; // max number of units in population
	this.top_units = top_units; // number of top units (winners) used for evolving population
	
	if (this.max_units < this.top_units) this.top_units = this.max_units;
	
	this.Population = []; // array of all units in current population
	
	this.SCALE_FACTOR = 200; // the factor used to scale normalized input values
	this.SCALE_FACTOR_HEIGHT = this.SCALE_FACTOR/10; // the factor used to scale normalized input values
	this.SCALE_FACTOR_WIDTH = this.SCALE_FACTOR/2; // the factor used to scale normalized input values

	this.GA_TYPE_CROSSOVER_AND_MUTATION=0; //作者初始算法；
	this.GA_TYPE_MUTATION_ONLY=1;
	this.GENE_MUTATED_RATIO_DEFAULT=0.3;
	this.GENE_MUTATED_RATIO_FOR_Perceptron_bias=0.15;
	this.GENE_MUTATED_RATIO_FOR_Perceptron_weight=0.15;
}

GeneticAlgorithm.prototype = {
	// resets genetic algorithm parameters
	reset : function(){
		this.iteration = 1;	// current iteration number (it is equal to the current population number)
		//this.mutateRate = 1; // initial mutation rate
		this.mutateRate  =this.GENE_MUTATED_RATIO_DEFAULT;
		
		this.best_population = 0; // the population number of the best unit
		this.best_fitness = 0;  // the fitness of the best unit
		this.best_score = 0;	// the score of the best unit ever
	},
	
	// creates a new population
	createPopulation : function(){
		// clear any existing population
		this.Population.splice(0, this.Population.length);
		
		for (var i=0; i<this.max_units; i++){
			// create a new unit by generating a random Synaptic neural network
			// with 2 neurons in the input layer, 6 neurons in the hidden layer and 1 neuron in the output layer

			//经测试可以，但是比Perceptron(2, 6, 1)更慢才能进入稳定状态，因为2个隐藏层，变异算法容易破坏当前基因；
			//一般经过迭代到30-40次左右进入稳定进化；而（2,6,1）只要10次迭代就进入稳定进化了；
			//var newUnit = new synaptic.Architect.Perceptron(2, 12, 6, 1);

			var newUnit = new synaptic.Architect.Perceptron(5, 8, 1); //第一个数字是input神经元个数和input参数必须相等；
			//超过1个hidden layer不行，因为这类的遗传算法是简单的对神经元的bias的截距做交换，
			//并对weight/bias做随机调整，但因为截距是格式如：neurons[i]['bias']，如果是多个隐藏层，
			//将导致前后颠倒等毫不合理的遗传，破坏性太大；导致无法强化学习和继承优势！
			//除非对多个隐藏层的neuron有区别的适当进行变异；
			//var newUnit = new synaptic.Architect.Perceptron(2, 4, 4, 1);
			
			// set additional parameters for the new unit
			newUnit.index = i;
			newUnit.fitness = 0;
			newUnit.score = 0;
			newUnit.isWinner = false;
			
			// add the new unit to the population 
			this.Population.push(newUnit);
		}
	},
	
	// activates the neural network of an unit from the population 
	// to calculate an output action according to the inputs
	//activateBrain : function(bird, target){
	activateBrain : function(bird, state){
		// input 1: the horizontal distance between the bird and the target
		//var targetDeltaX = this.normalize(target.x, 700) * this.SCALE_FACTOR;
		//var target = paramMap.get('TargetPoint');//原作者传了一个游戏上下文的item过来不必要，这里仅传递point就行；
		var tp1 = state.get('TP1');
		var tp2 = state.get('TP2');
		//var target = tp1;
		var targetDeltaX = this.normalize(tp1.x, 700) * this.SCALE_FACTOR_HEIGHT;
		
		// input 2: the height difference between the bird and the target
		//var targetDeltaY = this.normalize(bird.y - tp1.y, 800) * this.SCALE_FACTOR;
		var targetDeltaY = this.normalize(bird.y - tp1.y, 800) * this.SCALE_FACTOR_WIDTH;

		var target2DeltaX = this.normalize(tp2.x, 700) * this.SCALE_FACTOR_HEIGHT;
		var target2DeltaY = this.normalize(bird.y - tp2.y, 800) * this.SCALE_FACTOR_WIDTH;

	    var lastFlappyActionStatus = state.get('lastFlappyActionStatus');
		// create an array of all inputs
		//第1个目标的，及第二个目标点，及上次flap与否的状态0/1；
		//只用当前目标，或加上下一个目标点，或再加上上次flap的状态，效果不明显；
		var inputs = [targetDeltaX, targetDeltaY,target2DeltaX, target2DeltaY,lastFlappyActionStatus];
		
		// calculate outputs by activating synaptic neural network of this bird
		var outputs = this.Population[bird.index].activate(inputs);
			
		// perform flap if output is greater than 0.5
		if (outputs[0] > 0.5) { bird.flap(); } else {bird.noflap();};
	},
	
	// evolves the population by performing selection, crossover and mutations on the units
	evolvePopulation : function(){
	    var Winners = this.selection();
		// 如果父代刷新纪录则更新top score；if the top winner has the best fitness in the history, store its achievement!
		if (Winners[0].fitness > this.best_fitness){
			this.best_population = this.iteration;
			this.best_fitness = Winners[0].fitness;
			this.best_score = Winners[0].score;
		}

		this.genetic_algorithm(this.GA_TYPE_MUTATION_ONLY);
        //this.genetic_algorithm(this.GA_TYPE_CROSSOVER_AND_MUTATION);

		// 子代排序
		this.Population.sort(function(unitA, unitB){
			return unitA.index - unitB.index;
		});
	},



	// selects the best units from the current population
	// 排队所有的鸟并返回最好的winner几个！
	selection : function(){
		// sort the units of the current population	in descending order by their fitness
		var sortedPopulation = this.Population.sort(
			function(unitA, unitB){
				return unitB.fitness - unitA.fitness;
			}
		);
		
		// mark the top units as the winners!
		for (var i=0; i<this.top_units; i++) this.Population[i].isWinner = true;
		
		// return an array of the top units from the current population
		return sortedPopulation.slice(0, this.top_units);
	},
	
	// performs a single point crossover between two parents
	crossOver : function(parentA, parentB) {
		// get a cross over cutting point
		//选择分割点，目前是10选4；
		var cutPoint = this.random(0, parentA.neurons.length-1);
		
		// swap 'bias' information between both parents:
		// 1. left side to the crossover point is copied from one parent
		// 2. right side after the crossover point is copied from the second parent
		for (var i = cutPoint; i < parentA.neurons.length; i++){
			var biasFromParentA = parentA.neurons[i]['bias'];
			parentA.neurons[i]['bias'] = parentB.neurons[i]['bias'];
			parentB.neurons[i]['bias'] = biasFromParentA;
		}

		return this.random(0, 1) == 1 ? parentA : parentB;
	},

	// performs random mutations on the offspring
	mutation : function (offspring){
		// mutate some 'bias' information of the offspring neurons
		for (var i = 0; i < offspring.neurons.length; i++){
			offspring.neurons[i]['bias'] = this.mutate(offspring.neurons[i]['bias']);
		}
		
		// mutate some 'weights' information of the offspring connections
		for (var i = 0; i < offspring.connections.length; i++){
			offspring.connections[i]['weight'] = this.mutate(offspring.connections[i]['weight']);
		}
		return offspring;
	},
	
	// mutates a gene
	mutate : function (gene){
		if (Math.random() < this.mutateRate) {
			var mutateFactor = 1 + ((Math.random() - 0.5) * 3 + (Math.random() - 0.5));
			gene *= mutateFactor;
		}
		return gene;
	},
	
	random : function(min, max){
		return Math.floor(Math.random()*(max-min+1) + min);
	},
	
	getRandomUnit : function(array){
		return array[this.random(0, array.length-1)];
	},
	
	normalize : function(value, max){
		// clamp the value between its min/max limits
		if (value < -max) value = -max;
		else if (value > max) value = max;
		
		// normalize the clamped value
		return (value/max);
	},

	//////////////////////////////////////////////////////////////////////////////////////////
	//遗传算法（选择器）
    genetic_algorithm : function(gaType) {
        //定义默认遗传算法的类型常量；
        //var GA_TYPE_CROSSOVER_AND_MUTATION=0;
	    //var GA_TYPE_MUTATION_ONLY=1;

	    var gt;
	    if (isValid(gaType)==false) {
	      gt = this.GA_TYPE_MUTATION_ONLY; //默认为随机变异算法
	    } else {
	      gt = gaType;
	    }
        //根据类型来处理遗传算法具体的子代继承处理；
	    switch(gt) {
            case this.GA_TYPE_MUTATION_ONLY:
                this.ga_by_mutation_only();
                break;
            case this.GA_TYPE_CROSSOVER_AND_MUTATION:
                this.ga_crossover_and_mutation();
                break;
            default:
                this.ga_by_mutation_only();
        };
    },


	//遗传算法（选择器）
	//var GA_TYPE_CROSSOVER_AND_MUTATION=0;
    ga_crossover_and_mutation : function() {
        var Winners = this.selection();
    	// fill the rest of the next population with new units using crossover and mutation
		// 此处循环，跳过winner，只修订（生成）子代6个！
		for (var i=this.top_units; i<this.max_units; i++){
			var parentA, parentB, offspring;

			if (i == this.top_units){
				// 子代生成策略1：继承两个最好的父代；（只生成1个）
				// offspring is made by a crossover of two best winners
				parentA = Winners[0].toJSON();
				parentB = Winners[1].toJSON();
				offspring = this.crossOver(parentA, parentB);
			} else if (i < this.max_units-2){
				// 子代生成策略2：继承两个随机的winner（包含最好的父代）；（只生成6-2=4个）
				// offspring is made by a crossover of two random winners
				parentA = this.getRandomUnit(Winners).toJSON();
				parentB = this.getRandomUnit(Winners).toJSON();
				offspring = this.crossOver(parentA, parentB);
			} else {
			    // 子代生成策略3：继承两个最好的父代；（只生成1个）
				// offspring is a random winner
				offspring = this.getRandomUnit(Winners).toJSON();
			}

            //父代：总10个，最终全死，去winner4个，其他loser丢弃他们的基因或神经网络模型（w+bias）
            //子代：总10个，直接原封不动取上次父代的winner4个，再通过4个winner生成6个（策略1有1个；策略2有4个；策略3有1个）

			// mutate the offspring
			offspring = this.mutation(offspring);

			// create a new unit using the neural network from the offspring
			var newUnit = synaptic.Network.fromJSON(offspring);
			newUnit.index = this.Population[i].index;
			newUnit.fitness = 0;
			newUnit.score = 0;
			newUnit.isWinner = false;

			// update population by changing the old unit with the new one
			this.Population[i] = newUnit;
		}
    },

	//变异算法：类似神经网络中的dropout方法，简单丢弃/置为0；
	mutationUsingDropout : function(bird,weightMutatedRatio,biasMutatedRatio) {
	    // 定义默认变异因子
	    var GENE_MUTATED_RATIO_DEFAULT = 0.3;
	    var ratio;
	    if (isValid(weightMutatedRatio) == false) {
	      weightMutatedRatio = GENE_MUTATED_RATIO_DEFAULT/3;
	    }else if (isValid(biasMutatedRatio) == false) {
	      biasMutatedRatio = GENE_MUTATED_RATIO_DEFAULT;
	    };
	    //alert("weightMutatedRatio"+p2(weightMutatedRatio));

		//随机变异一定概率比例的神经元的bias；
		for (var i = 0; i < bird.neurons.length; i++){
		    //INPUT/OUTPUT神经元不需要变异；
			if (Math.random() < biasMutatedRatio && bird.neurons[i].layer != "input" && bird.neurons[i].layer != "output") {
			    bird.neurons[i]['bias'] = 0;//just simple to dropout
			};
		};
		//随机变异一定概率比例的神经元的weight；
		for (var i = 0; i < bird.connections.length; i++){
		    if (Math.random() < weightMutatedRatio) {
			    bird.connections[i]['weight'] = 0;//just simple to dropout
			}
		}
		return bird;
	},

    //遗传算法: 随机选取优胜者（比如40%，即10选4），并给予一定变异；
    ga_by_mutation_only : function() {
        var Winners = this.selection();
		for (var i=this.top_units; i<this.max_units; i++){
			offspring = this.mutationUsingDropout(this.getRandomUnit(Winners).toJSON(),this.GENE_MUTATED_RATIO_FOR_Perceptron_weight,this.GENE_MUTATED_RATIO_FOR_Perceptron_bias);

			// mutate the offspring
			offspring = this.mutation(offspring);

			// create a new unit using the neural network from the offspring
			var newUnit = synaptic.Network.fromJSON(offspring);
			newUnit.index = this.Population[i].index;
			newUnit.fitness = 0;
			newUnit.score = 0;
			newUnit.isWinner = false;

			// update population by changing the old unit with the new one
			this.Population[i] = newUnit;
		};
    },
}