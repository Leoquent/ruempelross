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
    var desktop=window.matchMedia('(min-width:768px)'),ready=false;
    function layout(){
      var moving=ready&&!motion.matches&&desktop.matches;
      if(moving){
        var distance=group.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap);
        track.style.setProperty('--work-distance',distance+'px');
        track.style.setProperty('--work-duration',(distance/26.3333)+'s');
        // Enough copies to cover the viewport even at the end of a full cycle.
        var count=Math.ceil(viewport.clientWidth/distance)+1;
        while(track.children.length<count){
          var clone=group.cloneNode(true);clone.setAttribute('aria-hidden','true');
          clone.querySelectorAll('img').forEach(function(img){img.alt='';img.loading='eager';});
          track.appendChild(clone);
        }
      }
      strip.classList.toggle('is-moving',moving);button.hidden=!moving;
    }
    readyImages(group).then(function(){ready=true;layout();});
    new ResizeObserver(layout).observe(viewport);
    desktop.addEventListener('change',layout);motion.addEventListener('change',layout);
    button.addEventListener('click',function(){var paused=strip.classList.toggle('is-paused');button.setAttribute('aria-pressed',String(paused));button.textContent=paused?(en?'Play photos':'Bilder fortsetzen'):(en?'Pause photos':'Bilder pausieren');});
  });
  var video=document.querySelector('.hero-video');
  if(video){var control=document.createElement('button');control.type='button';control.className='hero-motion';video.parentElement.appendChild(control);
    function label(){control.textContent=video.paused?(en?'Play background video':'Hintergrundvideo abspielen'):(en?'Pause background video':'Hintergrundvideo pausieren');}
    control.addEventListener('click',function(){if(video.paused)video.play().catch(label);else video.pause();});video.addEventListener('play',label);video.addEventListener('pause',label);motion.addEventListener('change',function(){if(motion.matches)video.pause();});if(!motion.matches)video.play().catch(label);label();
  }
})();
