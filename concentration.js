var pairs = 8; // let the user set this. should it a square number? 4-by-x row?

var deck1,
    deck2,
    doesmatch,
    curpair = [],
    size,
    cards = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z'.split(',');

size = cards.splice(0,pairs);

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
}

Array.prototype.copy = function(){
    var i, len = this.length, copy = [];
    for(i = 0; i < len; i++){
        copy[i] = this[i];
    }
    return copy;
}

deck1 = size.shuffle();
deck2 = size.copy().shuffle();

for(var j=0; j < deck1.length; j++){
    var cardA = document.createElement('div');
    var cardB = document.createElement('div');

    var valueA = document.createTextNode( deck1[j]);
    var valueB = document.createTextNode( deck2[j]);

    cardA.appendChild(valueA);
    cardB.appendChild(valueB);

    cardA.setAttribute('data-cardvalue',deck1[j]);
    cardB.setAttribute('data-cardvalue',deck2[j]);

    cardA.setAttribute('class','card');
    cardB.setAttribute('class','card');


    document.body.appendChild(cardA);
    document.body.appendChild(cardB);
}

var stack = document.getElementsByTagName('div');

// Setting on both NodeList and HTMLCollection
NodeList.prototype.setHandler = HTMLCollection.prototype.setHandler = function(event, func, useCapture){
    for(var i =0; i < this.length; i++){
        this[i].addEventListener(event, func, useCapture );
    }
}

/* Using event delegation here. That might not be ideal. */
window.addEventListener('click', function(e){
    if( e.target.toString() == '[object HTMLDivElement]' ){
        var cp = curpair;

        /* Show the card */
        e.target.classList.add('flipped');

        /* clear out current pair */
        if( cp.length >= 2){
            while( cp.length ){
                cp.pop();
            }
        }

        cp.push( e.target.dataset.cardvalue );

        /* if we have a pair to compare */
        if( cp.length == 2){
            doesmatch( cp[0], cp[1] );
        }
    }
},false);

doesmatch = function(a,b){
    var matches, matchevt;

    if( arguments.length == 2){
        (a === b) ? matches = 'matches' : matches = 'resetcards';
        matchevt = new Event( matches );
        window.dispatchEvent( matchevt );
    } else {
        throw new Error('I need two arguments to compare.');
    }
}

var onMatch = function(e){
    var these = document.getElementsByClassName('flipped');
    var len = these.length;
    for(var i=0; i < len; i++){
        these[i].classList.add('matched');
    }
    /* Reset the list of flipped items */
    window.dispatchEvent( new Event('resetcards') );

    isdone();
}

var onReset = function(e){
    /* Using querySelectorAll even tho it's slower
       because we need a static list, not a
       dynamic one. Otherwise, the second flipped item
       won't be unflipped.
    */
    var these = document.getElementsByClassName('card');
    for(var i=0; i < these.length; i++){
        if( these[i].classList.contains('flipped') ){
            these[i].classList.remove('flipped');
        }
    }
}

var isdone = function(){
    var matchedpairs = document.getElementsByClassName('matched').length / 2;
    if(matchedpairs == pairs){
        window.dispatchEvent( new Event('stoptime') );
    }
}

var onStop = function(){
    console.log('stop clock');
}

window.addEventListener('matches', onMatch, false);
window.addEventListener('resetcards', onReset, false);
window.addEventListener('stoptime', onStop, false);