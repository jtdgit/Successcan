/**
 * Data voor de Successcan Configurator
 */

const SuccesscanData = {

    branches: [
        {
            id: 'overheid',
            naam: 'Overheid',
            beschrijving: 'Gemeenten, provincies, rijksoverheid en waterschappen',
            icoon: '🏛️'
        },
        {
            id: 'onderwijs',
            naam: 'Onderwijs',
            beschrijving: 'Scholen, universiteiten, ROC\'s en opleidingsinstituten',
            icoon: '🎓'
        },
        {
            id: 'zorg',
            naam: 'Zorg',
            beschrijving: 'Ziekenhuizen, huisartsen, GGZ en zorginstellingen',
            icoon: '🏥'
        }
    ],

    scanVarianten: [
        {
            id: 'hrm',
            naam: 'HRM',
            beschrijving: 'Scan van je HRM- en salarisprocessen, verlof, verzuim en personeelsbeheer.',
            icoon: '👔',
            kosten: 4000
        },
        {
            id: 'erp',
            naam: 'ERP',
            beschrijving: 'Scan van je financiële, logistieke en operationele bedrijfsprocessen.',
            icoon: '📊',
            kosten: 4000
        },
        {
            id: 'combi',
            naam: 'HRM / ERP',
            beschrijving: 'Volledige scan van zowel je HRM- als ERP-omgeving voor een totaalbeeld.',
            icoon: '🔗',
            kosten: 6000
        }
    ],

    /**
     * Formatteer bedrag als Nederlands valutaformaat
     */
    formatKosten(bedrag) {
        return new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(bedrag);
    }
};
