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

=======
TO DOs:

- Make all methods of the Concentration object less
  markup-dependent

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

/*
Let's rethink this whole thing. Should not need to rebuild
scores with every click of the 'View Scores button.'
*/
Concentration.prototype.buildtop10 = function(scoresarray){
    var ol = document.querySelector('#top10scores ol'),
        df = document.createDocumentFragment();

    if( ol === null ){
        ol = document.createElement('ol');
    } else {
        /* Remove children if any */
        while( ol.firstChild ){
            ol.removeChild( ol.firstChild );
        }
    }

    /* pad the array to 10 */
    if( scoresarray.length < 10){
       scoresarray.length = 10;
    }

    scoresarray.map( function(s){
       var sca, li;
       // if this is a null or otherwise falsy value
       !s ? sca = '00000' : sca = Lib.formatinteger(s);
       li = document.createElement('li');
       li.textContent =  sca;
       df.appendChild(li);
    });

    ol.appendChild( df );

    return ol;
}
Concentration.prototype.resetscores = function(){
    var empty10 = [null,null,null,null,null,null,null,null,null,null],
        b = this.buildtop10( empty10 ),

    ts = document.querySelector('#top10scores ol');

    /* Replace the current list. */
    ts.parentNode.replaceChild( b, ts );
    localStorage.clear();
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
       return JSON.parse( localStorage.getItem('webinistaconcentration') );
    } else {
       var arr = [];
       arr.length = 10;
       return arr;
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
       cd    = document.getElementById('countdown'),
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
var tap = Lib.isTouch() ? tap = 'touchend' : tap = 'click';

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
          if( cp.length == 2){
             conc.doesmatch( cp[0], cp[1] );
             numtries++;
          }
          e.target.removeEventListener(transend,onflip,false);
       };

	if( cp.length <= 2){
    	if( curclasses.contains('card') && curclasses.contains('flipped') === false){ 
           curclasses.add('flipped');  
           if( cp.length < 2){
          	cp.push( cur.dataset.cardvalue );
          	cur.addEventListener(transend, onflip, false);
          }
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
    
    window.addEventListener(tap, onclick, false);
    window.addEventListener('savescore',onsavescore,false);
    window.addEventListener('tallyscore', ontallyscore, false);
    window.addEventListener('showscore', onshowscore, false);
    window.addEventListener('matches', onmatch, false);
    window.addEventListener('resetcards', onreset, false);
}

var ontallyscore = function(e){
       var sendscore, p = conf.pairs,
       /*
       calculate the score.
       */
       howlong   = conc.seconds(e.detail.start, e.detail.end),
       tally    = conc.tally(howlong, p, e.detail.tries),
       data     = {};

    /* If it's an infinite number, there's probably an error. */
    if( score === Number.POSITIVE_INFINITY ){
       throw new RangeError('Unable to calculate a score. This can happen if the game has run for too long.');
    } else {
       data.score = Math.round( tally.score );
       data.tries = e.detail.tries;
       data.time  = howlong;
       data.successrate = tally.successrate;
       sendscore  = new CustomEvent('showscore',{detail:data });
       window.dispatchEvent(sendscore);
    }
}

var onmatch = function(e){
    var these      = document.getElementsByClassName('flipped'),
      	len        = these.length,
       	onmatchend = function(t){
          t.target.classList.add('invisible');
          t.target.removeEventListener(transend,onmatchend,false);
         
          /* Restore event listener removed in onclick 
             when a pair has been flipped. */
          window.addEventListener(tap,onclick,false); 
       }

    Array.prototype.map.call(these, function(o){
       o.classList.add('matched');
       o.addEventListener(transend,onmatchend,false);
    });

	/* Check whether we should end the game */
    conc.isdone();
    
    /* Reset the list of flipped items */
    window.dispatchEvent( new CustomEvent('resetcards') );

    
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
	
    /* Restore event listener removed in onclick 
      when a pair has been flipped. */
	window.addEventListener(tap,onclick,false);

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
    document.getElementById('replay').addEventListener(tap,replay,false);
}

/* Show the Top 10 */
var onscoresubmit = function(e){

    e.preventDefault();

    var scores = conc.getsavedscores(),
       top10 = [],
       list,
       len,
       top10scr = document.getElementById('top10scores').getElementsByTagName('div')[0],
       ts;

    /* Sort scores */
    top10 = scores.sort( function(a,b){ return b - a; }).splice(0,10);

    list  = conc.buildtop10( top10 );
    conc.savescores( top10 );

    ts = document.getElementById('top10list');

    if( ts ){
        ts.parentNode.replaceChild(list, ts);
    } else {
        top10scr.insertBefore( list, top10scr.lastElementChild );
    }

    list.parentNode.parentNode.classList.remove('hide');
    document.getElementById('score').classList.add('hide');

    /* Reset scores */
    document.getElementById('resethighscores').addEventListener(tap,function(){
       conc.resetscores();
    },false);
}

var onshowscore = function(e){

    var tries    = document.getElementById('tries').getElementsByTagName('b')[0],
       time     = document.getElementById('time').getElementsByTagName('b')[0],
       rate     = document.getElementById('percentage').getElementsByTagName('b')[0],
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
    var scoreevt, data = {};

    document.getElementById('deck').classList.add('hide');

    data.start = start;
    data.end   = conc.stop();
    data.tries = numtries;

    scoreevt   = new CustomEvent('tallyscore',{detail: data});

    window.dispatchEvent(scoreevt);
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
