/* TO DOs:

- Add touch support
- Add a way to inject a style information/sheet if 3D
  transforms aren't supported
- Wrap so can use as an obj
*/

var conf = {};
conf.countdown = 3;
conf.pairs = 3; // set a default

var deck1,
    deck2,
    curpair = [],
    cards = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z'.split(','),
    start,
    end,
    numtries = 0,
    config = document.getElementById('config'),
    deckwrapper = document.getElementById('deck');

/* Using event delegation here. That might not be ideal. */

var onclick = function(e){
    if( e.target.parentNode.classList.contains('card') ){
        var cp = curpair;

        /* If we have flipped it over, don't let be flipped again. */
        if( e.target.parentNode.classList.contains('flipped') === false ){

            /* Show the card */
            e.target.parentNode.classList.add('flipped');

            /* Clear out current pair */
            if( cp.length >= 2){
                while( cp.length ){
                    cp.pop();
                }
            }
            cp.push( e.target.parentNode.dataset.cardvalue );

            /* if we have a pair to compare */
            if( cp.length == 2){
                // this works for now, but can we use a transition end instead?
                setTimeout( function(){ doesmatch( cp[0], cp[1] ) }, 500);
            }
        }
    }
}

var doesmatch = function(a,b){
    var matches, matchevt;

    // increment the number of tries
    numtries++;

    if( arguments.length == 2){
        (a === b) ? matches = 'matches' : matches = 'resetcards';
        matchevt = new Event( matches );
        window.dispatchEvent( matchevt );
    } else {
        throw new Error('I need two arguments to compare.');
    }
}

var onmatch = function(e){
    var these = document.getElementsByClassName('flipped');
    var len = these.length;
    for(var i=0; i < len; i++){
        these[i].classList.add('matched');
    }

    /* Reset the list of flipped items */
    window.dispatchEvent( new Event('resetcards') );

    /* Check whether we should end the game */
    isdone();
}

var onreset = function(e){
    var these = document.getElementsByClassName('card');

    for(var i=0; i < these.length; i++){
        if( these[i].classList.contains('flipped') ){
            these[i].classList.remove('flipped');
        }
    }

}

var isdone = function(){
    /* Checks whether we have matched all pairs */
    var matchedpairs = document.getElementsByClassName('matched').length / 2;
    if(matchedpairs == conf.pairs){
        window.dispatchEvent( new Event('stoptime') );
    }
}

var onstart = function(){
    document.getElementById('overlay').classList.add('hide');
    document.getElementById('countdown').classList.add('hide');
    document.getElementById('deck').classList.remove('hide');
    start = Date.now();
}

var onstop = function(){
    var scoreevt;
    end = Date.now();

    scoreevt = new Event('tallyscore');
    window.dispatchEvent(scoreevt);

    window.removeEventListener('click', onclick ,false);
}

var shuffle = function(numpairs){
    var cnf = conf;
    cnf.pairs = numpairs;
    /* Shuffle the cards, pick a set,
       copy the set and then shuffle it */
    var c = cards.shuffle(),
        deck1 = c.splice(0,cnf.pairs),
        deck2 = deck1.copy().shuffle(),

        /* Get the first figure to use as a template */
        tpl = deckwrapper.firstElementChild,
        cardA, cardB, valueA, valueB, cd;

    for(var j=0; j < deck1.length; j++){
        /* Need to copy TPL and replace the items */

        cardA = tpl.cloneNode(true);
        cardB = cardA.cloneNode(true);

        cardA.setAttribute('data-cardvalue',deck1[j]);
        cardB.setAttribute('data-cardvalue',deck2[j]);

        valueA = document.createTextNode( deck1[j] );
        valueB = document.createTextNode( deck2[j] );

        cardA.firstElementChild.replaceChild(valueA,cardA.firstElementChild.firstChild );
        cardB.firstElementChild.replaceChild(valueB,cardB.firstElementChild.firstChild );

        deckwrapper.appendChild( cardA );
        deckwrapper.appendChild( cardB );
    }

    /* Remove the template node from the stack */
    deckwrapper.removeChild( tpl ).childNodes;

    /* Add an event handler for the start and stop time events */
    window.addEventListener('starttime', onstart, false);
    window.addEventListener('stoptime', onstop, false);

    cd =  new Event('countdown');
    window.dispatchEvent( cd );
}

var countdown = function(){
    var sec = conf.countdown,
        cd,
        s,
        cui = document.getElementById('countdown');

    cui.classList.remove('hide');

    cd = setInterval( function(){
        /* When the countdown is over...*/
        if( sec == 0 ){
            s = document.createTextNode('GO!');
        } else if( sec == -1){
            window.dispatchEvent( new Event('starttime') );
            clearInterval(cd);
        } else {
            s = document.createTextNode(sec);
        }
        cui.replaceChild(s,cui.firstChild);
        sec--;

    }, 1000);

    /* Add click handler for our cards */
    window.addEventListener('click', onclick ,false);

    /* Add a score for when we need to tally it.*/
    window.addEventListener('tallyscore', ontallyscore, false);

    /* When the game ends and we want to save the score.*/
    window.addEventListener('savescore', onsavescore, false);

    /* When we match a pair */
    window.addEventListener('matches', onmatch, false);

    /* When we don't match a pair */
    window.addEventListener('resetcards', onreset, false);


}

var ontallyscore = function(e){
    var st = start, e = end, nt = numtries, p = conf.pairs, score, savescore;
    /*
       calculate the score.
       pairs / number of tries * length of time * 5.
    */
    score = ( p / nt ) * (e - st) * 5;

    sendscore = new Event('savescore');
    sendscore.score = Math.floor( score );
    window.dispatchEvent(sendscore);
}

var onsavescore = function(e){

    document.getElementById('overlay').classList.remove('hide');
    document.getElementById('score').classList.remove('hide');

  /* If we have Local Storage available, offer the option to save the score */
    if(Lib.hasLocalStorage()){
        console.log('Save this to localstorage');
    }
}

var onsubmit = function(e){
    e.preventDefault();
    e.target.classList.add('hide');

    shuffle( e.target['pairs'].value );
}

var init = function(e){    /* Add an event listener to the configuration form. */
    config.addEventListener('submit', onsubmit, false);
}

window.addEventListener('DOMContentLoaded', init, false);
window.addEventListener('countdown', countdown, false);


