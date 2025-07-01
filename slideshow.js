let slideIndex = 1;

// Show slides immediately when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    try {
        showSlides(slideIndex);
        console.log('Slideshow initialized successfully');
    } catch (error) {
        console.error('Error initializing slideshow:', error);
    }
});

// Next/previous controls
function changeSlide(n) {
    try {
        showSlides(slideIndex += n);
    } catch (error) {
        console.error('Error changing slide:', error);
    }
}

// Thumbnail image controls
function currentSlide(n) {
    try {
        showSlides(slideIndex = n);
    } catch (error) {
        console.error('Error setting current slide:', error);
    }
}

function showSlides(n) {
    let slides = document.getElementsByClassName("slides");
    let dots = document.getElementsByClassName("dot");
    
    console.log('Number of slides found:', slides.length);
    console.log('Number of dots found:', dots.length);
    
    if (slides.length === 0) {
        console.error('No slides found in the document');
        return;
    }
    
    // Loop back to first slide
    if (n > slides.length) {
        slideIndex = 1;
    }
    
    // Loop forward to last slide
    if (n < 1) {
        slideIndex = slides.length;
    }
    
    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    // Remove active class from all dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    // Show the current slide and activate the corresponding dot
    slides[slideIndex-1].style.display = "block";
    if (dots.length > 0) {
        dots[slideIndex-1].className += " active";
    }
    
    console.log('Current slide index:', slideIndex);
}

// Auto advance slides every 5 seconds
let autoAdvance = setInterval(function() {
    try {
        changeSlide(1);
    } catch (error) {
        console.error('Error in auto-advance:', error);
        clearInterval(autoAdvance);
    }
}, 5000); 