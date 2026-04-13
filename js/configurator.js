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
                <div class="step-header__subtitle">Stap 1 van 3</div>
                <h2 class="step-header__title">In welke branche is je organisatie actief?</h2>
            </div>
            <div class="card-grid card-grid--cols-3">
                ${SuccesscanData.branches.map(b => `
                    <div class="option-card ${state.selectedBranche === b.id ? 'option-card--selected' : ''}"
                         onclick="Configurator.selectBranche('${b.id}')">
                        <span class="option-card__icon">${b.icoon}</span>
                        <div class="option-card__title">${b.naam}</div>
                        <div class="option-card__description">${b.beschrijving}</div>
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
                <div class="step-header__subtitle">Stap 2 van 3</div>
                <h2 class="step-header__title">Welke Successcan wil je uitvoeren?</h2>
            </div>
            <div class="card-grid card-grid--cols-3">
                ${SuccesscanData.scanVarianten.map(s => `
                    <div class="option-card ${state.selectedScan === s.id ? 'option-card--selected' : ''}"
                         onclick="Configurator.selectScan('${s.id}')">
                        <span class="option-card__icon">${s.icoon}</span>
                        <div class="option-card__title">${s.naam}</div>
                        <div class="option-card__description">${s.beschrijving}</div>
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
                <div class="step-header__subtitle">Stap 3 van 3</div>
                <h2 class="step-header__title">Kosten van je Successcan</h2>
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
        const datum = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

        const blue = [0, 95, 170];
        const darkGray = [65, 71, 77];
        const lightGray = [195, 203, 211];
        const white = [255, 255, 255];

        // ── Header bar ──
        doc.setFillColor(...blue);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(...white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('AFAS', 20, 22);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('Software', 52, 22);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Offerte Successcan', 20, 34);

        // ── Datum ──
        doc.setTextColor(...darkGray);
        doc.setFontSize(9);
        doc.text(datum, 190, 34, { align: 'right' });

        // ── Divider ──
        let y = 55;

        // ── Selection summary ──
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...blue);
        doc.text('GEGEVENS', 20, y);
        y += 10;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkGray);
        doc.setFontSize(10);

        doc.setFont('helvetica', 'bold');
        doc.text('Branche:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(branche.naam, 60, y);
        y += 8;

        doc.setFont('helvetica', 'bold');
        doc.text('Type scan:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(scan.naam + ' Successcan', 60, y);
        y += 16;

        // ── Divider line ──
        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.5);
        doc.line(20, y, 190, y);
        y += 16;

        // ── Kosten tabel ──
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...blue);
        doc.setFontSize(10);
        doc.text('KOSTEN', 20, y);
        y += 10;

        // Table header
        doc.setFillColor(...blue);
        doc.rect(20, y, 170, 10, 'F');
        doc.setTextColor(...white);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Omschrijving', 25, y + 7);
        doc.text('Bedrag', 185, y + 7, { align: 'right' });
        y += 10;

        // Table row
        doc.setFillColor(242, 245, 248);
        doc.rect(20, y, 170, 10, 'F');
        doc.setTextColor(...darkGray);
        doc.setFont('helvetica', 'normal');
        doc.text(scan.naam + ' Successcan', 25, y + 7);
        doc.setFont('helvetica', 'bold');
        doc.text(kosten, 185, y + 7, { align: 'right' });
        y += 10;

        // Total row
        doc.setFillColor(...blue);
        doc.rect(20, y, 170, 12, 'F');
        doc.setTextColor(...white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Totaal (excl. BTW)', 25, y + 8);
        doc.text(kosten, 185, y + 8, { align: 'right' });
        y += 24;

        // ── Beschrijving ──
        doc.setTextColor(...darkGray);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const beschrijving = doc.splitTextToSize(
            'De ' + scan.naam + ' Successcan biedt een grondige analyse van je huidige inrichting ' +
            'en geeft concrete verbeterpunten om meer uit AFAS te halen. Na de scan ontvang je een ' +
            'helder rapport met prioriteiten en een plan van aanpak.',
            170
        );
        doc.text(beschrijving, 20, y);
        y += beschrijving.length * 5 + 10;

        // ── Footer ──
        doc.setDrawColor(...lightGray);
        doc.line(20, 275, 190, 275);
        doc.setFontSize(8);
        doc.setTextColor(...lightGray);
        doc.text('AFAS Software - Successcan Configurator', 105, 282, { align: 'center' });
        doc.text('Dit document is indicatief en vormt geen bindende offerte.', 105, 287, { align: 'center' });

        // ── Save ──
        doc.save('Offerte-Successcan-' + scan.id.toUpperCase() + '.pdf');
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
