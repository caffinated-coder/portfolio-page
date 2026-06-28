import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  ArrowRight, 
  BookOpen, 
  Compass, 
  Music, 
  Briefcase, 
  Award 
} from 'lucide-react';
import AudioGate from './components/AudioGate';
import Scene from './components/Scene';

// Local inline SVG definition for LinkedIn since installed lucide-react is v1.21
const Linkedin = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={props.className}
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function App() {
  const [showGate, setShowGate] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Monitor sound status
  useEffect(() => {
    const checkSound = setInterval(() => {
      if (window.audioData && window.audioData.isPlaying) {
        setSoundOn(true);
      } else {
        setSoundOn(false);
      }
    }, 500);
    return () => clearInterval(checkSound);
  }, []);

  const handleToggleSound = () => {
    if (!window.audioElement) return;
    if (window.audioData.isPlaying) {
      window.audioElement.pause();
      window.audioData.isPlaying = false;
      setSoundOn(false);
    } else {
      window.audioContext.resume();
      window.audioElement.play().catch(err => console.log(err));
      window.audioData.isPlaying = true;
      setSoundOn(true);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  if (showGate) {
    return <AudioGate onEnter={() => setShowGate(false)} />;
  }

  return (
    <div className="portfolio-app">
      {/* Background 3D Canvas Scene */}
      <Scene />

      {/* Floating Sound Controller Pill */}
      <div className="floating-sound-controller">
        <button 
          onClick={handleToggleSound} 
          className={`sound-pill ${soundOn ? 'sound-active' : 'sound-muted'}`}
        >
          <span className="pill-dot"></span>
          <span>SOUND: {soundOn ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Scrollable DOM Sections */}
      <div className="scroll-container">
        
        {/* SECTION 1: HERO */}
        <section className="vertical-section section-hero" id="hero">
          <div className="section-content hero-wrapper">
            <div className="meta-tag">GEOPOLITICAL RISK & POLICY ANALYSIS</div>
            <h1 className="hero-title">
              SANJAY <span className="stroke-text">SARMAH</span>
            </h1>
            <p className="hero-subtitle">
              M.A. in International Relations & Strategic Studies. Bridging qualitative geopolitical risk analysis with quantitative data visualization to evaluate security, foreign policy, and regional conflicts.
            </p>
            <div className="scroll-indicator">
              <span className="scroll-arrow">↓</span>
              <span className="scroll-text">SCROLL TO DISCOVER</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: BEYOND ACADEMICS / TRAVEL / MUSIC */}
        <section className="vertical-section section-gallery" id="gallery">
          <div className="section-content gallery-wrapper">
            <span className="section-badge">01 // BEYOND ACADEMICS</span>
            <h2 className="section-headline">Wanderlust & Sonic Gradients.</h2>
            <div className="gallery-text-grid">
              <div className="gallery-text-col">
                <Compass size={24} className="col-icon cyan-icon" />
                <h3>Travels & Local Insights</h3>
                <p>
                  Studying geopolitical risk is more than reading report briefs; it's about seeing the terrain. From navigating the mist-shrouded hills of Assam to analyzing public policy at Delhi University and Mumbai, my travels provide a grounded, local context to regional security dynamics.
                </p>
              </div>
              <div className="gallery-text-col">
                <Music size={24} className="col-icon purple-icon" />
                <h3>Acoustic Waves & Logic</h3>
                <p>
                  Beyond strategic affairs, I find balance in music. Playing acoustic guitar and experimenting with loop-building is how I process structure and flow—a mindset that translates directly to the logic of programming in Python and building data systems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SPLIT-SCREEN RESUME DETAILS */}
        <section className="vertical-section section-split" id="resume">
          <div className="split-screen-container">
            {/* LEFT SIDE: Structured, clean academic/professional columns */}
            <div className="split-left-content">
              <span className="section-badge">02 // DOSSIER</span>
              <h2 className="section-headline">Qualifications & Research</h2>
              
              {/* Timeline: Education */}
              <div className="info-block">
                <div className="block-header">
                  <Award size={20} className="header-icon" />
                  <h3>Education</h3>
                </div>
                <div className="timeline">
                  <div className="timeline-item">
                    <span className="item-date">2023 - 2025</span>
                    <h4>M.A. in International Relations & Strategic Studies</h4>
                    <h5>University of Mumbai | 8.0 CGPA</h5>
                  </div>
                  <div className="timeline-item">
                    <span className="item-date">2020 - 2023</span>
                    <h4>B.A. in History & Political Science</h4>
                    <h5>Ramanujan College, University of Delhi | 7.727 CGPA</h5>
                  </div>
                </div>
              </div>

              {/* Timeline: Experience */}
              <div className="info-block">
                <div className="block-header">
                  <Briefcase size={20} className="header-icon" />
                  <h3>Internships</h3>
                </div>
                <div className="timeline">
                  <div className="timeline-item">
                    <span className="item-date">2 Months // 2024</span>
                    <h4>Geopolitical Risk Intern</h4>
                    <h5>World Risk Governance</h5>
                    <p>Monitored South Asia/APAC regions; assisted analysts in drafting daily reports and analyzing corporate political risk.</p>
                  </div>
                  <div className="timeline-item">
                    <span className="item-date">2 Months // 2024</span>
                    <h4>Research Intern</h4>
                    <h5>Foreign Policy Research Centre</h5>
                    <p>Conducted literature reviews and authored papers on Indian Foreign Policy, cybersecurity challenges, and Act East policies.</p>
                  </div>
                  <div className="timeline-item">
                    <span className="item-date">1 Month // 2023</span>
                    <h4>Research Intern</h4>
                    <h5>Forum For Integrated National Security</h5>
                    <p>Conducted secondary research on the strategic, maritime role of Chabahar port under Former Vice Admiral Abhay R. Karve.</p>
                  </div>
                </div>
              </div>

              {/* Grid: Skills */}
              <div className="info-block">
                <div className="block-header">
                  <Compass size={20} className="header-icon" />
                  <h3>Toolkit & Skills</h3>
                </div>
                <div className="skills-grid">
                  <div className="skill-tag">Python</div>
                  <div className="skill-tag">Tableau</div>
                  <div className="skill-tag">Adobe Premiere Pro</div>
                  <div className="skill-tag">After Effects</div>
                  <div className="skill-tag">Photoshop</div>
                  <div className="skill-tag">Canva</div>
                  <div className="skill-tag">G-Suite</div>
                  <div className="skill-tag">Microsoft 365</div>
                </div>
              </div>

              {/* Publications */}
              <div className="info-block">
                <div className="block-header">
                  <BookOpen size={20} className="header-icon" />
                  <h3>Selected Publications</h3>
                </div>
                <div className="publications-list">
                  <a href="https://thediplomat.com/2024/08/the-threat-of-insurgency-in-indias-assam-continues/" target="_blank" rel="noopener noreferrer" className="pub-link">
                    <span>The Threat of Insurgency in India's Assam Continues</span>
                    <span className="pub-meta">The Diplomat, Aug 2024 <ArrowRight size={14} /></span>
                  </a>
                  <a href="https://chintan.indiafoundation.in/articles/balochistan-a-new-republic-in-the-making-or-a-lost-call/" target="_blank" rel="noopener noreferrer" className="pub-link">
                    <span>Balochistan: A New Republic in the Making or a Lost Call?</span>
                    <span className="pub-meta">Chintan, July 2025 <ArrowRight size={14} /></span>
                  </a>
                  <div className="pub-static-item">
                    <span>Cybersecurity Challenges & Indian Foreign Policy</span>
                    <span className="pub-meta-static">FPRC Journal (J-57), 2024 (ISSN 2277-2464)</span>
                  </div>
                  <div className="pub-static-item">
                    <span>Countering AI-Driven Disinformation: A Comparative Regulatory Analysis (EU & India)</span>
                    <span className="pub-meta-static">Master's Dissertation, University of Mumbai</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Reserved for the chaotic reactive fluid shader mesh */}
            <div className="split-right-space">
              {/* This space is kept empty to frame the Three.js FluidShader plane behind it */}
            </div>
          </div>
        </section>

        {/* SECTION 4: CONTACT & DETAILS */}
        <section className="vertical-section section-contact" id="contact">
          <div className="section-content contact-wrapper">
            <span className="section-badge">03 // INQUIRIES</span>
            <h2 className="section-headline">Initiate Research.</h2>
            
            <div className="contact-grid">
              <div className="contact-info-col">
                <p className="contact-pitch">
                  Whether you are looking to collaborate on a geopolitical risk analysis, policy brief drafting, or data visualization project, let's connect.
                </p>
                <div className="social-links">
                  <a href="https://www.linkedin.com/in/sanjay-sarmah-8263921ab/" target="_blank" rel="noopener noreferrer" className="social-pill-link">
                    <Linkedin size={18} />
                    <span>LinkedIn</span>
                  </a>
                  <a href="mailto:sarmah.sanjay@outlook.com" className="social-pill-link">
                    <Mail size={18} />
                    <span>Email</span>
                  </a>
                </div>
              </div>

              <div className="contact-form-col">
                {formSubmitted ? (
                  <div className="form-success-box">
                    <h3>Transmission Complete.</h3>
                    <p>Thank you for reaching out, Sanjay. I will respond to your inquiry via email shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="dossier-form">
                    <div className="form-input-group">
                      <input type="text" placeholder="Full Name" required />
                      <input type="email" placeholder="Email Address" required />
                    </div>
                    <textarea placeholder="Message / Project Scope / Research Requirements" rows="5" required></textarea>
                    <button type="submit" className="submit-dossier-btn">
                      <span>SEND MESSAGE</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="portfolio-footer">
          <div className="footer-content">
            <p>&copy; 2026 SANJAY SARMAH. Web Audio & R3F Parallax Engine.</p>
            <p className="footer-credits">Developed using React, Three.js, and GSAP.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
