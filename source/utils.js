//Usage: add below line in JS which need function in this JS;
//document.write('<script src="utils.js" type="text/javascript" ></script>');

/***********************************************************************************
/* TOOL
/***********************************************************************************/
function isValid(x){
  //用“===”可以额外比对类型。0和""空比较“==”比较为true，而“===”比较为false；
  if (x === "" || x == undefined || x == null) {
    return false;
   }else{
    return true;
   }
};

function checkValueInRange(value,max,min,valueName) {
    if (isValid(value) == false) {valueName="value";}
    if (isValid(value) == false) {
        alert(valueName+" is NOT valid(empty or undefined or null)!");
        return false;
    }else if (isValid(min) == false) {
        alert(valueName+"'s MIN of RANGE is NOT valid(empty or undefined or null)!");
        return false;
    }else if (isValid(max) == false) {
        alert(valueName+"'s MAX of RANGE is NOT valid(empty or undefined or null)!");
        return false;
    }else if (value<min || value>max) {
        alert(valueName+"["+value+"] is out of range ["+min+","+max+"]！");
        return false;
    }else {
        return true;
    };
};

//小数点保留2位；
function twoDecimal(value) {
    if (isValid(value) == false) {
        alert("VALUE is NOT valid(empty or undefined or null)!");
        return false;
    }else {
        return Math.round(value*100)/100;
    };
};

//小数点保留2位，用函数“toFixed(2)”实现，不一定都可用！注意测试！
function p2(value) {
    if (isValid(value) == false) {
        alert("VALUE is NOT valid(empty or undefined or null)!");
        return false;
    }else {
        return value.toFixed(2);
    };
};

/***********************************************************************************
/* define class point
/***********************************************************************************/

function Point(x,y){this.x=x;this.y=y;}//constructor
Point.prototype.toString=function(){return '('+this.x+', '+this.y+')';}//method
Point.prototype.setx=function(x){this.x = x;};//method
Point.prototype.sety=function(y){this.y = y;};//method
Point.prototype.setxy=function(x,y){this.x = x; this.y = y;};//method
//var point=new Point(1,2);//demo

