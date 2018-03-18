# README

## 说明

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
  
  
  
  ## TODO
  * 1.增加按钮能RUNTIME来控制参数（鸟的水平飞行速度，垂直flappy煽动翅膀速度，两树上下间距，左右间距；
  * 2.用多维属性系来代替神经网络；
  * 3.遗传算法是否能加上性别？