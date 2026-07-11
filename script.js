document.addEventListener('DOMContentLoaded', () => {
  // ===== Custom Ethereal Cursor =====
  const customCursor = document.getElementById('customCursor');
  const customCursorDot = document.getElementById('customCursorDot');
  
  // Completely disable on touch/mobile devices for ultimate performance
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
  
  if (isTouchDevice) {
    if (customCursor) customCursor.style.display = 'none';
    if (customCursorDot) customCursorDot.style.display = 'none';
  } else if (customCursor && customCursorDot) {
    let mouseX = 0, mouseY = 0; // Target coordinates
    let ringX = 0, ringY = 0;   // Interpolated coordinates for outer ring
    let isTicking = false;
    
    const updateCursor = () => {
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      
      ringX += dx * 0.15;
      ringY += dy * 0.15;
      
      customCursor.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      
      // Stop the loop if the ring has caught up to mouse position to save CPU cycles
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        ringX = mouseX;
        ringY = mouseY;
        isTicking = false;
      } else {
        requestAnimationFrame(updateCursor);
      }
    };
    
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Instantly position the center dot
      customCursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(updateCursor);
      }
    }, { passive: true });
    
    // Manage hover interactions
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], .filter-btn, .gal-nav-btn, .pill-btn');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'), { passive: true });
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'), { passive: true });
    });
    
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
      item.addEventListener('mouseenter', () => document.body.classList.add('cursor-view'), { passive: true });
      item.addEventListener('mouseleave', () => document.body.classList.remove('cursor-view'), { passive: true });
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      customCursor.style.opacity = '0';
      customCursorDot.style.opacity = '0';
    }, { passive: true });
    document.addEventListener('mouseenter', () => {
      customCursor.style.opacity = '1';
      customCursorDot.style.opacity = '1';
    }, { passive: true });
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
    let isTicking = false;
    
    // Cache DOM selections once to avoid layout thrashing
    const cachedGalleryItems = Array.from(document.querySelectorAll('.gallery-grid .gallery-item'));
    const teamVisual = document.querySelector('.team-visual');
    const aboutCard = document.querySelector('.about-card');
    
    const updateSkew = () => {
      const scrollY = window.scrollY;
      scrollSpeed = scrollY - lastScrollY;
      lastScrollY = scrollY;
      
      skewTarget = Math.max(-6, Math.min(6, scrollSpeed * 0.08));
      currentSkew += (skewTarget - currentSkew) * 0.15;
      
      // Stop the loop if the skew settles back close to 0 to save CPU resources
      if (Math.abs(currentSkew) < 0.01 && Math.abs(skewTarget) < 0.01) {
        currentSkew = 0;
        isTicking = false;
        
        cachedGalleryItems.forEach((item, index) => {
          const desktopOffset = (index % 2 === 0) ? -30 : 30;
          item.style.transform = `translate3d(0, ${desktopOffset}px, 0)`;
        });
        if (teamVisual) teamVisual.style.transform = 'rotate(-1.5deg)';
        if (aboutCard) aboutCard.style.transform = 'none';
        return; // Exit animation loop
      }
      
      cachedGalleryItems.forEach((item, index) => {
        const desktopOffset = (index % 2 === 0) ? -30 : 30;
        item.style.transform = `translate3d(0, ${desktopOffset}px, 0) skewY(${currentSkew}deg)`;
      });
      
      if (teamVisual) {
        teamVisual.style.transform = `rotate(-1.5deg) skewY(${currentSkew}deg)`;
      }
      if (aboutCard) {
        aboutCard.style.transform = `skewY(${currentSkew * 0.5}deg)`;
      }
      
      requestAnimationFrame(updateSkew);
    };
    
    window.addEventListener('scroll', () => {
      if (!isTicking) {
        lastScrollY = window.scrollY;
        isTicking = true;
        requestAnimationFrame(updateSkew);
      }
    }, { passive: true });
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

  // ===== Gallery Scroll Progress Indicator for Mobile =====
  const galleryScrollContainer = document.getElementById('galleryTrack');
  const galleryProgressBar = document.getElementById('galleryProgressBar');
  if (galleryScrollContainer && galleryProgressBar) {
    galleryScrollContainer.addEventListener('scroll', () => {
      const scrollWidth = galleryScrollContainer.scrollWidth - galleryScrollContainer.clientWidth;
      if (scrollWidth > 0) {
        const scrollPercent = (galleryScrollContainer.scrollLeft / scrollWidth) * 100;
        galleryProgressBar.style.width = `${scrollPercent}%`;
      }
    }, { passive: true });
  }

  // ===== Mobile Navigation Active Section Sync =====
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const targetSections = document.querySelectorAll('#home, #about, #gallery, #contact');
  if (mobileNavLinks.length > 0 && targetSections.length > 0) {
    const navSyncObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id');
          if (!sectionId) return;
          mobileNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-30% 0px -40% 0px', // Triggers when section occupies middle of viewport
      threshold: 0.1
    });

    targetSections.forEach(section => {
      navSyncObserver.observe(section);
    });
  }

  // ===== Logo Click Sparkle/Spin Animation & Smooth Scroll =====
  const logoLink = document.getElementById('logoContainerLink');
  const logoImg = document.getElementById('logoImg');
  if (logoLink && logoImg) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Trigger animation
      logoImg.classList.add('animate-click');
      setTimeout(() => {
        logoImg.classList.remove('animate-click');
      }, 800);
      
      // Smooth scroll to top/home
      const homeSection = document.getElementById('home');
      if (homeSection) {
        homeSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Update active state in mobile bottom nav
      const homeNavLink = document.querySelector('.mobile-nav-link[href="#home"]');
      if (homeNavLink) {
        document.querySelectorAll('.mobile-nav-link').forEach(link => link.classList.remove('active'));
        homeNavLink.classList.add('active');
      }
    });
  }
});
