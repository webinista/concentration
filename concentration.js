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

'use strict';

var conc,
    conf = {
        countdown:3,
        pairs:6,
        imgpath:'images/',
        deck:'apple.png,bluestar.png,grapes.png,luckyseven.png,wine.png,bamboo2.png,heart.png,pineapple.png,yinyang.png,bananas.png,cat_paw_prints.png,knight.png,rabbit.png,baseball.png,checkmark.png,ladybug.png,diamond.png,beachball.png,chess.png,leaf.gif,treasure.png,bird.png,chips.png,lemon.gif,wasp.png'.split(',')
    },
    curpair = [],
    start,
    end,
    transend = Lib.transitionend(),
    numtries = 0,
    has3d = Lib.has3d();

function Concentration(config){
    this.deck  = config.deck;
    this.pairs = config.pairs;
    this.countdownfrom = config.countdown;
    this.imgpath = config.imgpath;
}

Concentration.prototype.makecard = function(imgsrc){
    /* Creates:
    <div class="card" data-cardvalue="imgsrc">
        <div class="front"><img src="imgsrc"></div>
        <div class="back"></div>
    </div>
    */
    var front, back, card, img = new Image();

    img.src = imgsrc;

    front = document.createElement('div');
    front.setAttribute('class','front');
    front.appendChild(img);

    back = front.cloneNode(false);
    back.setAttribute('class','back');

    card = document.createElement('div');
    card.setAttribute('data-cardvalue',img.src);
    card.setAttribute('class','card');
    card.appendChild(front);
    card.appendChild(back);

    return card;
}
Concentration.prototype.buildtop10 = function(scoresarray){
    var ol, len = scoresarray.length, li, i, t, sca,
    ol = document.createElement('ol'),
    df = document.createDocumentFragment();

    scoresarray.map( function(s){
        isNaN( s * 1 ) ? sca = '00000' : sca = Lib.formatinteger( s );
        t.textContent = sca;
        li = document.createElement('li')
        li.appendChild( t );
        df.appendChild(li);
    });

    ol.id = 'topscores';
    ol.appendChild( df );

    return ol;
}
Concentration.prototype.clearscores = function(){
     var empty10 = [],
     ts = document.getElementById('top10scores').getElementsByTagName('div')[0];
     empty10.length = 10;
     localStorage.clear();

     /* Replace the current list. */
     ts.replaceChild( this.buildtop10( empty10 ), document.getElementsByTagName('ol')[0] );
}
Concentration.prototype.doesmatch = function(a,b){
    var matches, matchevt;

    if( arguments.length == 2){
        (a === b) ? matches = 'matches' : matches = 'resetcards';
        matchevt = new CustomEvent( matches );
        window.dispatchEvent( matchevt );
    } else {
        throw new RangeError('I need two arguments to compare.');
    }
}
Concentration.prototype.isdone = function(){
    /* Checks whether we have matched all pairs */
    var matchedpairs = document.getElementsByClassName('matched').length / 2;

    if(matchedpairs == conf.pairs){
       window.dispatchEvent( new CustomEvent('stoptime') );
    }
}
Concentration.prototype.deal = function(){
    /* Shuffle the cards, pick a set,
       copy the set and then shuffle it */
    var c = this.deck.shuffle(),
        deck1 = c.slice(0, this.pairs),
        deck2 = deck1.copy(), // creates matching set
        deckwrapper = document.getElementById('deck'),
        docfrag = document.createDocumentFragment(),
        path = this.imgpath,
        deck, cd, j;

    // Merge deck1 and deck 2, then shuffle
    deck = deck1.concat(deck2).shuffle();

    // Create append to a document fragment...
    deck.map( function(o){
        var card = conc.makecard( path + o );
        docfrag.appendChild( card );
    });

    // ... and update the DOM once
    deckwrapper.appendChild( docfrag );

    /* Add an event handler for the start and stop time events */
    window.addEventListener('starttime', onstart, false);
    window.addEventListener('stoptime', onstop, false);

    cd =  new CustomEvent('countdown');
    window.dispatchEvent( cd );
}
Concentration.prototype.countdown = function(){
    var sec = conf.countdown,
        cd,
        s,
        cui = document.getElementById('countdown');

    cui.replaceChild( document.createTextNode(''), cui.firstChild);
    cui.classList.remove('hide');

    cd = setInterval( function(){
        /* When the countdown is over...*/
        if( sec == 0 ){
            s = document.createTextNode('GO!');
        } else if( sec == -1){
            window.dispatchEvent( new CustomEvent('starttime') );
            clearInterval(cd);
        } else {
            s = document.createTextNode(sec);
        }
        cui.replaceChild(s,cui.firstChild);
        sec--;
    }, 800);
}
Concentration.prototype.getsavedscores = function(){
    if(!Lib.hasLocalStorage() ){
       throw new Error("Your browser doesn't support localStorage.");
    } else if( localStorage.getItem('webinistaconcentration') !== null ){
        return JSON.parse( localStorage['webinistaconcentration'] );
    } else {
        return [];
    }
}
Concentration.prototype.savescores = function(scoresarray){
    localStorage['webinistaconcentration'] = JSON.stringify( scoresarray );
}
Concentration.prototype.start = function(){
    return Date.now();
}
Concentration.prototype.stop = function(){
    return Date.now();
}
Concentration.prototype.reset = function(){
    var i,
        cd     = document.getElementById('countdown'),
        score  = document.getElementById('score'),
        scores = score.getElementsByTagName('b'),
        deck   = document.getElementById('deck'),
        cards  = deck.getElementsByClassName('card'),
        len    = cards.length;

    /* Remove all cards from stack */
    while( deck.firstElementChild ){
        deck.removeChild( deck.firstElementChild );
    }

    Array.prototype.map.call( scores, function(s){
        s.replaceChild( document.createTextNode(''), s.firstChild );
    });


    /* reset numtries */
    numtries = 0;
}
Concentration.prototype.seconds = function(start,end){
    return (end - start) / 1000;
}
Concentration.prototype.tally = function(time,pairs,tries){
    var results = {};
    results.score = (pairs / time / tries) * 1000000;
    results.successrate = (pairs / tries) * 100;
    return results;
}

