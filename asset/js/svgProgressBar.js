class svgProgressBar {
    constructor(params) {
        var me = this;
        this.idCont = params.idCont;
        this.cont = d3.select("#"+params.idCont);
        this.width = params.width ? params.width : 100;
        this.height = params.height ? params.height : 30;
        this.duree = params.duree ? params.duree : 10;//en seconde
        this.boutons = params.boutons ? params.boutons : true;
        this.fctEnd = params.fctEnd ? params.fctEnd : false;
        this.fctPause = params.fctPause ? params.fctPause : false;
        this.fctChange = params.fctChange ? params.fctChange : false;
        this.fctPlay = params.fctPlay ? params.fctPlay : false;
        
        var svg, global, color, bar, txt, bbox, animation, tl, rangeTime, fontSize=20
            ,btnPause, btnPlay, btnReload, bPause = false, btnReloadrect=false;            

        this.init = function () {
            
            rangeTime = d3.scaleLinear().domain([0,100]).range([0,me.duree]);
            color = d3.scaleSequential().domain([1,100])
                .interpolator(d3.interpolateTurbo);//d3.interpolateWarm
        
            svg = this.cont.append("svg")
                .attr("id", me.idCont+'svgPB')
                .attr("width","100%").attr("height", me.height)
                .style("margin","6px");            
            bbox = me.cont.node().getBoundingClientRect();
            global = svg.append("g").attr("id",me.idCont+'svgPBglobal');

            //construction de la barre
            bar = global.append("rect")
                .attr("id", me.idCont+'svgPBrect')
                .attr("x", 0)
                .attr("y", 0)
                .attr("height", me.height)
                .attr("width", me.width)
                .attr("fill", color(0));
            //construction du texte
            txt = global.append("text")
                .attr("id", me.idCont+'svgPBtxt')
                .attr("x",me.width/2)
                .attr("y", (me.height/2)+(fontSize/3))
                .text("0%")
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", fontSize+"px")
                .attr("fill", "black");

            //construction de l'animation    
            tl = anime.timeline({
                duration: me.duree*1000,
                easing: 'easeInOutSine',
                update: function(anim) {
                    let progress = Math.round(tl.progress);
                    txt.text(Math.round(me.duree-rangeTime(progress)) + ' s');
                    bar.attr('fill',color(progress))
                    if(btnReloadrect)btnReloadrect.attr('fill',color(progress))
                },
                begin: function(anim) {
                    txt.text(me.duree+' s');
                    //txt.attr('x','0');
                    //bar.attr('x','0');
                },
                complete: function(anim) {
                    if(me.fctEnd)me.fctEnd();
                }
            });
            tl.add({
                targets: ['#'+me.idCont+'svgPBglobal'],
                translateX: bbox.width,
                })

            //construction des boutons
            if(me.boutons){
                let btns = global.append("g")
                    .attr("id", me.idCont+'svgPBbtns');
                btnPause = btns.append("g")
                    .style('cursor','pointer')                
                    .on('click',function(){me.pause()});                
                btnPause.append("rect")
                    .attr("id", me.idCont+'svgPBrect')
                    .attr("x", 3)
                    .attr("y", 2)
                    .attr("rx", 1)
                    .attr("ry", 1)
                    .attr("height", 16)
                    .attr("width", 6)
                    .attr("fill", 'black');            
                btnPause.append("rect")
                    .attr("id", me.idCont+'svgPBrect')
                    .attr("x", 11)
                    .attr("y", 2)
                    .attr("rx", 1)
                    .attr("ry", 1)
                    .attr("height", 16)
                    .attr("width", 6)
                    .attr("fill", 'black');
                btnPlay = btns.append('path')
                    .attr('fill-rule',"evenodd")
                    .style('cursor','pointer')                
                    .attr('d',"M16.75 10.83L4.55 19A1 1 0 0 1 3 18.13V1.87A1 1 0 0 1 4.55 1l12.2 8.13a1 1 0 0 1 0 1.7z")
                    .on('click',function(){bPause=false;me.start()});                
                btnReload = btns.append("g")
                    .style('cursor','pointer')                
                    .attr('transform','translate('+(me.width-20)+')')                
                    .on('click',function(){if(me.fctEnd)me.fctEnd();});                
                //ajoute un rectangle pour faciliter le click              
                btnReloadrect = btnReload.append("rect")
                    .attr("id", me.idCont+'btnReloadrect')
                    .attr("height", 20)
                    .attr("width", 20);
                btnReload.append('path')
                    .style('cursor','pointer')
                    .attr('d',"M15.65 4.35A8 8 0 1 0 17.4 13h-2.22a6 6 0 1 1-1-7.22L11 9h7V2z");

            }          
              
        }

        this.pause = function(){
            tl.pause();
            bPause = true
            btnPause.attr('visibility','hidden');
            btnReload.attr('visibility','visible');
            btnPlay.attr('visibility','visible');
            if(me.fctPause)me.fctPause();

        }

        this.start = function(){
            if(!bPause){
                tl.play();
                if(me.boutons){
                    btnPause.attr('visibility','visible');
                    btnReload.attr('visibility','hidden');
                    btnPlay.attr('visibility','hidden');           
                }
                if(me.fctPlay)me.fctPlay();    
            }
        }

        this.restart = function(){
            tl.restart();
        }
  
        this.hide = function(){
          svg.attr('visibility',"hidden");
        }
        this.show = function(){
          svg.attr('visibility',"visible");
        }

        me.init();

    }
}

  


