var narrowView = false;

function loadBindings(){
    $("footer .social").hover(function(){
        $(this).stop().animate({opacity:'1.0'},300);
    },function(){
        $(this).stop().animate({opacity:'0.3'},300);
    });
    /*$("article").hover(function(){
        $(this).find(".date").stop().animate({opacity:'1.0'},300);
     },function(){
        $(this).find(".date").stop().animate({opacity:'0.5'},300);
     });*/
     $(".thumb").hover(function(){
        $(this).stop().animate({opacity:'0.6'},300);
     },function(){
        $(this).stop().animate({opacity:'1.0'},300);
     });
     $("nav a").hover(function(){
        $(this).stop().animate({'background-color':'rgba(200,200,200,0.15)'},300);
     },function(){
        $(this).stop().animate({'background-color':'rgba(200,200,200,0.0)'},300);
     });

     if(mobile == false){
        $("header, footer").hover(function(){
            $("footer").stop().animate({'bottom':'20px'},300);
            lastfmHeight = $("header").height() - $("#profile").height() - $("nav").height() - 160; 
            $("#lastfm").stop().animate({opacity: '1.0', height: lastfmHeight+'px'}, 300);
        },function(){
            $("footer").stop().animate({'bottom':'-70px'},300);
            lastfmHeight = $("header").height() - $("#profile").height() - $("nav").height() - 110;
            $("#lastfm").stop().animate({opacity: '0.4', height: lastfmHeight+'px'}, 300);
        });
    }
}

function handleWindowResize(){
    if ($(window).width() < 700){
        narrowView = true;
        $("section.small").css({'width':'100%', 'margin':'0px'});
        $("header").css({'padding':'10px 0px','position':'relative','width':'100%','height':'auto','clear':'both'});
        $("#main").css({'margin':'10px auto', 'width':'100%'});
        $("h2").css({'padding':'20px 10px'});
        $("footer").css({'position':'absolute','top':'10px','left':'10px','width':'50px'});
        $(".thumb").css({'width':'100%', 'margin':'10px 0px'});
        $("nav a").css({'min-width':'auto'});
        $("nav").css({'text-align':'center', 'width':'auto', 'margin':'10px 10px'});
        $("#lastfm").css({'display':'none'});
    }
    else{
        narrowView = false;
        var smallSectWidth = ($(window).width() - 330)/2 - 20;
        $("section.small").css({'width':'48%', 'margin':'1%'}); 
        $("header").css({'padding':'0px','position':'fixed','top':'0px','width':'300px','height':'100%'});
        $("#main").css({'margin-left':'310px', 'margin-top':'0px', 'margin-right':'10px','width':'auto'});
        $("footer").css({'position':'fixed','bottom':'-70px','top':'auto','left':'15px','width':'280px'});
        $(".thumb").css({'width':'40%', 'margin':'10px 4%'});   
        $("nav a").css({'min-width':'60px'});
        $("nav").css({'text-align':'left', 'width': '60%', 'margin':'10px auto'});
        lastfmHeight = $("header").height() - $("#profile").height() - $("nav").height() - 110;
        $("#lastfm").css({'display':'block','height':lastfmHeight+'px'});
    }
}

function tesellatePhotos(){
    var $container = $('#photos');
    $container.imagesLoaded( function(){
        $container.masonry({
            itemSelector : '.thumb'
        });
    });
}

/*function tesallatePosts(){
    var $container = $('.tiled');
    $container.imagesLoaded( function(){
        $container.masonry({
            itemSelector : 'article'
        });
    });
}*/

function moveFooter(){
    $("footer").css({bottom:'-70px'});
}

function getLastFm(){
    $.getJSON("http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=flyingsparks&api_key=d6b7875c6b075a3d0dfd03a15aacd1f0&format=json"    ,function(result){
        $("#songs").html('');
        if(result.recenttracks.track == null){
            return false;
        }
        nowPlaying = false;
        for (var i = 0; i < result.recenttracks.track.length; i++){
            track = result.recenttracks.track[i]
            title = track.name;
            artist = track.artist['#text'];
            time = "";
            playing = false;
            if (track['@attr'] != null){
                playing = track['@attr']['nowplaying'];
            }
            if (track.date != null){
                current_time = Math.floor(new Date().getTime()/1000);
                track_time = track.date.uts;
                diff = current_time - track_time;
                if(diff < 60){
                    time = diff+" secs ago"
                }
                if(diff >= 60 && diff < 3600){
                    mins = Math.floor(diff / 60);
                    time = mins+" mins ago"
                }
                if(diff >= 3600){
                    hours = Math.floor(diff / 3600);
                    if(hours == 1){time = hours+" hour ago";}
                    else{time = hours+" hours ago";}
                }
            }
            var ls = '<a href="'+track.url+'" target="_blank" class="song';
            if(playing == "true"){
                   ls = ls + " now-playing";
                   nowPlaying = true;
            }
            else{
                   ls = ls + " not-now-playing";
            }
            ls = ls+ '"><span class="title">'+title+'</span><span class="artist">'+artist+ '</span>';
            if(time != ""){
                ls = ls + '<span class="time">'+time+'</span>';
            }
            // Ensure lastfm image shown correctly even if no now-playing track:
            if(nowPlaying == false){
                $("#songs").css({'margin-top':'30px'});
            }
            else{$("#songs").css({'margin-top':'0px'});}
            ls = ls+'<div style="clear:both"></div></a>';
            $("#songs").append(ls);
        }
        if (narrowView == false){
            lHeight = $("header").height() - $("#profile").height() - $("nav").height() - 110;
            $("#lastfm").css({'height':lHeight+'px'});
            $("#lastfm").fadeIn(1000);
            $("#lastfm").stop().animate({opacity:'0.4'}, 1000);
        }
        loadBindings();
    });
}

$(window).resize(function(){
    if(mobile == false){
        handleWindowResize();
        tesellatePhotos();
    }
});

$(document).ready(function(){
    loadBindings();
    tesellatePhotos();
    $("pre.python").snippet("python", {style:"acid", showNum:false, menu:false});
    $("pre.shell").snippet("sh", {style:"acid", showNum:false, menu:false});
    $("pre.javascript").snippet("javascript", {style:"acid", showNum:false, menu:false});
    $("pre.java").snippet("java", {style:"acid", showNum:false, menu:false});


    $("pre").css({'box-shadow':'none', 'padding':'0px', 'border-radius':'3px'});
    if(mobile == false){
        handleWindowResize();
        moveFooter();
        lastfmSuccess = getLastFm();
       handleWindowResize();
        setInterval(function(){getLastFm()}, 30000);
    }   
});
