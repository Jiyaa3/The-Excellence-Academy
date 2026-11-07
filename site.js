/* ==========================================================================
   THE EXCELLENCE ACADEMY - INTERACTIVE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Dynamic Footer Year
  var yEl = document.getElementById('y');
  if (yEl) {
    yEl.textContent = new Date().getFullYear();
  }

  // 2. Data Backend Configuration (Dual-Sync: Supabase + Google Sheets + Local Backup)
  var SHEET_URL = 'https://script.google.com/macros/s/AKfycbxjWs0Kvr2bLv-9GyTUkKQ0f0iaAcUShWRi3O7DocY94br_-r0ilZLzwLp-ua9Iq97kaQ/exec';
  var SUPABASE_CONFIG = {
    url: 'https://rzyxfifmkmhbiyegyvpj.supabase.co',
    publishableKey: 'sb_publishable_8lKztrYIds2UNrxURdrZQQ_vKEeS9DP',
    table: 'demo_bookings'
  };

  async function sendToSupabase(payload) {
    var url = SUPABASE_CONFIG.url + '/rest/v1/' + SUPABASE_CONFIG.table;
    var body = JSON.stringify(payload);

    try {
      var res = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.publishableKey,
          'Authorization': 'Bearer ' + SUPABASE_CONFIG.publishableKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: body
      });

      if (res.ok) {
        var data = await res.json();
        console.log('✓ Successfully saved to Supabase:', data);
        return data;
      } else {
        var errText = await res.text();
        console.warn('Supabase insert notice:', res.status, errText);
      }
    } catch (err) {
      console.warn('Supabase network notice:', err);
    }
    return null;
  }

  function backupLocalLead(payload) {
    try {
      var leads = JSON.parse(localStorage.getItem('ea_local_leads') || '[]');
      var lead = Object.assign({}, payload, {
        id: payload.id || ('local_' + Date.now()),
        created_at: payload.created_at || new Date().toISOString()
      });

      // Avoid immediate duplicates
      var exists = leads.some(function (l) {
        return l.phone === lead.phone && Math.abs(new Date(l.created_at) - new Date(lead.created_at)) < 30000;
      });

      if (!exists) {
        leads.unshift(lead);
        if (leads.length > 300) leads.pop();
        localStorage.setItem('ea_local_leads', JSON.stringify(leads));
      }

      // Notify any listening tab or window
      try {
        window.dispatchEvent(new CustomEvent('lead_added', { detail: lead }));
      } catch (e) {}
    } catch (e) {}
  }

  // 3. Indian Mobile Number Validation
  function checkPhone(el) {
    el.value = el.value.replace(/[^\d+\s-]/g, '');
    var v = el.value.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');
    if (/^\d{10}$/.test(v) && v !== el.value) el.value = v;

    var m = '';
    if (!/^\d{10}$/.test(v)) {
      m = 'Please enter a valid 10-digit mobile number.';
    } else if (!/^[6-9]/.test(v)) {
      m = 'Mobile number must start with 6, 7, 8 or 9.';
    }
    el.setCustomValidity(m);
  }

  ['p', 'mp', 'hero-phone'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function () {
        checkPhone(el);
      });
    }
  });

  // 4. Form Submission Handling
  function wireForm(form, msgEl, afterFn) {
    if (!form || !msgEl) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      var btn = form.querySelector('button[type=submit]');
      var originalBtnText = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Submitting...';
      }
      msgEl.className = 'form-status';
      msgEl.textContent = 'Submitting your details, please wait...';

      var fd = new FormData(form);
      var nameVal = (fd.get('name') || '').toString().trim();
      var phoneVal = (fd.get('phone') || '').toString().trim();
      var courseVal = (fd.get('cls') || fd.get('course') || 'General Demo Class').toString().trim();
      var sourceVal = (fd.get('source') || 'Website Demo Booking').toString().trim();
      var notesVal = (fd.get('notes') || fd.get('msg') || '').toString().trim();

      var payload = {
        name: nameVal,
        phone: phoneVal,
        course: courseVal,
        source: sourceVal,
        notes: notesVal,
        status: 'New'
      };

      // A. Immediately save to LocalStorage so Admin Panel sees it right away
      backupLocalLead(payload);

      // B. Save to Supabase
      var saved = await sendToSupabase(payload);
      if (saved && Array.isArray(saved) && saved[0]) {
        backupLocalLead(saved[0]);
      }

      // C. Submit to Google Sheets Webhook
      try {
        fetch(SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: fd
        }).catch(function () {});
      } catch (err) {}

      // D. UI Success State
      msgEl.className = 'form-status';
      msgEl.textContent = '✓ Thank you! Details received. Our counselor will call you shortly.';
      form.reset();
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
      }
      if (afterFn) afterFn();
    });
  }

  // Wire forms
  wireForm(document.getElementById('enq'), document.getElementById('msg'));
  wireForm(document.getElementById('hero-enq'), document.getElementById('hero-msg'));
  wireForm(document.getElementById('penq'), document.getElementById('pmsg'), function () {
    setTimeout(function () {
      var pop = document.getElementById('pop');
      if (pop && pop.close) pop.close();
      var pm = document.getElementById('pmsg');
      if (pm) pm.textContent = '';
    }, 2500);
  });

  // 5. Modal Dialog Management
  var pop = document.getElementById('pop');
  var popClose = document.getElementById('px');

  function openModal(preferredCourse) {
    if (pop && pop.showModal && !pop.open) {
      if (preferredCourse) {
        var mc = document.getElementById('mc');
        if (mc) {
          for (var i = 0; i < mc.options.length; i++) {
            if (mc.options[i].value.toLowerCase().indexOf(preferredCourse.toLowerCase()) > -1) {
              mc.selectedIndex = i;
              break;
            }
          }
        }
      }
      pop.showModal();
    }
  }

  if (popClose && pop) {
    popClose.addEventListener('click', function () {
      pop.close();
    });
  }

  document.querySelectorAll('[data-enq]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var course = btn.getAttribute('data-course') || '';
      openModal(course);
    });
  });

  // Close modal when clicking backdrop
  if (pop) {
    pop.addEventListener('click', function (e) {
      var rect = pop.getBoundingClientRect();
      var isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
        && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        pop.close();
      }
    });
  }

  // Auto show modal if data-auto is present (with polite delay)
  if (document.body.dataset.auto) {
    setTimeout(function () {
      openModal();
    }, 4000);
  }

  // 6. Mobile Navigation Drawer
  var mobileToggle = document.getElementById('mobileToggle');
  var mobileNav = document.getElementById('mobileNav');
  var mobileBackdrop = document.getElementById('mobileBackdrop');
  var mobileClose = document.getElementById('mobileClose');

  function toggleMobileNav(open) {
    if (!mobileNav || !mobileBackdrop) return;
    if (open) {
      mobileNav.classList.add('open');
      mobileBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      mobileNav.classList.remove('open');
      mobileBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      toggleMobileNav(true);
    });
  }
  if (mobileClose) {
    mobileClose.addEventListener('click', function () {
      toggleMobileNav(false);
    });
  }
  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', function () {
      toggleMobileNav(false);
    });
  }
  document.querySelectorAll('.mobile-menu-items a').forEach(function (link) {
    link.addEventListener('click', function () {
      toggleMobileNav(false);
    });
  });

  // 7. Desktop Dropdown Menu
  var dd = document.querySelector('.nav-dropdown');
  var ddb = document.querySelector('.dropdown-btn');
  if (dd && ddb) {
    ddb.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dd.classList.toggle('open');
      ddb.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function (e) {
      if (!dd.contains(e.target)) {
        dd.classList.remove('open');
        ddb.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        dd.classList.remove('open');
        ddb.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 8. Program Tabs Filtering (Home page)
  var tabButtons = document.querySelectorAll('.tab-btn');
  var courseCards = document.querySelectorAll('.course-card');

  if (tabButtons.length && courseCards.length) {
    tabButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var filter = btn.getAttribute('data-tab');
        courseCards.forEach(function (card) {
          var category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 9. FAQ Accordion
  var faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var isActive = item.classList.contains('active');

      // Close all other FAQs
      document.querySelectorAll('.faq-item').forEach(function (other) {
        if (other !== item) other.classList.remove('active');
      });

      // Toggle current
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });

  // 10. Infinite Testimonials Marquee - Touch Pause Support
  var testiMarquee = document.querySelector('.testi-marquee');
  if (testiMarquee) {
    var testiGroups = testiMarquee.querySelectorAll('.testi-group');
    testiMarquee.addEventListener('touchstart', function () {
      testiGroups.forEach(function (g) {
        g.style.animationPlayState = 'paused';
      });
    }, { passive: true });

    testiMarquee.addEventListener('touchend', function () {
      testiGroups.forEach(function (g) {
        g.style.animationPlayState = 'running';
      });
    }, { passive: true });
  }
});
