import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import AudioGate from './components/AudioGate';
import Scene from './components/Scene';
import CustomCursor from './components/CustomCursor';
import Magnetic from './components/Magnetic';
import TextReveal from './components/TextReveal';

// Local inline SVG definition for LinkedIn since installed lucide-react is v1.21
const Linkedin = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export default function App() {
  const [audioGranted, setAudioGranted] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Synchronize state with background audio pipeline
  const handleToggleSound = () => {
    if (window.audioController) {
      const targetState = !soundOn;
      window.audioController.toggle(targetState);
      setSoundOn(targetState);
    }
  };

  // Synchronize initial sound permissions
  useEffect(() => {
    if (audioGranted && window.audioController) {
      window.audioController.toggle(true);
      setSoundOn(true);
    }
  }, [audioGranted]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="portfolio-app">
      {/* Lusion-style Custom Cursor */}
      <CustomCursor />

      {/* Background 3D Canvas Scene */}
      <Scene />

      {/* Floating Sound Controller Pill */}
      <div className="floating-sound-controller">
        <Magnetic>
          <button 
            onClick={handleToggleSound} 
            className={`sound-pill ${soundOn ? 'sound-active' : 'sound-muted'}`}
          >
            <span className="pill-dot"></span>
            <span>SOUND: {soundOn ? 'ON' : 'OFF'}</span>
          </button>
        </Magnetic>
      </div>

      {/* Interactive Web Audio Entrance Gate */}
      {!audioGranted && <AudioGate onGrant={() => setAudioGranted(true)} />}

      {/* Stark Minimalist Page Container */}
      <div className="portfolio-container">
        
        {/* SECTION 1: HERO */}
        <section className="vertical-section section-hero" id="home">
          <div className="section-content hero-wrapper">
            <span className="section-badge">PORTFOLIO // 2026</span>
            <h1 className="hero-title">
              <TextReveal>SANJAY</TextReveal> <TextReveal className="stroke-text">SARMAH</TextReveal>
            </h1>
            <p className="hero-subtitle">
              Geopolitical Risk & Policy Researcher. Evaluating regional security, conflicts, and strategic policy trends at the intersection of qualitative analysis and data.
            </p>
            <div className="scroll-indicator">
              <span className="scroll-arrow">↓</span>
              <span className="scroll-text">SCROLL FOR DOSSIER</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE DOSSIER */}
        <section className="vertical-section section-dossier" id="dossier">
          <div className="section-content dossier-wrapper">
            <span className="section-badge">01 // DOSSIER</span>
            <h2 className="section-headline">
              <TextReveal>Qualifications & Internships.</TextReveal>
            </h2>

            <div className="dossier-grid">
              
              {/* Education Column */}
              <div className="dossier-col">
                <div className="block-header">
                  <span className="block-header-bullet">//</span>
                  <h3>Education</h3>
                </div>
                <div className="minimal-timeline">
                  <div className="timeline-item">
                    <span className="item-date">2023 - 2025</span>
                    <h4>M.A. in International Relations & Strategic Studies</h4>
                    <p className="item-institution">University of Mumbai | 8.0 CGPA</p>
                  </div>
                  <div className="timeline-item">
                    <span className="item-date">2020 - 2023</span>
                    <h4>B.A. (History & Political Science)</h4>
                    <p className="item-institution">Ramanujan College, University of Delhi | 7.727 CGPA</p>
                  </div>
                </div>
              </div>

              {/* Experience Column */}
              <div className="dossier-col">
                <div className="block-header">
                  <span className="block-header-bullet">//</span>
                  <h3>Internships</h3>
                </div>
                <div className="minimal-timeline">
                  <div className="timeline-item">
                    <span className="item-date">2024 (2 Months)</span>
                    <h4>Geopolitical Risk Intern</h4>
                    <p className="item-institution">World Risk Governance</p>
                    <p className="item-desc">Monitored South Asia security dynamics and compiled risk assessment reports for policy analysts.</p>
                  </div>
                  <div className="timeline-item">
                    <span className="item-date">2024 (2 Months)</span>
                    <h4>Research Intern</h4>
                    <p className="item-institution">Foreign Policy Research Centre</p>
                    <p className="item-desc">Authored papers analyzing Indian Foreign Policy, cybersecurity challenges, and Act East directives.</p>
                  </div>
                  <div className="timeline-item">
                    <span className="item-date">2023 (1 Month)</span>
                    <h4>Research Intern</h4>
                    <p className="item-institution">Forum For Integrated National Security</p>
                    <p className="item-desc">Conducted research on the maritime strategic role of Chabahar port under Former Vice Admiral Abhay R. Karve.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3: INTEL & TOOLKIT */}
        <section className="vertical-section section-intel" id="intel">
          <div className="section-content intel-wrapper">
            <span className="section-badge">02 // INTEL</span>
            
            <div className="intel-grid">
              
              {/* Toolkit Column */}
              <div className="intel-col">
                <div className="block-header">
                  <span className="block-header-bullet">//</span>
                  <h3>Toolkit</h3>
                </div>
                <div className="skills-tags-container">
                  <span className="minimal-tag">Python</span>
                  <span className="minimal-tag">Tableau</span>
                  <span className="minimal-tag">Adobe Premiere Pro</span>
                  <span className="minimal-tag">After Effects</span>
                  <span className="minimal-tag">Photoshop</span>
                  <span className="minimal-tag">Canva</span>
                  <span className="minimal-tag">G-Suite</span>
                  <span className="minimal-tag">Microsoft 365</span>
                </div>
              </div>

              {/* Publications Column */}
              <div className="intel-col">
                <div className="block-header">
                  <span className="block-header-bullet">//</span>
                  <h3>Selected Publications</h3>
                </div>
                <div className="minimal-publications">
                  <Magnetic>
                    <a href="https://thediplomat.com/2024/08/the-threat-of-insurgency-in-indias-assam-continues/" target="_blank" rel="noopener noreferrer" className="minimal-pub-link">
                      <span className="pub-title">The Threat of Insurgency in India's Assam Continues</span>
                      <span className="pub-meta">The Diplomat, Aug 2024 <ArrowRight size={14} /></span>
                    </a>
                  </Magnetic>
                  <Magnetic>
                    <a href="https://chintan.indiafoundation.in/articles/balochistan-a-new-republic-in-the-making-or-a-lost-call/" target="_blank" rel="noopener noreferrer" className="minimal-pub-link">
                      <span className="pub-title">Balochistan: A New Republic in the Making or a Lost Call?</span>
                      <span className="pub-meta">Chintan, July 2025 <ArrowRight size={14} /></span>
                    </a>
                  </Magnetic>
                  <div className="minimal-pub-static">
                    <span className="pub-title">Cybersecurity Challenges & Indian Foreign Policy</span>
                    <span className="pub-meta">FPRC Journal (J-57), 2024 (ISSN 2277-2464)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4: CONTACT */}
        <section className="vertical-section section-contact" id="contact">
          <div className="section-content contact-wrapper">
            <span className="section-badge">03 // CONTACT</span>
            <h2 className="section-headline">
              <TextReveal>Initiate Research.</TextReveal>
            </h2>

            <div className="contact-grid">
              
              <div className="contact-left">
                <p className="contact-pitch">
                  Open for geopolitical risk consulting, policy brief research collaborations, or quantitative research database engineering roles.
                </p>
                <div className="minimal-social-links">
                  <Magnetic>
                    <a href="https://www.linkedin.com/in/sanjay-sarmah-8263921ab/" target="_blank" rel="noopener noreferrer" className="minimal-social-link">
                      <Linkedin size={18} />
                      <span>LinkedIn</span>
                    </a>
                  </Magnetic>
                  <Magnetic>
                    <a href="mailto:sarmah.sanjay@outlook.com" className="minimal-social-link">
                      <Mail size={18} />
                      <span>Email</span>
                    </a>
                  </Magnetic>
                </div>
              </div>

              <div className="contact-right">
                {formSubmitted ? (
                  <div className="form-success-box">
                    <h3>Transmission Complete.</h3>
                    <p>I will review your inquiry and connect via email shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="minimal-form">
                    <div className="form-row">
                      <input type="text" placeholder="Full Name" required />
                      <input type="email" placeholder="Email Address" required />
                    </div>
                    <textarea placeholder="Message / Project Scope / Research Requirements" rows="5" required></textarea>
                    <Magnetic>
                      <button type="submit" className="minimal-submit-btn">
                        <span>SEND MESSAGE</span>
                        <ArrowRight size={16} />
                      </button>
                    </Magnetic>
                  </form>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="minimal-footer">
          <div className="footer-content">
            <p>&copy; 2026 SANJAY SARMAH. Web Audio & R3F Parallax Engine.</p>
            <p className="footer-credits">Developed using React, Three.js, and GSAP.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
