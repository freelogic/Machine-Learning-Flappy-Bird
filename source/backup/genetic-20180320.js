/***********************************************************************************
/* Genetic Algorithm implementation
/***********************************************************************************/

var GeneticAlgorithm = function(max_units, top_units){
	this.max_units = max_units; // max number of units in population
	this.top_units = top_units; // number of top units (winners) used for evolving population
	
	if (this.max_units < this.top_units) this.top_units = this.max_units;
	
	this.Population = []; // array of all units in current population
	
	this.SCALE_FACTOR = 200; // the factor used to scale normalized input values

	this.GA_TYPE_ONLY_SUPPORT_1_HIDDEN_LAYER_ORIG=0;
	this.GA_TYPE_RANDOM_THRESHOLD=1;
	this.GA_RANDOM_THRESHOLD=0.3;
	this.GA_RANDOM_THRESHOLD_FOR_Perceptron_bias=this.GA_RANDOM_THRESHOLD;
	this.GA_RANDOM_THRESHOLD_FOR_Perceptron_weight=this.GA_RANDOM_THRESHOLD;
}

GeneticAlgorithm.prototype = {
	// resets genetic algorithm parameters
	reset : function(){
		this.iteration = 1;	// current iteration number (it is equal to the current population number)
		this.mutateRate = 1; // initial mutation rate
		
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
			var newUnit = new synaptic.Architect.Perceptron(2, 12, 1);
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
	activateBrain : function(bird, target){		
		// input 1: the horizontal distance between the bird and the target
		var targetDeltaX = this.normalize(target.x, 700) * this.SCALE_FACTOR;
		
		// input 2: the height difference between the bird and the target
		var targetDeltaY = this.normalize(bird.y - target.y, 800) * this.SCALE_FACTOR;
	
		// create an array of all inputs
		var inputs = [targetDeltaX, targetDeltaY];
		
		// calculate outputs by activating synaptic neural network of this bird
		var outputs = this.Population[bird.index].activate(inputs);
			
		// perform flap if output is greater than 0.5
		if (outputs[0] > 0.5) bird.flap();
	},

	// evolves the population by performing selection, crossover and mutations on the units
	evolvePopulation_old : function(){
		// select the top units of the current population to get an array of winners
		// (they will be copied to the next population)
		var Winners = this.selection();

		if (this.mutateRate == 1 && Winners[0].fitness < 0){
			// If the best unit from the initial population has a negative fitness
			// then it means there is no any bird which reached the first barrier!
			// Playing as the God, we can destroy this bad population and try with another one.
			// 如果没有任何bird抵达第一颗树，我们不需要继承任何鸟，这是一个坏的随机生成鸟序列，just重新洗牌，重置神经网络！
			// 所以我们建议将第一棵树的左侧距离鸟的距离和两棵树的间隔一致，以便降低重新洗牌的概率！
			this.createPopulation();
		} else {
			this.mutateRate = 0.2; // else set the mutatation rate to the real value
			//mutateRate越大，导致变异就越大！子代和父代差异就打；
		}

		// fill the rest of the next population with new units using crossover and mutation
		// 此处循环，跳过winner，只修订（生成）子代6个！
		for (var i=this.top_units; i<this.max_units; i++){
			var parentA, parentB, offspring;

			if (i == this.top_units){
				// 子代生成策略1：继承两个最好的父代；（只生成1个）
				// offspring is made by a crossover of two best winners
				parentA = Winners[0].toJSON();
				parentB = Winners[1].toJSON();
				//offspring = this.crossOver(parentA, parentB);
				offspring = this.crossOverByMutated(this.getRandomUnit(Winners).toJSON(),0.1);

			} else if (i < this.max_units-2){
				// 子代生成策略2：继承两个随机的winner（包含最好的父代）；（只生成6-2=4个）
				// offspring is made by a crossover of two random winners
				parentA = this.getRandomUnit(Winners).toJSON();
				parentB = this.getRandomUnit(Winners).toJSON();
				//offspring = this.crossOver(parentA, parentB);
				offspring = this.crossOverByMutated(this.getRandomUnit(Winners).toJSON(),0.1);

			} else {
			    // 子代生成策略3：继承两个最好的父代；（只生成1个）
				// offspring is a random winner
				// offspring = this.getRandomUnit(Winners).toJSON();
				offspring = this.crossOverByMutated(this.getRandomUnit(Winners).toJSON(),0.1);
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

		// if the top winner has the best fitness in the history, store its achievement!
		if (Winners[0].fitness > this.best_fitness){
			this.best_population = this.iteration;
			this.best_fitness = Winners[0].fitness;
			this.best_score = Winners[0].score;
		}

		// sort the units of the new population	in ascending order by their index
		this.Population.sort(function(unitA, unitB){
			return unitA.index - unitB.index;
		});
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

		this.genetic_algorithm(this.GA_TYPE_RANDOM_THRESHOLD);
        //genetic_algorithm(this.GA_TYPE_ONLY_SUPPORT_1_HIDDEN_LAYER_ORIG);

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
        //var GA_TYPE_ONLY_SUPPORT_1_HIDDEN_LAYER_ORIG=0;
	    //var GA_TYPE_RANDOM_THRESHOLD=1;

	    var gatype;
	    if (gaType == "" || gaType == undefined || gaType == null) {
	      gatype = this.GA_TYPE_RANDOM_THRESHOLD; //默认为随机变异算法
	    } else {
	      gatype = gaType;
	    }
        //根据类型来处理遗传算法具体的子代继承处理；
	    switch(gatype) {
            case this.GA_TYPE_RANDOM_THRESHOLD:
                this.ga_by_random_threshold();
                break;
            case this.GA_TYPE_ONLY_SUPPORT_1_HIDDEN_LAYER_ORIG:
                this.ga_orig();
                break;
            default:
                this.ga_by_random_threshold();
        };
    },


	//遗传算法（选择器）
	//var GA_TYPE_ONLY_SUPPORT_1_HIDDEN_LAYER_ORIG=0;
    ga_orig : function() {
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

	//用经典的遗传算法，增加变异因子GENE_MUTATED_RATIO=0.1
	crossOverByMutated : function(parent, geneMutatedRatio) {
	    // 定义默认变异因子
	    var GENE_MUTATED_RATIO=0.3;
	    var ratio;
	    if (geneMutatedRatio == "" || geneMutatedRatio == undefined || geneMutatedRatio == null) {
	      ratio = GENE_MUTATED_RATIO;
	    } else {
	      ratio = geneMutatedRatio;
	    }

		//随机归零（变异）一定概率的神经元；
		for (var i = 0; i < parent.neurons.length; i++){
			if (Math.random() < ratio ) {
			    parent.neurons[i]['bias'] = 1;
			}
		}
		return parent;
	},

    //遗传算法（选择器）
	//var GA_TYPE_ONLY_SUPPORT_1_HIDDEN_LAYER_ORIG=0;
    ga_by_random_threshold : function() {
        var Winners = this.selection();
		for (var i=this.top_units; i<this.max_units; i++){
			offspring = this.crossOverByMutated(this.getRandomUnit(Winners).toJSON(),this.GA_RANDOM_THRESHOLD);

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