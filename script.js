document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  // Add loaded class to body to trigger page load animations
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 100);

  // ══════════════════════════════════════
  // CUSTOM CURSOR
  // ══════════════════════════════════════
  const cursorDot = document.getElementById('cursor-dot');
  const cursorOutline = document.getElementById('cursor-outline');

  if (cursorDot && cursorOutline && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Lerp animation for cursor outline
    const animateCursor = () => {
      const distX = mouseX - outlineX;
      const distY = mouseY - outlineY;
      
      outlineX += distX * 0.15;
      outlineY += distY * 0.15;
      
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Hover state enhancements
    const interactives = document.querySelectorAll('a, button, .skill-tag, .project-card');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursorOutline.style.borderColor = 'rgba(26, 92, 58, 0.8)';
        cursorOutline.style.background = 'rgba(26, 92, 58, 0.05)';
      });
      el.addEventListener('mouseleave', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.borderColor = 'rgba(26, 92, 58, 0.4)';
        cursorOutline.style.background = 'transparent';
      });
    });
  }

  // ══════════════════════════════════════
  // STICKY NAV & ACTIVE LINKS
  // ══════════════════════════════════════
  const nav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Scroll Spy active section
    let currentSection = '';
    sections.forEach(sec => {
      const sectionTop = sec.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === currentSection) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // ══════════════════════════════════════
  // MOBILE HAMBURGER MENU
  // ══════════════════════════════════════
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (hamburger && mobileMenu) {
    const closeMenu = () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenu.setAttribute('inert', '');
      document.body.classList.remove('menu-open');
    };

    const openMenu = () => {
      hamburger.classList.add('open');
      mobileMenu.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      mobileMenu.removeAttribute('inert');
      document.body.classList.add('menu-open');
      const firstLink = mobileMenu.querySelector('.mobile-link');
      if (firstLink) firstLink.focus();
    };

    const toggleMenu = () => {
      const isOpen = hamburger.classList.contains('open');
      if (isOpen) closeMenu();
      else openMenu();
    };

    hamburger.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburger.classList.contains('open')) {
        closeMenu();
        hamburger.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && hamburger.classList.contains('open')) {
        closeMenu();
      }
    }, { passive: true });

    closeMenu();
  }

  // ══════════════════════════════════════
  // INTERSECTION OBSERVER FOR REVEALS
  // ══════════════════════════════════════
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .section-title, .stagger-card, .draw-line');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        
        // Clear stagger delays once visible so card hovers respond instantly
        if (entry.target.classList.contains('stagger-card')) {
          setTimeout(() => {
            entry.target.style.transitionDelay = '';
          }, 800);
        }

        // If it's the stats bar, trigger counting
        if (entry.target.id === 'stats-bar') {
          triggerCounters();
        }
        
        // Once visible, stop observing to prevent repeated animations
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // Observer specifically for the stats-bar to run triggerCounters
  const statsBar = document.getElementById('stats-bar');
  if (statsBar) {
    revealObserver.observe(statsBar);
  }

  // Stagger delays for project cards
  const staggerCards = document.querySelectorAll('.stagger-card');
  staggerCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
  });

  // ══════════════════════════════════════
  // MOUSE HOVER SPOTLIGHT GLOW
  // ══════════════════════════════════════
  const glowCards = document.querySelectorAll('.project-card, .facts-card, .tl-body');
  if (!isCoarsePointer) {
    glowCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // ══════════════════════════════════════
  // COUNTER UP ANIMATION
  // ══════════════════════════════════════
  let countersTriggered = false;
  
  function triggerCounters() {
    if (countersTriggered) return;
    countersTriggered = true;

    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1500; // ms
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Ease out quad
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(easeProgress * target);
        
        counter.textContent = currentValue;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = target;
        }
      };

      requestAnimationFrame(updateCount);
    });
  }

  // ══════════════════════════════════════
  // SCRAMBLE NAME EFFECT
  // ══════════════════════════════════════
  const nameEl = document.getElementById('scramble-name');
  if (nameEl && !prefersReducedMotion) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const originalText = nameEl.textContent;
    let isScrambling = false;

    const scramble = () => {
      if (isScrambling) return;
      isScrambling = true;

      let iteration = 0;
      const interval = setInterval(() => {
        nameEl.textContent = originalText
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        if (iteration >= originalText.length) {
          clearInterval(interval);
          nameEl.textContent = originalText;
          isScrambling = false;
        }
        iteration += 1 / 3;
      }, 30);
    };

    // Scramble on page load
    setTimeout(scramble, 1000);
    // Scramble on hover
    nameEl.addEventListener('mouseenter', scramble);
  }

  // ══════════════════════════════════════
  // MAGNETIC BUTTONS
  // ══════════════════════════════════════
  const magneticEls = document.querySelectorAll('.magnetic');
  if (window.matchMedia('(pointer: fine)').matches) {
    magneticEls.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Move element slightly towards cursor
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ══════════════════════════════════════
  // COPY EMAIL BUTTON
  // ══════════════════════════════════════
  const copyBtn = document.getElementById('copy-email-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = 'cjsprite81@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied ✓';
        copyBtn.style.borderColor = 'var(--accent)';
        copyBtn.style.color = 'var(--accent)';
        
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    });
  }

  // ══════════════════════════════════════
  // EASTER EGG (CONFETTI ON 5x NAME CLICK)
  // ══════════════════════════════════════
  const logoTrigger = document.getElementById('easter-egg-trigger');
  const canvas = document.getElementById('confetti-canvas');
  let clickCount = 0;

  if (logoTrigger && canvas) {
    const ctx = canvas.getContext('2d');
    let confetti = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Confetto {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height - 20;
        this.size = Math.random() * 8 + 4;
        this.color = ['#1a5c3a', '#e8f0ec', '#0e3d26', '#f5f2ed', '#d4cfc7'][Math.floor(Math.random() * 5)];
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 4 + 3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    let animId;
    const animateConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      confetti.forEach((particle, idx) => {
        particle.update();
        particle.draw();
        
        // Remove particle if off bottom
        if (particle.y > canvas.height) {
          confetti.splice(idx, 1);
        }
      });

      if (confetti.length > 0) {
        animId = requestAnimationFrame(animateConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    logoTrigger.addEventListener('click', (e) => {
      // Allow navigation if not clicking repeatedly, or prevent default to trigger effect
      clickCount++;
      if (clickCount >= 5) {
        e.preventDefault();
        clickCount = 0;
        
        // Spawn 100 particles
        for (let i = 0; i < 100; i++) {
          confetti.push(new Confetto());
        }
        
        cancelAnimationFrame(animId);
        animateConfetti();
      }
      // Reset count if inactivity of 3 seconds
      setTimeout(() => {
        clickCount = 0;
      }, 3000);
    });
  }

  // ══════════════════════════════════════
  // TYPEWRITER EFFECT
  // ══════════════════════════════════════
  const typewriterEl = document.getElementById('code-typewriter');
  if (typewriterEl && !prefersReducedMotion && window.matchMedia('(min-width: 1024px)').matches) {
    const codeText = `<span class="c-kw">class</span> <span class="c-cl">AppointmentController</span>
{
  <span class="c-kw">public function</span> <span class="c-fn">book</span>(Request $r)
  {
    $slot = Slot::<span class="c-fn">available</span>()
      -><span class="c-fn">forDate</span>($r->date)
      -><span class="c-fn">firstOrFail</span>();

    $appt = Appointment::<span class="c-fn">create</span>([
      <span class="c-str">'slot_id'</span> => $slot->id,
      <span class="c-str">'user_id'</span> => auth()-><span class="c-fn">id</span>(),
      <span class="c-str">'service'</span> => $r->service,
      <span class="c-str">'status'</span>  => <span class="c-str">'pending'</span>,
    ]);

    <span class="c-kw">return</span> response()
      -><span class="c-fn">json</span>($appt, 201);
  }
}`;

    let index = 0;
    let currentHtml = '';
    const typingSpeed = 15; // ms per char

    const type = () => {
      if (index < codeText.length) {
        const char = codeText[index];
        if (char === '<') {
          // Tag, find end
          const tagEnd = codeText.indexOf('>', index);
          if (tagEnd !== -1) {
            currentHtml += codeText.substring(index, tagEnd + 1);
            index = tagEnd + 1;
          } else {
            currentHtml += char;
            index++;
          }
        } else if (char === '&') {
          // Entity, find semicolon
          const entityEnd = codeText.indexOf(';', index);
          if (entityEnd !== -1) {
            currentHtml += codeText.substring(index, entityEnd + 1);
            index = entityEnd + 1;
          } else {
            currentHtml += char;
            index++;
          }
        } else {
          currentHtml += char;
          index++;
        }
        typewriterEl.innerHTML = currentHtml;
        setTimeout(type, typingSpeed);
      } else {
        // Finished typing, wait 4 seconds, fade out, clear, fade in, restart
        setTimeout(() => {
          typewriterEl.style.opacity = '0';
          setTimeout(() => {
            typewriterEl.innerHTML = '';
            currentHtml = '';
            index = 0;
            typewriterEl.style.opacity = '1';
            setTimeout(type, 500);
          }, 500);
        }, 4000);
      }
    };

    // Delay start slightly to align with page entrance animations
    setTimeout(type, 1200);
  }
});
