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
   * 实现动态调节鸟水平垂直飞行速度；
   * 实现动态调节上下两树的间距，及相邻两排树的左右间距；
   * 实现动态调节左右相邻两排树的上下位置变化因子；
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




## END