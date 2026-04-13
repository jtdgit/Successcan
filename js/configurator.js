/**
 * AFAS Successcan Configurator — Wizard Logic
 * Vanilla JS, no dependencies
 */

const Configurator = (() => {

    // ── State ──────────────────────────────────
    const state = {
        currentStep: 1,
        totalSteps: 3,
        selectedBranche: null,
        selectedScan: null
    };

    // ── DOM refs ───────────────────────────────
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ── Initialize ─────────────────────────────
    function init() {
        renderStep();
        updateIndicator();
        updateNavigation();
    }

    // ── Navigation ─────────────────────────────
    function nextStep() {
        if (!validateCurrentStep()) return;

        if (state.currentStep < state.totalSteps) {
            transitionStep('forward', () => {
                state.currentStep++;
                renderStep();
                updateIndicator();
                updateNavigation();
            });
        }
    }

    function prevStep() {
        if (state.currentStep > 1) {
            transitionStep('backward', () => {
                state.currentStep--;
                renderStep();
                updateIndicator();
                updateNavigation();
            });
        }
    }

    // ── Step Transition ────────────────────────
    function transitionStep(direction, callback) {
        const el = $('#stepContent');
        const exitClass = direction === 'forward' ? 'step-content--exiting' : 'step-content--entering';
        const enterClass = direction === 'forward' ? 'step-content--entering' : 'step-content--exiting';

        el.classList.add(exitClass);

        setTimeout(() => {
            callback();
            el.classList.remove(exitClass);
            el.classList.add(enterClass);

            // force reflow
            void el.offsetWidth;

            el.classList.remove(enterClass);
        }, 250);
    }

    // ── Validation ─────────────────────────────
    function validateCurrentStep() {
        let valid = true;

        switch (state.currentStep) {
            case 1:
                valid = state.selectedBranche !== null;
                break;
            case 2:
                valid = state.selectedScan !== null;
                break;
            case 3:
                valid = true; // result step, always valid
                break;
        }

        const msg = $('#validationMessage');
        if (!valid) {
            msg.classList.add('validation-message--visible');
            const btn = $('#btnNext');
            btn.classList.remove('btn--shake');
            void btn.offsetWidth;
            btn.classList.add('btn--shake');
        } else {
            msg.classList.remove('validation-message--visible');
        }

        return valid;
    }

    // ── Update Step Indicator ──────────────────
    function updateIndicator() {
        $$('.step-indicator__item').forEach(item => {
            const step = parseInt(item.dataset.step);
            item.classList.remove('step-indicator__item--active', 'step-indicator__item--completed');

            if (step === state.currentStep) {
                item.classList.add('step-indicator__item--active');
            } else if (step < state.currentStep) {
                item.classList.add('step-indicator__item--completed');
                item.querySelector('.step-indicator__number').textContent = '✓';
            }
        });

        $$('.step-indicator__connector').forEach(conn => {
            const step = parseInt(conn.dataset.connector);
            conn.classList.toggle('step-indicator__connector--completed', step < state.currentStep);
        });
    }

    // ── Update Navigation Buttons ──────────────
    function updateNavigation() {
        const btnPrev = $('#btnPrev');
        const btnNext = $('#btnNext');

        // Show/hide prev
        if (state.currentStep === 1) {
            btnPrev.classList.add('btn--ghost');
        } else {
            btnPrev.classList.remove('btn--ghost');
        }

        // Last step = no next
        if (state.currentStep === state.totalSteps) {
            btnNext.style.display = 'none';
        } else {
            btnNext.style.display = '';
            btnNext.disabled = false;
        }

        // Hide validation message
        $('#validationMessage').classList.remove('validation-message--visible');
    }

    // ── Render Current Step ────────────────────
    function renderStep() {
        const container = $('#stepContent');

        switch (state.currentStep) {
            case 1: renderBrancheStep(container); break;
            case 2: renderScanStep(container); break;
            case 3: renderKostenStep(container); break;
        }
    }

    // ── Step 1: Branche ────────────────────────
    function renderBrancheStep(container) {
        container.innerHTML = `
            <div class="step-header">
                <div class="step-header__subtitle">Stap 1 van 3 — In welke branche is je organisatie actief?</div>
            </div>
            <div class="card-list">
                ${SuccesscanData.branches.map(b => `
                    <div class="option-card ${state.selectedBranche === b.id ? 'option-card--selected' : ''}"
                         onclick="Configurator.selectBranche('${b.id}')">
                        <span class="option-card__icon">${b.icoon}</span>
                        <div class="option-card__text">
                            <div class="option-card__title">${b.naam}</div>
                            <div class="option-card__description">${b.beschrijving}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function selectBranche(id) {
        state.selectedBranche = id;
        renderStep();
        $('#validationMessage').classList.remove('validation-message--visible');
    }

    // ── Step 2: Type Scan ──────────────────────
    function renderScanStep(container) {
        container.innerHTML = `
            <div class="step-header">
                <div class="step-header__subtitle">Stap 2 van 3 — Welke Successcan wil je uitvoeren?</div>
            </div>
            <div class="card-list">
                ${SuccesscanData.scanVarianten.map(s => `
                    <div class="option-card ${state.selectedScan === s.id ? 'option-card--selected' : ''}"
                         onclick="Configurator.selectScan('${s.id}')">
                        <span class="option-card__icon">${s.icoon}</span>
                        <div class="option-card__text">
                            <div class="option-card__title">${s.naam}</div>
                            <div class="option-card__description">${s.beschrijving}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function selectScan(id) {
        state.selectedScan = id;
        renderStep();
        $('#validationMessage').classList.remove('validation-message--visible');
    }

    // ── Step 3: Kosten Resultaat ───────────────
    function renderKostenStep(container) {
        const branche = SuccesscanData.branches.find(b => b.id === state.selectedBranche);
        const scan = SuccesscanData.scanVarianten.find(s => s.id === state.selectedScan);

        container.innerHTML = `
            <div class="step-header">
                <div class="step-header__subtitle">Stap 3 van 3 — Kosten van je Successcan</div>
            </div>

            <div class="kosten-resultaat">
                <div class="kosten-resultaat__selectie">
                    <div class="kosten-selectie-item">
                        <span class="kosten-selectie-item__icon">${branche.icoon}</span>
                        <div>
                            <div class="kosten-selectie-item__label">Branche</div>
                            <div class="kosten-selectie-item__value">${branche.naam}</div>
                        </div>
                    </div>
                    <div class="kosten-selectie-item">
                        <span class="kosten-selectie-item__icon">${scan.icoon}</span>
                        <div>
                            <div class="kosten-selectie-item__label">Type scan</div>
                            <div class="kosten-selectie-item__value">${scan.naam} Successcan</div>
                        </div>
                    </div>
                </div>

                <div class="kosten-resultaat__prijs-card">
                    <div class="kosten-resultaat__label">Totale kosten Successcan</div>
                    <div class="kosten-resultaat__prijs">${SuccesscanData.formatKosten(scan.kosten)}</div>
                    <div class="kosten-resultaat__btw">Exclusief BTW</div>
                </div>

                <p class="kosten-resultaat__beschrijving">
                    De ${scan.naam} Successcan biedt een grondige analyse van je huidige inrichting
                    en geeft concrete verbeterpunten om meer uit AFAS te halen.
                    Na de scan ontvang je een helder rapport met prioriteiten en een plan van aanpak.
                </p>

                <div class="kosten-resultaat__actions">
                    <a href="https://klant.afas.nl/successcan" class="kosten-resultaat__cta" target="_blank" rel="noopener">
                        Successcan aanvragen →
                    </a>
                    <button class="kosten-resultaat__download" onclick="Configurator.downloadOfferte()">
                        📄 Download offerte (PDF)
                    </button>
                </div>
            </div>
        `;
    }

    // ── PDF Generation ────────────────────────
    function downloadOfferte() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const branche = SuccesscanData.branches.find(b => b.id === state.selectedBranche);
        const scan = SuccesscanData.scanVarianten.find(s => s.id === state.selectedScan);
        const kosten = SuccesscanData.formatKosten(scan.kosten);

        const vandaag = new Date();
        const geldigTot = new Date(vandaag);
        geldigTot.setMonth(geldigTot.getMonth() + 1);

        const datumOpmaak = { day: 'numeric', month: 'long', year: 'numeric' };
        const datum = vandaag.toLocaleDateString('nl-NL', datumOpmaak);
        const geldigheid = geldigTot.toLocaleDateString('nl-NL', datumOpmaak);

        const blue = [0, 95, 170];
        const darkGray = [65, 71, 77];
        const lightGray = [195, 203, 211];
        const white = [255, 255, 255];
        const pageWidth = 210;
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;

        // ── Helper: section heading ──
        function sectionHeading(label, yPos) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...blue);
            doc.setFontSize(11);
            doc.text(label, margin, yPos);
            return yPos + 8;
        }

        // ── Helper: body text block ──
        function bodyText(text, yPos, fontSize) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...darkGray);
            doc.setFontSize(fontSize || 9.5);
            const lines = doc.splitTextToSize(text, contentWidth);
            doc.text(lines, margin, yPos);
            return yPos + lines.length * (fontSize ? fontSize * 0.55 : 5.2);
        }

        // ══════════════════════════════════════
        // HEADER
        // ══════════════════════════════════════
        doc.setFillColor(...blue);
        doc.rect(0, 0, pageWidth, 44, 'F');

        doc.setTextColor(...white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('AFAS', margin, 24);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text('Software', 55, 24);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(15);
        doc.text('Offerte ' + scan.naam + ' Successcan', margin, 38);

        // ══════════════════════════════════════
        // DATUM & GELDIGHEID
        // ══════════════════════════════════════
        let y = 58;

        doc.setFontSize(9.5);
        doc.setTextColor(...darkGray);

        doc.setFont('helvetica', 'bold');
        doc.text('Datum:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(datum, 55, y);

        doc.setFont('helvetica', 'bold');
        doc.text('Geldig tot:', 110, y);
        doc.setFont('helvetica', 'normal');
        doc.text(geldigheid, 145, y);
        y += 8;

        doc.setFont('helvetica', 'bold');
        doc.text('Branche:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(branche.naam, 55, y);

        doc.setFont('helvetica', 'bold');
        doc.text('Type scan:', 110, y);
        doc.setFont('helvetica', 'normal');
        doc.text(scan.naam + ' Successcan', 145, y);
        y += 14;

        // ── Divider ──
        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.4);
        doc.line(margin, y, margin + contentWidth, y);
        y += 12;

        // ══════════════════════════════════════
        // WAT IS EEN SUCCESSCAN?
        // ══════════════════════════════════════
        y = sectionHeading('Wat is een Successcan?', y);
        y = bodyText(
            'De Successcan is een diepgaande analyse van je huidige AFAS-omgeving, ' +
            'uitgevoerd door een ervaren AFAS-consultant. Het doel is om in kaart te ' +
            'brengen hoe je de software op dit moment gebruikt, waar verbeterpotentieel ' +
            'ligt en hoe je processen verder kunt optimaliseren. De scan is beschikbaar ' +
            'voor HRM, ERP of als combinatie van beide.',
            y
        );
        y += 4;

        // ══════════════════════════════════════
        // WAT KRIJG JE?
        // ══════════════════════════════════════
        y = sectionHeading('Wat krijg je?', y);

        const watKrijgJe = [
            'Grondige analyse van je huidige inrichting en gebruik van AFAS door een gecertificeerde consultant.',
            'Vergelijking met best practices uit jouw branche (' + branche.naam.toLowerCase() + ') op basis van onze ervaring bij vergelijkbare organisaties.',
            'Een helder rapport met concrete verbeterpunten, gerangschikt op prioriteit en impact.',
            'Een plan van aanpak met aanbevelingen voor optimalisatie, inclusief een inschatting van de benodigde inspanning.',
            'Een persoonlijke presentatie van de resultaten en bevindingen aan je projectteam.'
        ];

        watKrijgJe.forEach(item => {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...darkGray);
            doc.setFontSize(9.5);
            const lines = doc.splitTextToSize(item, contentWidth - 8);
            doc.text('•', margin, y);
            doc.text(lines, margin + 8, y);
            y += lines.length * 5.2 + 2;
        });
        y += 4;

        // ══════════════════════════════════════
        // WERKWIJZE
        // ══════════════════════════════════════
        y = sectionHeading('Werkwijze', y);
        y = bodyText(
            'De Successcan wordt uitgevoerd in drie fasen. Eerst vindt een intake ' +
            'plaats waarin we je huidige situatie en doelstellingen bespreken. ' +
            'Vervolgens analyseert de consultant je AFAS-omgeving op basis van een ' +
            'gestandaardiseerde methodiek. Tot slot ontvang je het rapport en wordt ' +
            'dit persoonlijk toegelicht. De gehele scan wordt doorgaans binnen ' +
            '2 tot 4 weken afgerond.',
            y
        );
        y += 6;

        // ══════════════════════════════════════
        // KOSTEN
        // ══════════════════════════════════════
        y = sectionHeading('Kosten', y);
        y += 2;

        // Table header
        doc.setFillColor(...blue);
        doc.rect(margin, y, contentWidth, 10, 'F');
        doc.setTextColor(...white);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Omschrijving', margin + 5, y + 7);
        doc.text('Bedrag', margin + contentWidth - 5, y + 7, { align: 'right' });
        y += 10;

        // Table row
        doc.setFillColor(242, 245, 248);
        doc.rect(margin, y, contentWidth, 10, 'F');
        doc.setTextColor(...darkGray);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.text(scan.naam + ' Successcan — ' + branche.naam, margin + 5, y + 7);
        doc.setFont('helvetica', 'bold');
        doc.text(kosten, margin + contentWidth - 5, y + 7, { align: 'right' });
        y += 10;

        // Total row
        doc.setFillColor(...blue);
        doc.rect(margin, y, contentWidth, 12, 'F');
        doc.setTextColor(...white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('Totaal (excl. BTW)', margin + 5, y + 8);
        doc.text(kosten, margin + contentWidth - 5, y + 8, { align: 'right' });
        y += 18;

        // BTW note
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...lightGray);
        doc.setFontSize(8);
        doc.text('Alle genoemde bedragen zijn exclusief 21% BTW.', margin, y);
        y += 10;

        // ══════════════════════════════════════
        // VOORWAARDEN
        // ══════════════════════════════════════
        y = sectionHeading('Voorwaarden', y);
        y = bodyText(
            'Deze offerte is geldig tot ' + geldigheid + '. Na acceptatie nemen wij ' +
            'binnen 5 werkdagen contact op om de intake in te plannen. Op deze offerte ' +
            'zijn de algemene voorwaarden van AFAS Software van toepassing.',
            y
        );

        // ══════════════════════════════════════
        // FOOTER
        // ══════════════════════════════════════
        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.3);
        doc.line(margin, 275, margin + contentWidth, 275);

        doc.setFontSize(7.5);
        doc.setTextColor(...lightGray);
        doc.setFont('helvetica', 'normal');
        doc.text('AFAS Software  |  Postbus 38  |  3770 AA Barneveld  |  afas.nl', pageWidth / 2, 281, { align: 'center' });
        doc.text('Datum: ' + datum + '  |  Geldig tot: ' + geldigheid + '  |  Referentie: SC-' + vandaag.getFullYear() + '-' + String(vandaag.getMonth() + 1).padStart(2, '0') + '-' + scan.id.toUpperCase(), pageWidth / 2, 286, { align: 'center' });

        // ── Save ──
        doc.save('Offerte-Successcan-' + scan.id.toUpperCase() + '-' + vandaag.toISOString().slice(0, 10) + '.pdf');
    }

    // ── Boot ───────────────────────────────────
    document.addEventListener('DOMContentLoaded', init);

    // ── Public API ─────────────────────────────
    return {
        nextStep,
        prevStep,
        selectBranche,
        selectScan,
        downloadOfferte
    };

})();
