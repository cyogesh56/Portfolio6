      async function downloadPDF() {
            const link = document.getElementById('downloadLink');
            if (!link) return;

            if (typeof html2pdf === 'undefined') {
                console.error("html2pdf library missing. Check your script tags.");
                return;
            }

            const originalText = link.innerHTML;
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.7';
            link.innerHTML = "Generating PDF...";

            // CV Template with strictly defined print styles and two-page isolation
            const cvContent = `
                <div style="width: 210mm; background: #eee; margin: 0; padding: 0;">
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                        .page {
                            width: 210mm;
                            height: 296mm;
                            background: white;
                            padding: 12mm 18mm;
                            box-sizing: border-box;
                            font-family: 'Inter', Arial, sans-serif;
                            color: #1f2937;
                            line-height: 1.4;
                            font-size: 9.6pt;
                            position: relative;
                            overflow: hidden;
                        }
                        .section-title { 
                            color: #1a3138; 
                            font-weight: 700; 
                            text-transform: uppercase; 
                            letter-spacing: 0.05em; 
                            border-bottom: 2px solid #e5e7eb; 
                            padding-bottom: 2px; 
                            margin-bottom: 6px; 
                            margin-top: 10px; 
                            font-size: 10.5pt; 
                        }
                        .company-header { display: flex; justify-content: space-between; align-items: baseline; margin-top: 8px; }
                        .company-name { font-weight: 700; font-size: 10.5pt; color: #111827; }
                        .job-title { font-weight: 600; color: #4b5563; font-style: italic; font-size: 9.6pt; margin: 2px 0; }
                        .date-location { color: #6b7280; font-size: 9pt; font-weight: 500; }
                        .bullet-list { list-style-type: disc; margin-left: 1.2rem; margin-top: 4px; padding: 0; }
                        .bullet-list li { margin-bottom: 3px; color: #374151; }
                        .skill-category { display: flex; gap: 8px; margin-bottom: 5px; align-items: flex-start; }
                        .skill-category h4 { font-weight: 700; font-size: 9.5pt; color: #1a3138; min-width: 165px; flex-shrink: 0; margin: 0; }
                        .skill-list { font-size: 9.5pt; color: #4b5563; margin: 0; flex-grow: 1; }
                        a { text-decoration: none; color: inherit; }
                        strong { font-weight: 700; color: #111827; }
                    </style>

                    <!-- PAGE 1 -->
                    <div class="page">
                        <!-- Header -->
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #1a3138; padding-bottom: 12px; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 18px;">
                                <img src="/26e7e52977c96ca41762d21a1bf694a3.jpg" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #1a3138; object-fit: cover;">
                                <div>
                                    <h1 style="font-size: 24pt; font-weight: 800; color: #1a3138; margin: 0; line-height: 1;">Yogesh Singh</h1>
                                    <p style="font-size: 13pt; color: #0ea5e9; font-weight: 600; margin: 4px 0 0 0;">Senior UX/Product Designer</p>
                                    <p style="font-size: 9.5pt; color: #6b7280; font-weight: 500; margin: 2px 0 0 0;">Germany | Full-time work permit</p>
                                </div>
                            </div>
                            <div style="text-align: right; font-size: 9.5pt; line-height: 1.5;">
                                <div><a href="mailto:cyogesh56@gmail.com">cyogesh56@gmail.com</a></div>
                                <div><a href="https://linkedin.com/in/cyogesh56" target="_blank">linkedin.com/in/cyogesh56</a></div>
                                <div><a href="https://cyogesh56.com" target="_blank" style="color: #0ea5e9; font-weight: 700;">cyogesh56.com</a></div>
                            </div>
                        </div>

                        <!-- Summary -->
                        <section>
                            <h3 class="section-title">Summary</h3>
                            <p style="text-align: justify; margin: 0;">Senior UX/Product Designer with 6+ years designing <strong>enterprise SaaS solutions</strong>. Led <strong>cross-functional teams</strong> and <strong>design systems</strong> used across 50+ products, driving a 60% efficiency improvement and contributing $800K in increased revenue. Expert in <strong>user research, data-driven design, and WCAG-compliant systems</strong>. Highly skilled in <strong>Product Strategy & Workshop Facilitation</strong>, seeking to scale enterprise systems to deliver cohesive, brand-aligned user experiences.</p>
                        </section>

                        <!-- Employment History -->
                        <section>
                            <h3 class="section-title">Employment History</h3>
                            
                            <div style="margin-bottom: 10px;">
                                <div class="company-header"><span class="company-name">Independent Projects</span><span class="date-location">Feb 2026 – Present</span></div>
                                <p class="job-title">Product Designer & Developer</p>
                                <ul class="bullet-list">
                                    <li>Developed the "LinkedIn Job Search Enhancer," browser extension for Chromium and Firefox browsers, utilizing Google Antigravity to <strong>streamline the job discovery for users</strong>.</li>
                                    <li>Leading the <strong>zero-to-one UX/UI design and development</strong> of "DocDoc," a secure document vault, focusing on simplifying document creation and management workflow.</li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 10px;">
                                <div class="company-header"><span class="company-name">St. Jude Children’s Research Hospital (ALSAC)</span><span class="date-location">Dec 2019 – Jan 2026 | Remote</span></div>
                                <p class="job-title">Senior UX/UI Designer – Enterprise Revenue & Digital Platforms</p>
                                <ul class="bullet-list">
                                    <li>Led <strong>end-to-end UX</strong> for an omnichannel communication <strong>SaaS portal</strong>; conducted <strong>user research, IA, and usability testing</strong> leading to improved process efficiency by 60% and reduced unwanted outreach by 35%.</li>
                                    <li>Redesigned <strong>quick-pay mobile workflows</strong> using <strong>A/B testing and analytics</strong>; delivered $800K revenue uplift within 12 months.</li>
                                    <li>Co-created a unified <strong>design system adopted across 50+ products</strong> leading to reduced UI inconsistency and accelerated design-to-development delivery for 8 cross-functional teams.</li>
                                    <li>Directed the <strong>UX strategy for adoption of Canva</strong> for brand asset creation and management, driving an 89% increase in cross-platform workflow usability.</li>
                                    <li>Facilitated <strong>UX and Design Thinking workshops</strong>; established team feedback processes, collaboration standards, and improved cross-functional delivery cadence.</li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 10px;">
                                <div class="company-header"><span class="company-name">Continental AG</span><span class="date-location">Oct 2018 – Mar 2019 | Chicago, USA</span></div>
                                <p class="job-title">User Experience Design Intern</p>
                                <ul class="bullet-list">
                                    <li>Led the <strong>end-to-end redesign</strong> of car audio tuning software for <strong>enterprise business partners (B2B)</strong>, doubling the product's efficiency and improving accessibility.</li>
                                    <li>Conducted <strong>usability tests and user interviews</strong> to validate new interactions, achieving an average <strong>System Usability Scale (SUS) score of 82</strong>.</li>
                                    <li><strong>Restructured information architecture</strong> to enhance content discoverability by 100%, significantly increasing users' workflow speed within the software.</li>
                                </ul>
                            </div>

                            <div>
                                <div class="company-header">
                                    <span class="company-name">DePaul University</span>
                                    <span class="date-location">Aug 2018 – Jun 2019 | Chicago, USA</span>
                                </div>
                                <p class="job-title">User Experience Designer (Co-op)</p>
                                <ul class="bullet-list">
                                    <li>Created <strong>wireframes, prototypes, and user flows for B2B web applications</strong>, enhancing navigation and content discoverability.</li>
                                    <li>Partnered with agile engineering teams to improve <strong>user journeys, reducing design-to-development turnaround</strong> by 25%.</li>
                                    <li>Delivered <strong>high-fidelity prototypes and microsites using HTML and CSS</strong>, contributing to cost savings and improved user engagement.</li>
                                </ul>
                            </div>
                        </section>
                    </div>

                    <!-- PAGE 2 -->
                    <div class="page">
                        <section>
                            <h3 class="section-title">Technical Proficiencies</h3>
                            <div class="skill-category">
                                <h4>Design, AI & Prototyping:</h4>
                                <p class="skill-list">Figma, Axure RP, Framer, Webflow, Design Tokens, High-Fidelity UI Design, Interactive Prototypes, AI-Assisted Workflows (Claude, AI Studio, Antigravity, ChatGPT, Lovable), Vibe Coding, Rapid Experimentation, HTML, CSS</p>
                            </div>
                            <div class="skill-category">
                                <h4>Research & Validation:</h4>
                                <p class="skill-list">User Research, Usability Testing, A/B Testing, Information Architecture, User Flows, Competitive Analysis, User Personas, Customer Journey Mapping, Data Visualization</p>
                            </div>
                            <div class="skill-category">
                                <h4>UX Systems & Strategy:</h4>
                                <p class="skill-list">Product Strategy, OKRs, DesignOps, Agile Methodology, Systems Thinking, Workshop Facilitation</p>
                            </div>
                            <div class="skill-category">
                                <h4>Collaboration & Delivery:</h4>
                                <p class="skill-list">Stakeholder Management, Cross-Functional Collaboration, Jira, Confluence, Mentorship, Leadership, Presentation</p>
                            </div>
                        </section>

                        <section>
                            <h3 class="section-title">Education</h3>
                            <div style="margin-bottom: 12px;">
                                <div style="display:flex; justify-content:space-between; align-items: baseline;">
                                    <strong>MS in Human-Computer Interaction</strong>
                                    <span class="date-location">Mar 2017 – Jun 2019</span>
                                </div>
                                <div style="font-size: 9pt; color: #6b7280;">DePaul University, Chicago, USA</div>
                            </div>
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items: baseline;">
                                    <strong>BTech in Computer Science and Engineering</strong>
                                    <span class="date-location">Aug 2012 – May 2015</span>
                                </div>
                                <div style="font-size: 9pt; color: #6b7280;">Guru Jambheshwar University of Science and Technology, Hisar, India</div>
                            </div>
                        </section>

                        <section>
                            <h3 class="section-title">Languages</h3>
                            <p style="font-size: 10pt; color: #374151;"><strong>English:</strong> Native (C2) &nbsp;&nbsp;|&nbsp;&nbsp; <strong>German:</strong> A2</p>
                        </section>

                        <section>
                            <h3 class="section-title">Certifications</h3>
                            <ul class="bullet-list" style="list-style: none; margin-left: 0;">
                                <li>• <strong>Behavioral Design Bootcamp</strong>, Irrational Labs (Feb 2026 – Now)</li>
                                <li>• <strong>McKinsey Forward Program</strong>, McKinsey & Company (Jul 2025)</li>
                                <li>• <strong>Leading with Innovation in the Age of AI</strong>, LinkedIn (Mar 2025)</li>
                                <li>• <strong>Design Thinking in the Age of AI</strong>, LinkedIn (Feb 2025)</li>
                                <li>• <strong>Workshop Design Specialist</strong>, AJ&Smart (Jun 2024)</li>
                                <li>• <strong>Design Sprint Specialist</strong>, AJ&Smart (May 2024)</li>
                            </ul>
                        </section>

                        <section>
                            <h3 class="section-title">Awards & Affiliations</h3>
                            <ul class="bullet-list">
                                <li><strong>Hackathon Winner (2019, 2022, 2023, 2024)</strong>, St. Jude Children’s Research Hospital</li>
                                <li><strong>VP of Public Relations</strong>, St. Jude Toastmasters Club (Mar 2024 – Jan 2026)</li>
                                <li><strong>Cochair</strong>, Asian American Pacific Islander ERG, St. Jude Children's Research Hospital (Jun 2024 – Jan 2026)</li>
                            </ul>
                        </section>
                    </div>
                </div>
            `;

            const opt = {
                margin: 0,
                filename: 'Yogesh_Singh_CV.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    letterRendering: true,
                    width: 794 
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: 'css' }
            };

            try {
                await html2pdf().set(opt).from(cvContent).save();
            } catch (error) {
                console.error("PDF generation error:", error);
            } finally {
                link.innerHTML = originalText;
                link.style.pointerEvents = 'auto';
                link.style.opacity = '1';
            }
        }