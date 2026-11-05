(function(){
  'use strict';
  var en=document.documentElement.lang==='en';
  var motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.result-range').forEach(function(input){
    function update(){input.parentElement.style.setProperty('--compare-position',input.value+'%');input.setAttribute('aria-valuetext',input.value+'% '+(en?'before':'Vorher')+', '+(100-input.value)+'% '+(en?'after':'Nachher'));}
    input.addEventListener('input',update);update();
  });
  document.querySelectorAll('[data-video-load]').forEach(function(button){button.addEventListener('click',function(){
    var gate=button.closest('.video-gate');var frame=document.createElement('iframe');
    frame.src=gate.dataset.videoSrc+'?autoplay=1';frame.title=gate.dataset.videoTitle;frame.allow='autoplay; encrypted-media; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';gate.replaceChildren(frame);frame.focus();
  });});
  // Decode before moving: lazy loading off-screen copies causes visible gaps.
  function readyImages(root){
    return Promise.all(Array.from(root.querySelectorAll('img')).map(function(img){
      img.loading='eager';
      return img.decode ? img.decode().catch(function(){}) : Promise.resolve();
    }));
  }
  document.querySelectorAll('.ticker').forEach(function(ticker){
    readyImages(ticker).then(function(){ticker.classList.add('is-ready');});
  });
  document.querySelectorAll('.work-strip').forEach(function(strip){
    var group=strip.querySelector('.work-group'),button=strip.querySelector('.work-pause');
    var track=group.parentElement,viewport=strip.querySelector('.work-window');
    var ready=false,automatic=false,distance=0,position=0,lastFrame=0,resumeAt=0,touching=false,frame=0;
    var dragId=null,lastX=0,lastMove=0,velocity=0;
    viewport.tabIndex=0;
    viewport.setAttribute('aria-label',en?'Team photos. Swipe or drag to browse.':'Teamfotos. Zum Durchsehen wischen oder mit der Maus ziehen.');
    function normalize(value){return distance+((value-distance)%distance+distance)%distance;}
    function animate(now){
      frame=0;
      if(!automatic)return;
      var elapsed=lastFrame?Math.min(now-lastFrame,50):0;lastFrame=now;
      var held=touching||now<resumeAt||strip.classList.contains('is-paused')||document.hidden;
      if(held)position=viewport.scrollLeft;
      else if(Math.abs(velocity)>0.02){
        position+=velocity*elapsed;
        velocity*=Math.exp(-elapsed/180);
      }else{
        velocity=0;position+=elapsed*(window.innerWidth<768?0.022:0.0263333);
      }
      if(!touching){
        var wrapped=position<distance||position>=distance*2;
        if(wrapped)position=normalize(position);
        if(!held||wrapped)viewport.scrollLeft=position;
      }
      frame=requestAnimationFrame(animate);
    }
    function hold(){velocity=0;resumeAt=performance.now()+2500;position=viewport.scrollLeft;}
    viewport.addEventListener('dragstart',function(e){e.preventDefault();});
    // Own horizontal gestures: native touch momentum must not fight loop wrapping.
    // touch-action: pan-y still lets the browser handle vertical page scrolling.
    viewport.addEventListener('pointerdown',function(e){
      if(dragId!==null||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
      touching=true;hold();dragId=e.pointerId;lastX=e.clientX;lastMove=performance.now();
      viewport.setPointerCapture(e.pointerId);
      strip.classList.add('is-dragging');
      if(e.pointerType==='mouse')e.preventDefault();
    });
    viewport.addEventListener('pointermove',function(e){
      if(e.pointerId!==dragId)return;
      var now=performance.now(),delta=lastX-e.clientX,elapsed=Math.max(now-lastMove,1);
      // A short touch swipe should cover roughly one photo on mobile.
      if(e.pointerType==='touch')delta*=2;
      // Cap inertia, not finger movement; a quick flick cannot race through the copies.
      velocity=Math.max(-2,Math.min(2,delta/elapsed));
      lastMove=now;lastX=e.clientX;
      position=viewport.scrollLeft+delta;
      if(automatic)position=normalize(position);
      viewport.scrollLeft=position;
    });
    function release(e){
      if(e.pointerId!==dragId)return;
      touching=false;dragId=null;strip.classList.remove('is-dragging');
      if(e.type!=='pointerup'||e.pointerType==='mouse'||performance.now()-lastMove>80)velocity=0;
      position=viewport.scrollLeft;resumeAt=0;lastFrame=0;
    }
    window.addEventListener('pointerup',release,{passive:true});
    window.addEventListener('pointercancel',release,{passive:true});
    viewport.addEventListener('lostpointercapture',release,{passive:true});
    viewport.addEventListener('wheel',hold,{passive:true});
    viewport.addEventListener('keydown',hold);
    function layout(){
      var wasAutomatic=automatic,oldDistance=distance;
      automatic=ready&&!motion.matches;
      strip.classList.toggle('is-auto',automatic);
      if(automatic){
        distance=group.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap);
        var count=Math.ceil(viewport.clientWidth/distance)+3;
        while(track.children.length<count){
          var clone=group.cloneNode(true);clone.setAttribute('aria-hidden','true');
          clone.querySelectorAll('img').forEach(function(img){img.alt='';img.loading='eager';});
          track.appendChild(clone);
        }
        if(!wasAutomatic){position=distance;lastFrame=0;}
        else if(oldDistance!==distance)position=distance+(viewport.scrollLeft%oldDistance)/oldDistance*distance;
        viewport.scrollLeft=position;
        if(!frame)frame=requestAnimationFrame(animate);
      }else{
        if(frame)cancelAnimationFrame(frame);frame=0;lastFrame=0;
        if(wasAutomatic)viewport.scrollLeft=0;
      }
      button.hidden=!automatic;
    }
    readyImages(group).then(function(){ready=true;layout();});
    new ResizeObserver(layout).observe(viewport);
    motion.addEventListener('change',layout);
    button.addEventListener('click',function(){velocity=0;var paused=strip.classList.toggle('is-paused');button.setAttribute('aria-pressed',String(paused));button.textContent=paused?(en?'Play photos':'Bilder fortsetzen'):(en?'Pause photos':'Bilder pausieren');});
  });
  var video=document.querySelector('.hero-video');
  if(video){var control=document.createElement('button');control.type='button';control.className='hero-motion';video.parentElement.appendChild(control);
    function label(){control.textContent=video.paused?(en?'Play background video':'Hintergrundvideo abspielen'):(en?'Pause background video':'Hintergrundvideo pausieren');}
    control.addEventListener('click',function(){if(video.paused)video.play().catch(label);else video.pause();});video.addEventListener('play',label);video.addEventListener('pause',label);motion.addEventListener('change',function(){if(motion.matches)video.pause();});if(!motion.matches)video.play().catch(label);label();
  }
})();