/*----- Start the game ------*/
function init(){
    /*
    If this browser lacks 3D transforms support,
    add the 2D stylesheet.
    */

    if( has3d === false ){
        var css = document.createElement('link');
        css.setAttribute('rel','stylesheet');
        css.setAttribute('href','no3d.css');
        css.setAttribute('media','screen');
        document.head.appendChild(css);
    }

    document.getElementById('config').addEventListener('submit', onconfsubmit, false);
    window.addEventListener('countdown', oncountdown, false);
}

/* Using event delegation here. */
var onclick = function(e){
    var cp = curpair,
        cur = e.target.parentNode,
        curclasses = cur.classList,
        onflip = function(e){
            e.preventDefault();
            var cp = curpair;
            if( cp.length == 2){
                conc.doesmatch( cp[0], cp[1]);
            }
            e.target.removeEventListener(transend,onflip,true);

            if( e.propertyName == 'opacity' ){
                console.log( 'hi' );
            }
        };

    if( curclasses.contains('card') ){
        /* Don't flip twice */
        if( curclasses.contains('flipped') === false ){
            curclasses.add('flipped');
            cp.push( cur.dataset.cardvalue );
            if( cp.length == 2 ){ numtries++; }
            cur.addEventListener(transend, onflip, false);
        }
    }
    /* For view scores button. */
    if( e.target.classList.contains('close') ){
        document.getElementById('top10scores').classList.add('hide');
        document.getElementById('score').classList.remove('hide');
    }
}

var onconfsubmit = function(e){
    e.preventDefault();
    e.target.classList.add('hide');
    conc = new Concentration(conf);
    conc.deal( conf.cards, conf.pairs );
    document.getElementById('score').addEventListener('submit', onscoresubmit, false);
}

var oncountdown = function(e){
    conc.countdown();
    window.addEventListener('click', onclick, false);
    window.addEventListener('savescore',onsavescore,false);
    window.addEventListener('tallyscore', ontallyscore, false);
    window.addEventListener('showscore', onshowscore, false);
    window.addEventListener('matches', onmatch, false);
    window.addEventListener('resetcards', onreset, false);
}

var ontallyscore = function(e){
        var howlong, tally, sendscore,
        /*
        calculate the score.
        */
        howlong   = conc.seconds(e.start, e.end),
        tally     = conc.tally(howlong,conf.pairs,e.tries),
        data      = {};

    /* If it's an infinite number, there's probably an error. */
    if( score === Number.POSITIVE_INFINITY ){
        throw new RangeError('Unable to calculate a score. This can happen if the game has run for too long.');
    } else {
        data.score = Math.round( tally.score );
        data.tries = e.tries;
        data.time  = howlong;
        data.successrate = tally.successrate;

        sendscore  = new CustomEvent('showscore',{detail:data});

        window.dispatchEvent(sendscore);
    }
}

