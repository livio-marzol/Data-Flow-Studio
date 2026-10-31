import React from 'react';
import { Workflow, RotateCcw, Trash2, Download } from 'lucide-react';

interface HeaderProps {
  onLoadExample: () => void;
  onClearCanvas: () => void;
  onExportCsv: () => void;
  hasExportData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadExample,
  onClearCanvas,
  onExportCsv,
  hasExportData
}) => {
  return (
    <header className="h-14 bg-[#19191a] border-b border-[#373739] px-4 flex items-center justify-between select-none z-20 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#60d4ea]/10 border border-[#60d4ea]/30 flex items-center justify-center text-[#60d4ea] shadow-sm shadow-[#60d4ea]/10">
          <Workflow size={20} />
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-base font-bold text-white tracking-tight">
            DataFlow Studio
          </h1>
          <span className="hidden sm:inline-block text-[11px] text-[#a0a0a0] font-mono">
            Pipeline Visual
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onLoadExample}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-[#19191a] hover:bg-[#252528] border border-[#373739] transition-all hover:border-[#60d4ea]/50 cursor-pointer"
          title="Restaurar pipeline com dados de exemplo"
        >
          <RotateCcw size={13} className="text-[#60d4ea]" />
          <span className="hidden md:inline">Carregar</span> Exemplo Pronto
        </button>

        <button
          type="button"
          onClick={onClearCanvas}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-[#19191a] hover:bg-[#252528] border border-[#373739] hover:text-red-400 hover:border-red-400/40 transition-all cursor-pointer"
          title="Remover todos os blocos e conexões"
        >
          <Trash2 size={13} />
          Limpar Mesa
        </button>

        <button
          type="button"
          onClick={onExportCsv}
          disabled={!hasExportData}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold transition-all shadow-sm ${
            hasExportData
              ? 'bg-[#60d4ea] text-[#020202] hover:brightness-110 active:scale-[0.98] cursor-pointer'
              : 'bg-[#373739] text-[#a0a0a0] cursor-not-allowed opacity-60'
          }`}
          title={hasExportData ? 'Baixar dados finais em formato CSV' : 'Nenhum dado para exportar'}
        >
          <Download size={14} />
          Exportar Resultado (CSV)
        </button>
      </div>
    </header>
  );
};
