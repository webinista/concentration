/* Shuffle function from http://stackoverflow.com/questions/962802/is-it-correct-to-use-javascript-array-sort-method-for-shuffling */

Array.prototype.shuffle = function() {
    var tmp, current, top = this.length;
    if(top) {
        while(--top) {
            current = Math.floor(Math.random() * (top + 1));
            tmp = this[current];
            this[current] = this[top];
            this[top] = tmp;
        }
    }
    return this;
};

Array.prototype.copy = function(){
    var i, len = this.length, copy = [];
    for(i = 0; i < len; i++){
        copy[i] = this[i];
    }
    return copy;
};


// Setting on both NodeList and HTMLCollection
NodeList.prototype.setHandler = HTMLCollection.prototype.setHandler = function(event, func, useCapture){
    for(var i =0; i < this.length; i++){
        this[i].addEventListener(event, func, useCapture );
    }
};

window.Lib = (function(global){
    return {
        hasLocalStorage: function(){
            return ( global.localStorage !== undefined ) && ( Object.prototype.toString.call(global.localStorage) === "[object Storage]");
        },
        hundreths: function(number){
            number += '';
            var splitondecimal = number.split('.');
            splitondecimal[1] = splitondecimal[1].substr(0,2);
            return splitondecimal.join('.') * 1;
        },
        formatnum: function(number){
            // format numbers to use commas
        }
    }
})(window);
