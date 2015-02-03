/**
 * Created by NQLDY on 2015/1/31.
 */

/**
 * 工厂模式
 */

var Greeter = function (lang) {
    var that = this;
    this.language = lang;
    this.greet = function() {
        switch (that.language) {
            case "en":
                return "hello world";
            case "de":
                return "hallo world";
            case "cn":
                return "你好";
            default :
                return "No speaka that language";
        }
    }();
};

exports.hello_world = function() {
  console.log("Hello World");
};

exports.goodbye = function() {
  console.log("Bye Bye");
};

exports.create_greeter = function(lang) {
    return new Greeter(lang);
};