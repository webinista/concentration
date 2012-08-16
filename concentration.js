/* TO DOs:
- Add touch support
- Add a way to inject a style information/sheet if 3D
  transforms aren't supported
- Wrap so can use as an obj?
- Format scores with commas.

*/

/* Create an individual card */
function Card(imgsrc){
    /* Creates:
    <figure class="card">
        <div class="front"></div>
        <div class="back">&nbsp;</div>
    </figure>
    */
    var front, back, card, img = new Image();

    img.src = imgsrc;

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

var conf = {};
conf.countdown = 3;
conf.pairs = 2; // set a default
// should be an array of images
conf.cards = 'apple.png,bluestar.png,grapes.png,luckyseven.png,wine.png,bamboo2.png,heart.png,pineapple.png,yinyang.png,bananas.png,cat_paw_prints.png,knight.png,rabbit.png,baseball.png,checkmark.png,ladybug.png,diamond.png,beachball.png,chess.png,leaf.gif,treasure.png,bird.png,chips.png,lemon.gif,wasp.png'.split(',');

var score,
    deck1,
    deck2,
    curpair = [],
    cards = conf.cards,
    start,
    end,
    numtries = 0,
    config = document.getElementById('config'),
    deckwrapper = document.getElementById('deck'),
    tpl;

/* Using event delegation  on the window object here. */

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
    setTimeout(function(){ window.dispatchEvent(scoreevt); },300);
    // window.removeEventListener('click', onclick ,false);
}

var shuffle = function(numpairs){

    var cnf = conf;
    cnf.pairs = numpairs;

    /* Shuffle the cards, pick a set,
       copy the set and then shuffle it */
    var c = cards.shuffle(),
        deck1 = c.splice(0,cnf.pairs),
        deck2 = deck1.copy().shuffle(),
        cardA, cardB, valueA, valueB, cd;

    /* Get the first figure to use as a template */
    /* Make it global */


    for(var j=0; j < deck1.length; j++){
        deckwrapper.update( new Card(deck1[j]) );
        deckwrapper.update( new Card(deck2[j]) );
    }

    /* If we have more cards than we need, remove the
    template node from the stack */
    if( deckwrapper.getElementsByTagName('figure').length > numpairs * 2 ){
        deckwrapper.removeChild( deckwrapper.firstElementChild );
    }

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
        points.replaceChild( document.createTextNode(e.score), points.firstChild );
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
    conf.pairs = e.target['pairs'].value;
    shuffle( e.target['pairs'].value );
    document.getElementById('score').addEventListener('submit', onscoresubmit, false);
}


var replay = function(e){
    var cards,i,len,cd,scores;
    e.target.parentNode.parentNode.classList.add('hide');

    /* Remove all cards from stack */
    cards = deckwrapper.getElementsByClassName('card');
    len   = cards.length;
    while( deckwrapper.firstElementChild ){
        deckwrapper.removeChild( deckwrapper.firstElementChild );
    }

    /* Show the config screen - might remove. */
    document.getElementById('config').classList.remove('hide');

    cd = document.getElementById('countdown');
    cd.replaceChild( document.createTextNode(' '), cd.firstChild );

    scores = document.getElementById('score').getElementsByTagName('b');

    for(i = 0; i < scores.length; i++){
        scores[i].replaceChild( document.createTextNode(''), scores[i].firstChild );
    }
    /* reset numtries */
    numtries = 0;
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
     /* Replace the current list. */
     document.getElementById('top10scores').getElementsByTagName('div')[0].replaceChild( buildtop10( empty10 ), document.getElementsByTagName('ol')[0] );
}

var init = function(e){
    /* Add an event listener to the configuration form. */
    config.addEventListener('submit', onconfsubmit, false);
}

window.addEventListener('savescore', onsavescore, false);
window.addEventListener('DOMContentLoaded', init, false);
window.addEventListener('countdown', countdown, false);


