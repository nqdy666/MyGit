/**
 * Created by NQLDY on 2015/1/31.
 */
/**
 * 构造函数模式
 */

var ABC = function() {
    this.varA = 10;
    this.varB = 20;

    this.functionA = function(var1, var2) {
        console.log(var1 + "  "  +  var2);
    }
}

module.exports  = ABC;