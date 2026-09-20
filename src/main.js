import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mqMobile = window.matchMedia('(max-width: 768px)');
const isMobileView = () => mqMobile.matches;

/* ---------- 3D bold geometry background ---------- */
function initWebGL() {
  const canvas = document.getElementById('webgl');
  if (!canvas) return;
  if (prefersReduced) {
    document.body.classList.add('no-3d');
    return;
  }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (e) {
    document.body.classList.add('no-3d');
    return;
  }
  renderer.setClearColor(0x05070f, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileView() ? 1.5 : 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070f);
  scene.fog = new THREE.FogExp2(0x05070f, 0.028);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, isMobileView() ? 13 : 10);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(5, 8, 6);
  scene.add(key);
  const teal = new THREE.PointLight(0x1abc9c, 60, 30);
  teal.position.set(-5, 2, 3);
  scene.add(teal);
  const violet = new THREE.PointLight(0x7c5cff, 60, 30);
  violet.position.set(5, -10, 2);
  scene.add(violet);

  const tealMat = new THREE.MeshStandardMaterial({
    color: 0x1abc9c, wireframe: true, transparent: true, opacity: 0.75,
  });
  const violetMat = new THREE.MeshStandardMaterial({
    color: 0x7c5cff, wireframe: true, transparent: true, opacity: 0.7,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffb454, wireframe: true, transparent: true, opacity: 0.55,
  });

  // Hero cluster (lighter geometry on mobile)
  const mobile = isMobileView();
  const heroGroup = new THREE.Group();
  const knot = new THREE.Mesh(
    mobile
      ? new THREE.TorusKnotGeometry(1.4, 0.38, 80, 12)
      : new THREE.TorusKnotGeometry(1.7, 0.45, 150, 22),
    tealMat
  );
  heroGroup.add(knot);
  const ring = new THREE.Mesh(
    mobile
      ? new THREE.TorusGeometry(2.4, 0.04, 10, 48)
      : new THREE.TorusGeometry(2.8, 0.04, 16, 96),
    violetMat
  );
  ring.rotation.x = Math.PI / 2.4;
  heroGroup.add(ring);
  const sat = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 0), goldMat);
  sat.position.set(2.6, 1, 0);
  heroGroup.add(sat);
  heroGroup.position.set(mobile ? 0 : 2.6, mobile ? 0.6 : 0, mobile ? -1 : 0);
  if (mobile) heroGroup.scale.setScalar(0.85);
  scene.add(heroGroup);

  // Works cluster
  const worksGroup = new THREE.Group();
  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(mobile ? 1.6 : 2.1, 1), violetMat);
  worksGroup.add(ico);
  const inner = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), tealMat);
  worksGroup.add(inner);
  worksGroup.position.set(mobile ? 0 : -2.8, -12, -1);
  scene.add(worksGroup);

  // Contact cluster
  const endGroup = new THREE.Group();
  const oct = new THREE.Mesh(new THREE.OctahedronGeometry(mobile ? 1.4 : 1.8, 0), goldMat);
  endGroup.add(oct);
  const torus = new THREE.Mesh(
    mobile
      ? new THREE.TorusGeometry(2.0, 0.06, 10, 48)
      : new THREE.TorusGeometry(2.4, 0.06, 16, 80),
    tealMat
  );
  endGroup.add(torus);
  endGroup.position.set(mobile ? 0 : 2.4, -24, -1);
  scene.add(endGroup);

  // Particles (reduced on both for Home/End jump stability)
  const COUNT = mobile ? 500 : 1100;
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT * 3; i += 3) {
    pos[i] = (Math.random() - 0.5) * 30;
    pos[i + 1] = (Math.random() - 0.5) * 40;
    pos[i + 2] = (Math.random() - 0.5) * 20 - 2;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.035, color: 0x9aa4bf, transparent: true, opacity: 0.7 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Scroll-driven camera
  gsap.to(camera.position, {
    y: -26,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.2 },
  });
  gsap.to(scene.rotation, {
    y: Math.PI * 0.35,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.5 },
  });

  // Mouse + touch parallax
  let mx = 0;
  let my = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 1.4;
    my = (e.clientY / window.innerHeight - 0.5) * 0.8;
  });
  window.addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches[0];
      if (!t) return;
      mx = (t.clientX / window.innerWidth - 0.5) * 1.4;
      my = (t.clientY / window.innerHeight - 0.5) * 0.8;
    },
    { passive: true }
  );

  const timer = new THREE.Timer();
  timer.connect(document);
  function tick(timestamp) {
    timer.update(timestamp);
    const t = timer.getElapsed();
    knot.rotation.x = t * 0.18;
    knot.rotation.y = t * 0.24;
    ring.rotation.z = t * 0.1;
    sat.position.y = 1 + Math.sin(t * 1.4) * 0.4;
    sat.rotation.x = t * 0.8;
    ico.rotation.y = t * 0.15;
    inner.rotation.x = t * 0.3;
    inner.rotation.y = t * 0.22;
    oct.rotation.y = t * 0.2;
    torus.rotation.x = t * 0.12;
    torus.rotation.y = t * 0.16;
    particles.rotation.y = t * 0.015;

    camera.position.x += (mx - camera.position.x) * 0.03;
    camera.lookAt(camera.position.x * 0.4, camera.position.y, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileView() ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Keep clusters centered on narrow screens
    const m = isMobileView();
    camera.position.z = m ? 13 : 10;
    heroGroup.position.set(m ? 0 : 2.6, m ? 0.6 : 0, m ? -1 : 0);
    heroGroup.scale.setScalar(m ? 0.85 : 1);
    worksGroup.position.x = m ? 0 : -2.8;
    endGroup.position.x = m ? 0 : 2.4;
  });
}

