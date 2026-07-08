document.addEventListener('DOMContentLoaded', () => {
  // ===== Custom Ethereal Cursor =====
  const customCursor = document.getElementById('customCursor');
  const customCursorDot = document.getElementById('customCursorDot');
  
  if (customCursor && customCursorDot) {
    let mouseX = 0, mouseY = 0; // Target coordinates
    let ringX = 0, ringY = 0;   // Interpolated coordinates for outer ring
    let isMoving = false;
    
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMoving = true;
      
      // Instantly position the dot
      customCursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });
    
    // Animation loop for smooth trailing effect (lerp)
    const renderCursor = () => {
      if (isMoving) {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        customCursor.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);
    
    // Manage hover interactions
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], .filter-btn, .gal-nav-btn, .pill-btn');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
    
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
      item.addEventListener('mouseenter', () => document.body.classList.add('cursor-view'));
      item.addEventListener('mouseleave', () => document.body.classList.remove('cursor-view'));
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      customCursor.style.opacity = '0';
      customCursorDot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      customCursor.style.opacity = '1';
      customCursorDot.style.opacity = '1';
    });
  }

  // ===== Header Scroll State =====
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ===== Sliding Filter Indicator =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterIndicator = document.getElementById('filterIndicator');
  
  const updateFilterIndicator = (activeBtn) => {
    if (!filterIndicator || !activeBtn) return;
    const btnWidth = activeBtn.offsetWidth;
    const btnLeft = activeBtn.offsetLeft;
    filterIndicator.style.width = `${btnWidth}px`;
    filterIndicator.style.transform = `translate3d(${btnLeft - 5}px, 0, 0)`; // Align inside wrapper
  };

  // Initialize indicator for active button on load
  const activeFilterBtn = document.querySelector('.filter-btn.active');
  if (activeFilterBtn) {
    setTimeout(() => {
      updateFilterIndicator(activeFilterBtn);
    }, 200);
  }

  // Update on window resize
  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.filter-btn.active');
    if (currentActive) updateFilterIndicator(currentActive);
  });

  // ===== Velocity-based Scroll Skew (Tactile Interactive Physics) =====
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isReducedMotion && window.innerWidth >= 768) {
    let lastScrollY = window.scrollY;
    let scrollSpeed = 0;
    let skewTarget = 0;
    let currentSkew = 0;
    
    const updateSkew = () => {
      const scrollY = window.scrollY;
      scrollSpeed = scrollY - lastScrollY;
      lastScrollY = scrollY;
      
      // Calculate target skew angle based on scroll speed, capped to avoid breakages
      skewTarget = Math.max(-6, Math.min(6, scrollSpeed * 0.08));
      
      // Smoothly interpolate current skew back to target/zero
      currentSkew += (skewTarget - currentSkew) * 0.15;
      
      // Apply translation adjustments to accommodate staggered margins on desktop
      const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');
      galleryItems.forEach((item, index) => {
        const desktopOffset = (index % 2 === 0) ? -30 : 30; // Matches CSS offsets
        item.style.transform = `translate3d(0, ${desktopOffset}px, 0) skewY(${currentSkew}deg)`;
      });
      
      const teamVisual = document.querySelector('.team-visual');
      if (teamVisual) {
        teamVisual.style.transform = `rotate(-1.5deg) skewY(${currentSkew}deg)`;
      }

      const aboutCard = document.querySelector('.about-card');
      if (aboutCard) {
        aboutCard.style.transform = `skewY(${currentSkew * 0.5}deg)`;
      }
      
      requestAnimationFrame(updateSkew);
    };
    requestAnimationFrame(updateSkew);
  }
  
  // ===== Scroll timeline verification & JS Fallback for unsupported browsers =====
  const supportsScrollTimeline = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
  
  if (!supportsScrollTimeline) {
    // 1. Hero Parallax Fallback
    const heroImage = document.getElementById('heroScrollImg');
    const heroSection = document.getElementById('home');
    if (heroImage && heroSection) {
      window.addEventListener('scroll', () => {
        const sectionRect = heroSection.getBoundingClientRect();
        const sectionHeight = sectionRect.height;
        const scrollOffset = window.pageYOffset || window.scrollY;
        
        if (scrollOffset <= sectionHeight) {
          const scrollPercent = scrollOffset / sectionHeight;
          const translateValue = scrollPercent * 80; // Translate up
          const scaleValue = 1 + (scrollPercent * 0.04);
          heroImage.style.transform = `translate3d(0, ${translateValue}px, 0) scale(${scaleValue})`;
        }
      }, { passive: true });
    }
    
    // 2. Scroll Reveal Fallback using IntersectionObserver
    const revealTargets = document.querySelectorAll('.team-visual, .team-details, .section-header-center, .filter-container-wrapper, .google-reviews-widget-wrapper, .contact-main-info, .contact-social-pane');
    
    revealTargets.forEach(target => {
      target.classList.add('reveal-fallback');
    });
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.05
    });
    
    revealTargets.forEach(target => {
      revealObserver.observe(target);
    });
  }

  // ===== Gallery Track Manual Navigation Arrow Actions =====
  const track = document.getElementById('galleryTrack');
  const leftArrow = document.getElementById('slideLeftBtn');
  const rightArrow = document.getElementById('slideRightBtn');
  
  if (track && leftArrow && rightArrow) {
    const scrollDistance = window.innerWidth * 0.8;
    rightArrow.addEventListener('click', () => {
      track.scrollBy({ left: scrollDistance, behavior: 'smooth' });
    });
    leftArrow.addEventListener('click', () => {
      track.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
    });
  }

  // ===== Dynamic Floating Go To Top Interface Interaction =====
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });
    
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== About Cinematic Background Slideshow Action =====
  const slides = document.querySelectorAll('.about-slide');
  if (slides.length > 0) {
    let currentIdx = 0;
    const nextSlide = () => {
      slides[currentIdx].classList.remove('active');
      currentIdx = (currentIdx + 1) % slides.length;
      slides[currentIdx].classList.add('active');
    };
    setInterval(nextSlide, 5000);
  }

  // ===== Filter Infrastructure Architecture =====
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  const runFilter = (filterValue) => {
    galleryItems.forEach(item => {
      if (filterValue === 'all' || item.dataset.category === filterValue) {
        item.style.display = 'block';
        void item.offsetWidth;
        item.style.opacity = '1';
        // Avoid conflict with scroll skew transforms on desktop
        if (window.innerWidth < 768) {
          item.style.transform = 'scale(1)';
        }
      } else {
        item.style.opacity = '0';
        if (window.innerWidth < 768) {
          item.style.transform = 'scale(0.95)';
        }
        setTimeout(() => {
          if (item.style.opacity === '0') {
            item.style.display = 'none';
          }
        }, 400);
      }
    });
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateFilterIndicator(btn);
      runFilter(btn.dataset.filter);
    });
  });
  
  galleryItems.forEach(item => {
    item.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  // ===== Lightbox Core Modules Framework =====
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-image');
  const closeBtn = document.querySelector('.close-lightbox');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  if (lightbox && lightboxImg && closeBtn && prevBtn && nextBtn) {
    let currentIdx = 0;
    let pool = [];

    const updatePool = () => {
      pool = Array.from(galleryItems).filter(el => el.style.display !== 'none');
    };

    const displayIndex = (index) => {
      if (index < 0 || index >= pool.length) return;
      currentIdx = index;
      const targetSrc = pool[currentIdx].querySelector('img').src;
      
      lightboxImg.style.opacity = '0';
      lightboxImg.style.transform = 'scale(0.97)';
      setTimeout(() => {
        lightboxImg.src = targetSrc;
        lightboxImg.onload = () => {
          lightboxImg.style.opacity = '1';
          lightboxImg.style.transform = 'scale(1)';
        };
      }, 150);
    };

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        updatePool();
        const activeIndex = pool.indexOf(item);
        if (activeIndex !== -1) {
          lightbox.classList.add('active');
          displayIndex(activeIndex);
        }
      });
    });

    const closeLightbox = () => lightbox.classList.remove('active');
    
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      displayIndex((currentIdx - 1 + pool.length) % pool.length);
    });
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      displayIndex((currentIdx + 1) % pool.length);
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        displayIndex((currentIdx - 1 + pool.length) % pool.length);
      } else if (e.key === 'ArrowRight') {
        displayIndex((currentIdx + 1) % pool.length);
      }
    });

    // Mobile Swipe Gestures
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const difference = touchEndX - touchStartX;
      if (Math.abs(difference) > 50) {
        if (difference > 0) {
          displayIndex((currentIdx - 1 + pool.length) % pool.length);
        } else {
          displayIndex((currentIdx + 1) % pool.length);
        }
      }
    };
  }
  
  // ===== Magnetic Button Pull Effect (Micro-interaction) =====
  const magneticElements = document.querySelectorAll('.gal-nav-btn, .scroll-top-trigger');
  if (magneticElements.length > 0 && window.innerWidth >= 768) {
    magneticElements.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const btnX = rect.left + rect.width / 2;
        const btnY = rect.top + rect.height / 2;
        
        const pullX = (e.clientX - btnX) * 0.35;
        const pullY = (e.clientY - btnY) * 0.35;
        
        // Retain original offset translate for grid layout if applicable
        btn.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }
});