var onmatch = function(e){
    var these      = document.getElementsByClassName('flipped'),
        len        = these.length,
        onmatchend = function(t){
            t.target.classList.add('invisible');
            t.target.removeEventListener(transend,onmatchend,false);
        }

    Array.prototype.map.call(these, function(o){
        o.classList.add('matched');
        o.addEventListener(transend,onmatchend,false);
    });

    /* Reset the list of flipped items */
    window.dispatchEvent( new CustomEvent('resetcards') );

    /* Check whether we should end the game */
    conc.isdone();
}

var onreset = function(e){
    var these = document.getElementsByClassName('card');

    Array.prototype.map.call(these, function(o){
        if( o.classList.contains('flipped') ){
            o.classList.remove('flipped');
        }
     });

    /* reset the current pair. */
    curpair.length = 0;
}

var onsavescore = function(e){
    /* Prevents this function from being called twice */
    window.removeEventListener('savescore',onsavescore);

    if( Lib.hasLocalStorage() ){
        var currentscores = conc.getsavedscores();
        currentscores[currentscores.length] = e.detail;
        conc.savescores( currentscores );
    }

    /* Replay game */
    document.getElementById('replay').addEventListener('click',replay,false);
}

/* Show the Top 10 */
var onscoresubmit = function(e){
    e.preventDefault();

    var scores = conc.getsavedscores(),
        top10,
        list,
        top10scr = document.getElementById('top10scores').getElementsByTagName('div')[0];

    /* Sort scores */
    top10 = scores.sort( function(a,b){ return b - a; }).splice(0,10);
    list  = conc.buildtop10( top10 );
    conc.savescores( top10 );


    /* Is this the first time we're inserting? If not, replace the current list. */
    if( Object.prototype.toString.call( top10scr.getElementsByTagName('h1')[0].nextElementSibling ) == "[object HTMLParagraphElement]" ){
        top10scr.insertBefore( list, top10scr.lastElementChild );
    } else {
        top10scr.replaceChild(list, top10scr.getElementsByTagName('h1')[0].nextElementSibling);
    }

    top10scr.parentNode.classList.remove('hide');
    document.getElementById('score').classList.add('hide');

    /* Reset scores */
    document.getElementById('resethighscores').addEventListener('click',function(){
        conc.clearscores();
    },false);

}

var onshowscore = function(e){

    var tries     = document.getElementById('tries').getElementsByTagName('b')[0],
        time      = document.getElementById('time').getElementsByTagName('b')[0],
        rate      = document.getElementById('percentage').getElementsByTagName('b')[0],
        points    = document.getElementById('points'),
        scoreobj  = e.detail,
        savescore, succrate, sc,tm, succratetxt;

    if(scoreobj.score){
        var sc = Lib.formatinteger(scoreobj.score);
        points.replaceChild( document.createTextNode(sc), points.firstChild );
    }
    if(scoreobj.tries){
        tries.replaceChild( document.createTextNode(scoreobj.tries), tries.firstChild );
    }
    if(scoreobj.time){
        tm = scoreobj.time+' seconds';
        time.replaceChild( document.createTextNode(tm), time.firstChild );
    }

    if(scoreobj.successrate){
        succrate = scoreobj.successrate;
        succrate = succrate+'%';
        succratetxt = document.createTextNode( Lib.hundredths( succrate ) );

        rate.replaceChild( succratetxt, rate.firstChild );
    }

    document.getElementById('overlay').classList.remove('hide');
    document.getElementById('score').classList.remove('hide');

    savescore = new CustomEvent('savescore',{detail:scoreobj.score});
    window.dispatchEvent(savescore);
}

var onstart = function(){
    document.getElementById('overlay').classList.add('hide');
    document.getElementById('countdown').classList.add('hide');
    document.getElementById('deck').classList.remove('hide');
    start = conc.start();
}

var onstop = function(){
    var scoreevt;
    document.getElementById('deck').classList.add('hide');
    scoreevt       = new CustomEvent('tallyscore');
    scoreevt.start = start;
    scoreevt.end   = conc.stop();
    scoreevt.tries = numtries;
    setTimeout(function(){ window.dispatchEvent(scoreevt); },300);
}

var replay = function(e){
    var cde, config  = document.getElementById('config');
    conc.reset();
    e.target.parentNode.parentNode.classList.add('hide');

    /* Launch a new game */
    cde = document.createEvent('Event');
    cde.initEvent('submit',false,true);
    config.dispatchEvent(cde);
}

window.addEventListener('DOMContentLoaded', init, false);
window.addEventListener('unload', function(e){
    window.removeEventListener('DOMContentLoaded',init,false);
}, false);
