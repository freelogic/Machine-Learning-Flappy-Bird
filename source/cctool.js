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

function twoDecimal(value) {
    if (isValid(value) == false) {
        alert("VALUE is NOT valid(empty or undefined or null)!");
        return false;
    }else {
        return Math.round(value*100)/100;
    };
};