/* ---------- UI animations ---------- */
function initUI() {
  // Header + progress
  const header = document.querySelector('header');
  const progress = document.getElementById('progress');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      if (progress) progress.style.transform = `scaleX(${self.progress})`;
      if (header) header.classList.toggle('scrolled', self.scroll() > 40);
    },
  });

  // Reveals
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // Skill bars
  gsap.utils.toArray('.bar i').forEach((bar) => {
    const target = bar.getAttribute('data-progress') || '80';
    ScrollTrigger.create({
      trigger: bar,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(bar, { width: `${target}%`, duration: 1.4, ease: 'power3.out' }),
    });
  });

  // Counters
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const target = parseInt(el.getAttribute('data-count') || '0', 10);
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${Math.floor(obj.v).toLocaleString()}+`;
          },
        }),
    });
  });

  // Filters
  const buttons = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.work-card');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.getAttribute('data-filter');
      cards.forEach((c) => {
        const show = f === 'all' || c.getAttribute('data-cat') === f;
        c.style.display = show ? '' : 'none';
        if (show) gsap.fromTo(c, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45 });
      });
      ScrollTrigger.refresh();
    });
  });

  // Testimonials
  const data = [
    { name: 'Aarav Mehta', role: 'Startup Founder', img: 'https://i.pravatar.cc/150?img=12', text: 'Khushpreet rebuilt our landing page with a premium dark 3D feel. Conversions went up and the site finally feels world-class.' },
    { name: 'Sarah Williams', role: 'Product Manager', img: 'https://i.pravatar.cc/150?img=47', text: 'Fast, communicative and detail-obsessed. The scroll animations are smooth and never hurt performance on mobile.' },
    { name: 'Rohan Kapoor', role: 'E-commerce Owner', img: 'https://i.pravatar.cc/150?img=33', text: 'Our storefront looks expensive now. Great eye for spacing, type and interactive depth. Highly recommended.' },
  ];
  let idx = 0;
  const tText = document.getElementById('t-text');
  const tName = document.getElementById('t-name');
  const tRole = document.getElementById('t-role');
  const tImg = document.getElementById('t-img');
  const render = (i) => {
    if (!tText) return;
    gsap.fromTo('.testi', { opacity: 0.3, x: 14 }, { opacity: 1, x: 0, duration: 0.4 });
    tText.textContent = `“${data[i].text}”`;
    tName.textContent = data[i].name;
    tRole.textContent = data[i].role;
    tImg.src = data[i].img;
    tImg.alt = data[i].name;
  };
  document.getElementById('t-prev')?.addEventListener('click', () => {
    idx = (idx - 1 + data.length) % data.length;
    render(idx);
  });
  document.getElementById('t-next')?.addEventListener('click', () => {
    idx = (idx + 1) % data.length;
    render(idx);
  });
  setInterval(() => {
    idx = (idx + 1) % data.length;
    render(idx);
  }, 6000);

  // Mobile menu
  const menuBtn = document.getElementById('menu-btn');
  const links = document.getElementById('nav-links');
  menuBtn?.addEventListener('click', () => links?.classList.toggle('open'));
  links?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => links.classList.remove('open')));

  // Contact form: AJAX submit + reset, plus reset on back-navigation
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  if (contactForm) {
    // Covers Formspree redirect / Back button / bfcache restoring old values
    window.addEventListener('pageshow', () => {
      contactForm.reset();
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if (formStatus) formStatus.textContent = 'Sending…';
      if (btn) btn.disabled = true;
      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('send failed');
        contactForm.reset();
        if (formStatus) formStatus.textContent = 'Message sent — I reply within 24h.';
      } catch (err) {
        // Fallback: let the browser do a normal POST (still resets on return via pageshow)
        contactForm.submit();
        return;
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  // Footer year
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
}

initWebGL();
initUI();
