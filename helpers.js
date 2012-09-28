/*
MemoryConcentration version 1.0
Copyright 2012 Tiffany B. Brown
http://tiffanybbrown.com

Released under an MIT license.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Note that images and fonts are subject to separate licenses.
*/

/* Shuffle function from http://stackoverflow.com/questions/962802/is-it-correct-to-use-javascript-array-sort-method-for-shuffling */

if( typeof Array.prototype.shuffle == 'undefined'){
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
}

if( typeof Array.prototype.copy == 'undefined'){
    Array.prototype.copy = function(){
        var i, len = this.length, copy = [];
        for(i = 0; i < len; i++){
            copy[i] = this[i];
        }
        return copy;
    };
}

function Lib(){}

Lib.prototype.hasLocalStorage = function(){
    return ( window.localStorage !== undefined ) && ( Object.prototype.toString.call(window.localStorage) === "[object Storage]");
}
Lib.prototype.hundreths = function(number){
    number += '';
    if( number.indexOf('.') > -1 ){
       var splitondecimal = number.split('.');
       splitondecimal[1] = splitondecimal[1].substr(0,2);
       return splitondecimal.join('.') * 1;
    } else {
        return number;
    }
}
Lib.prototype.transitionend = function(){
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
}
Lib.prototype.formatinteger = function(number,undefined){
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
Lib.prototype.has3d = function(){
    var el = document.createElement('p'), t, has3d,
    transforms = {
        'WebkitTransform':'-webkit-transform',
        'OTransform':'-o-transform',
        'MSTransform':'-ms-transform',
        'MozTransform':'transform',
        'Transform':'transform'
    };

    /* Add it to the body to get the computed style.*/
    document.body.insertBefore(el, document.body.lastChild);

    for(t in transforms){
        if( el.style[t] !== undefined ){
            el.style[ transforms[t] ] = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)';
            has3d = window.getComputedStyle(el).getPropertyValue( transforms[t] );
        }
    }

    if( has3d !== undefined ){
        return has3d !== 'none';
    } else {
        return false;
    }
}
Lib.prototype.hasClassList = function(){
    return document.body.classList !== undefined;
}

window.Lib = new Lib();
