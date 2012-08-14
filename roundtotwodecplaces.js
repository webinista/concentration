function populate(){
    var num = Math.random() * 10000;
    i = 0;

    while( i < 100 ){
        var splitondecimal = num.toString().split('.');
        splitondecimal[1] = splitondecimal[1].substr(0,2);
        num = splitondecimal.join('.') * 1;

        localStorage[ Date.now() ] = num;
        i++;
    }

}
populate();
