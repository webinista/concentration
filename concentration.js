/*
MemoryConcentration version 1.0
Copyright 2012 Tiffany B. Brown
http://tiffanybbrown.com

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


/* TO DOs:
- Add touch support
- Try to get some backward compatibility in here for non 3D transform browsers
- Refactor for better awesome!
*/

/* Create an individual card */
function Card(imgsrc,path){
    /* Creates:
    <figure class="card">
        <div class="front"></div>
        <div class="back">&nbsp;</div>
    </figure>
    */
    var front, back, card, img = new Image();

    img.src = path+imgsrc;

    front = document.createElement('div');
    front.setAttribute('class','front');
    front.appendChild(img);

    back = front.cloneNode(false);
    back.setAttribute('class','back');
    back.appendChild( document.createTextNode(' ') );

    card = document.createElement('figure');
    card.setAttribute('data-cardvalue',img.src);
    card.setAttribute('class','card');
    card.appendChild(front);
    card.appendChild(back);

    return card;
}


var conf = {},
    deck1,
    deck2,
    curpair = [],
    start,
    end,
    numtries = 0,
    config = document.getElementById('config'),
    deckwrapper = document.getElementById('deck'),
    tpl;

conf.countdown = 3;
conf.pairs = 6;
conf.imgdir = 'images/';

/* Must be an array of images */
conf.cards = 'apple.png,bluestar.png,grapes.png,luckyseven.png,wine.png,bamboo2.png,heart.png,pineapple.png,yinyang.png,bananas.png,cat_paw_prints.png,knight.png,rabbit.png,baseball.png,checkmark.png,ladybug.png,diamond.png,beachball.png,chess.png,leaf.gif,treasure.png,bird.png,chips.png,lemon.gif,wasp.png'.split(',');

cards = conf.cards;

var buildtop10 = function(scoresarray){
    var ol, len = scoresarray.length, li, i, t, sca;
    ol = document.createElement('ol');
    for(i = 0; i < 10; i++){
        isNaN( scoresarray[i] * 1 ) ? sca = '————' : sca = Lib.formatinteger( scoresarray[i] );
        t = document.createTextNode( sca );
        li = document.createElement('li');
        li.appendChild( t );
        ol.id = 'topscores';
        ol.appendChild( li );
    }
    return ol;
}

var clearscores = function(){
     var empty10 = [],
     ts = document.getElementById('top10scores').getElementsByTagName('div')[0];
     empty10.length = 10;
     localStorage.clear();

     /* Replace the current list. */
     ts.replaceChild( buildtop10( empty10 ), document.getElementsByTagName('ol')[0] );
}

var countdown = function(e){
    var sec = conf.countdown,
        cd,
        s,
        cui = document.getElementById('countdown');

    cui.replaceChild( document.createTextNode(''), cui.firstChild);
    cui.classList.remove('hide');

    /* Add click handler for our cards */
    window.addEventListener('click', onclick ,false);

    window.addEventListener('tallyscore', ontallyscore, false);

    window.addEventListener('showscore', onshowscore, false);

    document.body.addEventListener('savescore',onsavescore,false);

    /* When we match a pair */
    window.addEventListener('matches', onmatch, false);

    /* When we don't match a pair */
    window.addEventListener('resetcards', onreset, false);

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
    }, 800);
}

var doesmatch = function(a,b){
    var matches, matchevt;

    if( arguments.length == 2){
        (a === b) ? matches = 'matches' : matches = 'resetcards';
        matchevt = new Event( matches );
        window.dispatchEvent( matchevt );
    } else {
        throw new RangeError('I need two arguments to compare.');
    }
}

var init = function(e){
    /* Add an event listener to the configuration form. */
    config.addEventListener('submit', onconfsubmit, false);
}

var isdone = function(){
    /* Checks whether we have matched all pairs */
    var matchedpairs = document.getElementsByClassName('matched').length / 2;

    if(matchedpairs == conf.pairs){
       window.dispatchEvent( new Event('stoptime') );
    }
}

/* Using event delegation  on the window object here. */
var onclick = function(e){

    if( (e.target.parentNode.classList !== undefined) &&
        (e.target.parentNode.classList.contains('card')) ){

        var cp = curpair;

        // If we have flipped it over, don't let be flipped again.
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

            if( cp.length == 2 ){ numtries++; }

            e.target.parentNode.addEventListener(Lib.transitionend(), function(e){
                if( cp.length == 2){
                   doesmatch( cp[0], cp[1] );
                }
            },false);
        }
    }

    if( e.target.classList.contains('close') ){
        document.getElementById('top10scores').classList.add('hide');
        document.getElementById('score').classList.remove('hide');
    }
}

var onconfsubmit = function(e){
    e.preventDefault();
    e.target.classList.add('hide');
    if( e.target['pairs'] ){
        conf.pairs = e.target['pairs'].value;
    } else {
        conf.pairs = conf.pairs;
    }
    shuffle( conf.pairs );
    document.getElementById('score').addEventListener('submit', onscoresubmit, false);
}

