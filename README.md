# README

## 1. 说明

* Install&Debug：
  * 原作者（SRDJAN）网页上的安装摘要：
  
  ``` 
  1. Install some web-server on your machine (Xampp or Wamp)
  2. copy and paste all files in a web-server folder with “permits public access” 
    (it’s \htdocs folder on Xampp so you can put all files in Xampp\htdocs\flappy folder)
    (“www” for wamp)
  3. Start web-server (click on Start Apache button in Xampp Control Panel)
  4. open a web browser and enter the link http://localhost/flappy to run the application

  ```
  * 为方便联调，直接在IDE修改JS等源码后，在浏览器（IE/EDGE/FIRFOX/CHROME等）中直接看到效果，而省去部署环节，则可以如下命令建立软连接：
  
  ```
  在WIN10下可通过如下命令，方便的将虚拟目录“G:\wamp64\www\flappy2”和实际目录“D:\tmp\python\Machine-Learning-Flappy-Bird\source”连接起来；
  "G:\wamp64\www>mklink /J flappy2 D:\tmp\python\Machine-Learning-Flappy-Bird\source"
  "为 flappy2 <<===>> D:\tmp\python\Machine-Learning-Flappy-Bird\source 创建的联接"
  ```
  
  
  
## 2. TODO
* 1.增加按钮能RUNTIME来控制参数（鸟的水平飞行速度，垂直flappy煽动翅膀速度，两树上下间距，左右间距；
* 2.用多维属性系来代替神经网络；
* 3.遗传算法是否能加上性别？
* 4.将本例子的synaptic更换为其他JS来测试；比如支持GPU的JS库，比如：kerasjs，brain.js，Sukiyaki2; 不支持GPU的经典库convnet.js；
* 5.整理了遗传算法的部分内容，将原来算法作为一种，又增加了一种遗传算法；【已完成】
* 6.可以如下参数的互动和动态改变强化学习的环境及考验NN的感知器神经网络大脑的适应性；
   * 实现鸟上下可飞；
   * 实现动态调节鸟水平垂直飞行速度；【已完成】
   * 实现动态调节上下两树的间距，及相邻两排树的左右间距；【已完成】
   * 实现动态调节左右相邻两排树的上下位置变化因子；【已完成】
   * 实现动态调节某GA算法（遗传算法）的参数
  
  
## 3. 资料
* JS下的GPU库：
  * [gpu.js](http://gpu.rocks/)和[源码](https://github.com/gpujs/gpu.js);
  * [weblas](https://github.com/waylonflinn/weblas)和基于它的[webnn](https://github.com/freelogic/webnn)，它较为简陋，不建议看；
  * project [MILJS](https://github.com/mil-tokyo) which is backed by academic research from the University of **Tokyo** have a few open source libraries:
      * [Sushi2](https://github.com/mil-tokyo/sushi2): Matrix calculations in JS using GPU
      * [Sukiyaki2](https://github.com/mil-tokyo/sukiyaki2): Deep Learning library on top of Sushi2,and [API](https://mil-tokyo.github.io/sukiyaki2/api/)
      * See [demo](https://mil-tokyo.github.io/sukiyaki2/)(第二个camera的demo最佳用firefox在PC/安卓手机上打开，但不支持IPHONE) of a DL network on the MNIST dataset
      * [Sashimi](https://github.com/mil-tokyo/sashimi): a distributed calculation framework for Javascript
* JS下的ML机器学习库：
  * [synaptic](https://github.com/cazala/synaptic/),可惜它暂时不支持GPU，且正在起草准备开发[synaptic2.0](https://github.com/cazala/synaptic/issues/140);
      * 它论坛中提到的GPU问题：请在[synaptic#issue140](ttps://github.com/cazala/synaptic/issues/140)查“GPU”关键字；
  * [Sukiyaki2](https://github.com/mil-tokyo/sukiyaki2),tokyo东京大学的库，据说支持GPU；
  * [convnetjs](https://cs.stanford.edu/people/karpathy/convnetjs/),斯坦福的JS机器学习库，no GPU；
  * [KerasJS](https://github.com/transcranial/keras-js);支持GPU（使用WebGL得到GPU支持）
  * [brain.js](https://github.com/BrainJS/brain.js/);支持GPU
  * TODO：待补充
* JS下的GRAPH图库：
  * **cytoscape.js**: [github项目](https://github.com/freelogic/cytoscape.js),[主页](http://js.cytoscape.org),比较heavy的库，稍有点复杂。
  * **algorithms.js**: [github项目](https://github.com/felipernb/algorithms.js),[主页](http://felipernb.github.io/algorithms.js/),包括graph的广度/深度优先，最短路径等，各种数据结构的典型算法都有，全是JS！
  * **javascript-datastructures-algorithms**: [github项目](https://github.com/loiane/javascript-datastructures-algorithms),[无主页](),有电子书及举例，包括graph/tree等数据结构的JS版本，极好！；
  * XXX.js: [github项目](),[主页](),请评价；
  * XXX.js: [github项目](),[主页](),请评价；
  * XXX.js: [github项目](),[主页](),请评价；
* JS下的画图库：
  * sigma.js: [githuab项目](https://github.com/freelogic/sigma.js),[主页](http://sigmajs.org/),只画graph网络图一种，用于呈现较简单；
  * **plotly.js**: [githuab项目](https://github.com/plotly/plotly.js),[主页](https://plot.ly/javascript/parallel-coordinates-plot/),比较强大，比chart.js更专业些的画图plot工具；
  * **chart.js**: [github项目](https://github.com/freelogic/Chart.js),[主页](http://www.chartjs.org/),使用广泛，界面比较卡通，不是科学风；
  * VivaGraphJS: [github项目](https://github.com/anvaka/VivaGraphJS),[无主页](),仅仅是画网络图，并能显示icon图标，简单易用！
  * billboard.js: [github项目](https://github.com/naver/billboard.js),[主页](https://naver.github.io/billboard.js/),使用非常简单，详见主页举例！基于C3；  
  * **C3.js**: [github项目](https://github.com/c3js/c3),[主页](http://c3js.org/examples.html),D3最著名的wrapper包装控件，方便使用！； 
  * **D3.js**: [github项目](https://github.com/d3/d3),[主页](https://d3js.org/),史上最强js图（包括力反馈图等等），是其他C3等js库的基础！； 
  * Flotr2: [github项目](https://github.com/HumbleSoftware/Flotr2),[主页](http://www.humblesoftware.com/flotr2/index),简单专注；[用D3学图论](https://mrpandey.github.io/d3graphTheory/unit.html?vertices-and-edges) 
  * **graphviz**: [gitlab项目](https://gitlab.com/graphviz/graphviz/),[主页](https://graphviz.gitlab.io/gallery/),电脑IT工程图等最牛； 
  * WebCola: [github项目](https://github.com/tgdwyer/WebCola),[主页](http://ialab.it.monash.edu/webcola/),基于D3；         
  * XXX.js: [github项目](),[无主页](),请评价； 
  * XXX.js: [github项目](),[无主页](),请评价； 
  * XXX.js: [github项目](),[无主页](),请评价； 
  
  
  
  
  
  
## END