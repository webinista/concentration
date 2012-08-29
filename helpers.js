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

/* Not sure I like this function. Will remove it. */
Node.prototype.update = function( newChild, replacedChild ){
    if( this.firstChild === undefined ){
        this.appendChild( newChild );
    } else if( replacedChild === undefined ){
        this.appendChild( newChild );
    } else {
        this.replaceChild( newChild, replacedChild );
    }
}

window.Lib = (function(global){
    return {
        hasLocalStorage: function(){
            return ( global.localStorage !== undefined ) && ( Object.prototype.toString.call(global.localStorage) === "[object Storage]");
        },
        hundreths: function(number){
            number += '';
            if( number.indexOf('.') > -1 ){
               var splitondecimal = number.split('.');
               splitondecimal[1] = splitondecimal[1].substr(0,2);
               return splitondecimal.join('.') * 1;
            } else {
                return number;
            }

        },
        transitionend: function(){
			var t, transitions, el = document.createElement('fakeEl');
			transitions = {
			    'OTransition':'oTransitionEnd',
			    'MSTransition':'msTransitionEnd',
			    'MozTransition':'transitionend',
			    'WebkitTransition':'webkitTransitionEnd',
			    'transition':'transitionEnd'
		    }
			for(t in transitions){
				if( el.style[t] !== undefined ){
					return transitions[t];
				}
			}
		},
		formatinteger:function(number,undefined){
            var num = number+'', separator, digits, len, groups = [], x = 0;

            (arguments[1] !== undefined) ? separator = arguments[1] : separator = ',';

            digits = num.split('');
            len =  digits.length;

            while(x < len/3 ){
               groups[x] = digits.splice(-3).join('');
               x++;
            }
            return groups.reverse().join(separator);
        }
    }
})(window);