var onmatch = function(e){
    var these = document.getElementsByClassName('flipped');
    var len = these.length;
    for(var i=0; i < len; i++){
        these[i].classList.add('matched');
        these[i].addEventListener(Lib.transitionend(), function(e){
            e.target.classList.add('invisible');
        },false);

        /* Check whether we should end the game */
        isdone();
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
    curpair.length = 0;
}

var onsavescore = function(e){
    /* Prevents this function from being called twice */
    document.body.removeEventListener('savescore',onsavescore);

    if( Lib.hasLocalStorage() ){
        localStorage[ localStorage.length ] = e.score;
        document.getElementById('gettop10').classList.remove('hide');
    }

    /* Replay game */
    document.getElementById('replay').addEventListener('click',replay,false);
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
    top10scr = document.getElementById('top10scores').getElementsByTagName('div')[0];

    /* Is this the first time we're inserting? If not, replace the current list. */
    if( Object.prototype.toString.call( top10scr.getElementsByTagName('h1')[0].nextElementSibling ) == "[object HTMLParagraphElement]" ){
        top10scr.insertBefore( list, top10scr.lastElementChild );
    } else {
        top10scr.replaceChild(list, top10scr.getElementsByTagName('h1')[0].nextElementSibling);
    }

    top10scr.parentNode.classList.remove('hide');
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

var onshowscore = function(e){

    var tries = document.getElementById('tries').getElementsByTagName('b')[0],
        time = document.getElementById('time').getElementsByTagName('b')[0],
        rate = document.getElementById('percentage').getElementsByTagName('b')[0],
        points = document.getElementById('points'),
        savescore = new Event('savescore');

    if(e.score){
        var sc = Lib.formatinteger(e.score);
        points.replaceChild( document.createTextNode(sc), points.firstChild );
    }
    if(e.tries){
        tries.replaceChild( document.createTextNode(e.tries), tries.firstChild );
    }
    if(e.time){
        time.replaceChild( document.createTextNode( Lib.hundreths(e.time)+' seconds'), time.firstChild );
    }
    if(e.successrate){
        rate.replaceChild( document.createTextNode( Lib.hundreths( e.successrate*100)+'%' ), rate.firstChild );
    }

    document.getElementById('overlay').classList.remove('hide');
    document.getElementById('score').classList.remove('hide');

    savescore.score = e.score;
    document.body.dispatchEvent(savescore);
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
    scoreevt       = new Event('tallyscore');
    scoreevt.start = start;
    scoreevt.end   = Date.now();
    scoreevt.tries = numtries;
    setTimeout(function(){ window.dispatchEvent(scoreevt); },300);
}

var ontallyscore = function(e){
    var howlong, score, sendscore;
    /*
    calculate the score.
    */
    howlong = e.end - e.start;
    score = (1000000 * conf.pairs / howlong / e.tries) * 100;

    sendscore       = new Event('showscore');
    sendscore.score = Math.round( score );
    sendscore.tries = e.tries;
    sendscore.time  = howlong/1000;
    sendscore.successrate = conf.pairs / e.tries;

    window.dispatchEvent(sendscore);
}

var replay = function(e){
    var cards,
        i,
        len,
        cd = document.getElementById('countdown'),
        cde,
        scores = document.getElementById('score').getElementsByTagName('b');

    e.target.parentNode.parentNode.classList.add('hide');

    /* Remove all cards from stack */
    cards = deckwrapper.getElementsByClassName('card');
    len   = cards.length;
    while( deckwrapper.firstElementChild ){
        deckwrapper.removeChild( deckwrapper.firstElementChild );
    }
    for(i = 0; i < scores.length; i++){
        scores[i].replaceChild( document.createTextNode(''), scores[i].firstChild );
    }
    /* reset numtries */
    numtries = 0;

    /* Launch a new game*/
    cde =  new Event('submit');
    config.dispatchEvent(cde);
}

var shuffle = function(numpairs){

    /* Shuffle the cards, pick a set,
       copy the set and then shuffle it */
    var c = cards.shuffle(),
        deck1 = c.splice(0,numpairs),
        deck2 = deck1.copy().shuffle(),
        cardA, cardB, valueA, valueB, cd;

    for(var j=0; j < deck1.length; j++){
        deckwrapper.appendChild( new Card(deck1[j],conf.imgdir) );
        deckwrapper.update( new Card(deck2[j],conf.imgdir) );
    }

    /* Add an event handler for the start and stop time events */
    window.addEventListener('starttime', onstart, false);
    window.addEventListener('stoptime', onstop, false);

    cd =  new Event('countdown');
    window.dispatchEvent( cd );
}

window.addEventListener('DOMContentLoaded', init, false);
window.addEventListener('countdown', countdown, false);


