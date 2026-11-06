import { CustomHelpTooltip } from '@/src/components/ui/tooltip/HelpTooltip';

const terms = [
    {
        label: 'CDI',
        term: 'CDI',
        desc: 'Certificado de Depósito Interbancário. É a taxa de referência para investimentos de renda fixa.',
    },
    {
        label: 'Selic',
        term: 'Selic',
        desc: 'Taxa básica de juros da economia brasileira, definida pelo Banco Central.',
    },
    {
        label: 'IPCA',
        term: 'IPCA',
        desc: 'Índice oficial de inflação do país, que mede a variação dos preços ao consumidor.',
    },
    {
        label: 'CDB',
        term: 'CDB',
        desc: 'Certificado de Depósito Bancário. Título de renda fixa emitido por bancos.',
    },
    {
        label: 'LCI/LCA',
        term: 'LCI/LCA',
        desc: 'Letras de Crédito Imobiliário e do Agronegócio. Títulos isentos de Imposto de Renda.',
    },
    {
        label: 'Prefixado',
        term: 'Prefixado',
        desc: 'Investimento com taxa de retorno definida no momento da aplicação.',
    },
];

export function GlossaryTerms() {
    return (
        <div className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4">
                Entenda antes de investir
            </h2>

            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-4">
                {terms.map((t) => (
                    <div
                        key={t.label}
                        className="flex items-center text-xs font-medium text-slate-600"
                    >
                        {t.label}
                        <CustomHelpTooltip
                            title="Ajuda"
                            term={t.term}
                            description={t.desc}
                        />
                    </div>
                ))}
            </div>

            <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-4">
                Consulte as condições, os riscos e a tributação de cada
                aplicação. Rentabilidade passada não garante resultados futuros.
            </p>
        </div>
    );
}
