/* TO DOs:
- Add touch support
- Add a way to inject a style information/sheet if 3D
  transforms aren't supported
- Wrap so can use as an obj
- Change appendChilds to updateNode
*/

var conf = {};
conf.countdown = 3;
conf.pairs = 3; // set a default

var score,
    deck1,
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
                /* this works for now, but can we use a transition end instead? */
                setTimeout( function(){ doesmatch( cp[0], cp[1] ) }, 500);
            }
        }
    }
}

var doesmatch = function(a,b){
    var matches, matchevt;

    /* increment the number of tries */
    numtries += 1;

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
    var scoreevt, st = start;
    document.getElementById('deck').classList.add('hide');
    scoreevt = new Event('tallyscore');
    scoreevt.start = start;
    scoreevt.end = Date.now();
    scoreevt.tries = numtries;
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

        deckwrapper.update( cardA );
        deckwrapper.update( cardB );

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
    window.addEventListener('showscore', onshowscore, false);

    /* When we match a pair */
    window.addEventListener('matches', onmatch, false);

    /* When we don't match a pair */
    window.addEventListener('resetcards', onreset, false);
}

var ontallyscore = function(e){
    var p = conf.pairs,
        score, savescore, howlong, success;
    /*
       calculate the score.
       pairs / number of tries * length of time * 5.
    */
    howlong = e.end - e.start;
    success = p / e.tries;
    score = success * howlong * 5;

    sendscore = new Event('showscore');
    sendscore.score = Math.floor( score );
    sendscore.tries = e.tries;
    sendscore.time  = howlong/1000;
    sendscore.successrate = success;
    window.dispatchEvent(sendscore);
    window.addEventListener('savescore',onsavescore,false);
}

var onshowscore = function(e){
    var tries = document.getElementById('tries').getElementsByTagName('b')[0],
        time = document.getElementById('time').getElementsByTagName('b')[0],
        rate = document.getElementById('percentage').getElementsByTagName('b')[0],
        points = document.getElementById('points');

    if(e.score){
        points.appendChild( document.createTextNode(e.score) );
    }
    if(e.tries){
        tries.appendChild( document.createTextNode(e.tries) );
    }
    if(e.time){
        time.appendChild( document.createTextNode( Lib.hundreths(e.time)+' seconds') );
    }
    if(e.successrate){
        rate.appendChild( document.createTextNode( Lib.hundreths( e.successrate*100)+'%' ) );
    }

    document.getElementById('overlay').classList.remove('hide');
    document.getElementById('score').classList.remove('hide');

    var savescore = new Event('savescore');
    savescore.score = e.score;
    window.dispatchEvent(savescore);
}

var onsavescore = function(e){
    /* If we have Local Storage available, offer the option to save the score */
    if(Lib.hasLocalStorage()){
        localStorage[ localStorage.length ] = e.score;
        document.getElementById('gettop10').classList.remove('hide');
    }
    /* Replay game */
    document.getElementById('replay').addEventListener('click',replay,false);
}


var onconfsubmit = function(e){
    e.preventDefault();
    e.target.classList.add('hide');
    shuffle( e.target['pairs'].value );
}


var replay = function(e){
    var cards,i,len;
    e.target.parentNode.parentNode.classList.add('hide');

    /* Remove the matched class from all cards */
    cards = document.getElementsByClassName('card');
    len = cards.length;
    for(i = 0; i < len; i++){
        cards[i].classList.remove('matched');
    }
    document.getElementById('config').classList.remove('hide');

    var cd = document.getElementById('countdown');
    cd.replaceChild( document.createTextNode(' '), cd.firstChild );

    var scores = document.getElementById('score').getElementsByTagName('b');
    for(i = 0; i < scores.length; i++){
        scores[i].replaceChild( document.createTextNode(''), scores[i].firstChild );
    }
}

/* Show the Top 10 */
var onscoresubmit = function(e){
    e.preventDefault();

    var numscores =  localStorage.length,
        i,
        list,
        scores = [],
        top10,
        top10scr,
        score;

    /* Move scores from an object to an array */
    for(i=0; i < numscores; i++){
        scores[i] = localStorage.getItem( localStorage.key(i) ) * 1;
    }

    /* Sort scores */
    top10 = scores.sort( function(a,b){ return b - a; }).splice(0,10);
    list = buildtop10( top10 );
    top10scr = document.getElementById('top10scores');
    top10scr.insertBefore(list,top10scr.getElementsByTagName('h1')[0].nextElementSibling);
    top10scr.classList.remove('hide');

    document.getElementById('score').classList.add('hide');

    /* Reset scores */
    document.getElementById('resethighscores').addEventListener('click',clearscores,false);

    /* Clear old scores so we can rewrite the current top 10 */
    localStorage.clear();

    /* Write sorted list back to localStorage*/
    for(i = 0; i < top10.length; i++){
        localStorage[i] = top10[i];
    }
}

var buildtop10 = function(scoresarray){
    var ol, len = scoresarray.length, li, i, t, sca;
    ol = document.createElement('ol');
    for(i = 0; i < 10; i++){
        isNaN( scoresarray[i] * 1 ) ? sca = '—' : sca = scoresarray[i];

        t = document.createTextNode( sca );
        li = document.createElement('li');
        li.appendChild( t );
        ol.id = 'topscores';
        ol.appendChild( li );
    }
    return ol;
}

var clearscores = function(){
     var empty10 = [];
     empty10.length = 10;
     localStorage.clear();
     // Replace the current list.
     document.getElementById('top10scores').replaceChild( buildtop10( empty10 ), document.getElementById('topscores') );
}



var init = function(e){
    /* Add an event listener to the configuration form. */
    config.addEventListener('submit', onconfsubmit, false);
    document.getElementById('score').addEventListener('submit', onscoresubmit, false);
}

window.addEventListener('savescore', onsavescore, false);
window.addEventListener('DOMContentLoaded', init, false);
window.addEventListener('countdown', countdown, false);


