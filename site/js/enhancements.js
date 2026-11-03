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
  document.querySelectorAll('.work-strip').forEach(function(strip){
    var group=strip.querySelector('.work-group'),button=strip.querySelector('.work-pause');
    if(!motion.matches&&window.matchMedia('(min-width:768px)').matches){var clone=group.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.querySelectorAll('img').forEach(function(img){img.alt='';});group.parentElement.appendChild(clone);strip.classList.add('is-moving');button.hidden=false;}
    button.addEventListener('click',function(){var paused=strip.classList.toggle('is-paused');button.setAttribute('aria-pressed',String(paused));button.textContent=paused?(en?'Play photos':'Bilder fortsetzen'):(en?'Pause photos':'Bilder pausieren');});
  });
  var video=document.querySelector('.hero-video');
  if(video){var control=document.createElement('button');control.type='button';control.className='hero-motion';video.parentElement.appendChild(control);
    function label(){control.textContent=video.paused?(en?'Play background video':'Hintergrundvideo abspielen'):(en?'Pause background video':'Hintergrundvideo pausieren');}
    control.addEventListener('click',function(){if(video.paused)video.play().catch(label);else video.pause();});video.addEventListener('play',label);video.addEventListener('pause',label);motion.addEventListener('change',function(){if(motion.matches)video.pause();});if(!motion.matches)video.play().catch(label);label();
  }
})();
