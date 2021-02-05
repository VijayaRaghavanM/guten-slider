jQuery(document).ready(function($) {
    const slideshow = $('#slideshow');
    const showDots = slideshow.attr('data-dots') == 'true';
    const showArrows = slideshow.attr('data-arrows') == 'true';
    console.log(showDots, showArrows);
    slideshow.slick({
        dots: showDots,
        arrows: showArrows,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: true, 
        pauseOnDotsHover: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        variableWidth: true,
        adaptiveHeight: true,
    });
    slideshow.on('beforeChange', function(event, slick, current, next){
            const currentElement = document.querySelector(`[data-slick-index="${current}"]`);
            const currentVideo = currentElement.querySelector('video.slide_main');
            const nextElement = document.querySelector(`[data-slick-index="${next}"]`);
            const nextVideo = nextElement.querySelector('video.slide_main');
            
            console.log("Hello");

            if ( currentVideo != null ) {
                currentVideo.pause();
            }
            
            if ( nextVideo != null ) {
                nextVideo.play();
            }
      });
      
      $('video').on('click', function(){
          this.paused ? this.play() : this.pause();
      })
});
