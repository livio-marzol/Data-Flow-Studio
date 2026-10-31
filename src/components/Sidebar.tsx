import React from 'react';
import { FolderUp, Filter, ArrowUpDown, Eye, Plus, Sparkles, HelpCircle } from 'lucide-react';
import { PipelineNodeType } from '../types/pipeline';

interface SidebarProps {
  onAddNode: (type: PipelineNodeType) => void;
}

interface NodeMenuItem {
  type: PipelineNodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const MENU_ITEMS: NodeMenuItem[] = [
  {
    type: 'inputNode',
    label: 'Subir Arquivo',
    description: 'Importar CSV, JSON ou usar demo',
    icon: <FolderUp size={16} />,
    category: 'Entrada'
  },
  {
    type: 'filterNode',
    label: 'Peneira (Filtro)',
    description: 'Filtrar por >, <, = ou contém',
    icon: <Filter size={16} />,
    category: 'Transformação'
  },
  {
    type: 'sortNode',
    label: 'Organizar (Ordenar)',
    description: 'Ordenar crescente ou decrescente',
    icon: <ArrowUpDown size={16} />,
    category: 'Transformação'
  },
  {
    type: 'outputNode',
    label: 'Visualizar',
    description: 'Tabela de dados ou gráfico',
    icon: <Eye size={16} />,
    category: 'Saída'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  const onDragStart = (event: React.DragEvent, nodeType: PipelineNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-60 bg-[#19191a] border-r border-[#373739] flex flex-col justify-between shrink-0 select-none z-10">
      <div className="p-4 space-y-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#60d4ea]" />
            Blocos de Pipeline
          </h2>
          <p className="text-[11px] text-[#a0a0a0]/80 mt-0.5">
            Clique ou arraste para o canvas
          </p>
        </div>

        {/* Node Buttons List */}
        <div className="space-y-2">
          {MENU_ITEMS.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              onClick={() => onAddNode(item.type)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onAddNode(item.type);
                }
              }}
              className="group w-full p-2.5 rounded-lg bg-[#252528] hover:bg-[#2c2c30] border border-[#373739] hover:border-[#60d4ea]/60 transition-all cursor-grab active:cursor-grabbing text-left focus:outline-none focus:ring-1 focus:ring-[#60d4ea]"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-white group-hover:text-[#60d4ea] transition-colors">
                  <div className="p-1 rounded bg-[#19191a] text-[#60d4ea]">
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <div className="text-[#a0a0a0] group-hover:text-[#60d4ea] transition-colors">
                  <Plus size={14} />
                </div>
              </div>
              <p className="text-[10px] text-[#a0a0a0] line-clamp-1 pl-7">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Beginner Help Box */}
      <div className="p-3.5 m-3 rounded-lg bg-[#252528]/60 border border-[#373739] space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-white">
          <HelpCircle size={14} className="text-[#60d4ea]" />
          Como Funciona
        </div>
        <p className="text-[10px] text-[#a0a0a0] leading-relaxed">
          1. Adicione um bloco de <strong className="text-white">Subir Arquivo</strong>.<br />
          2. Conecte o ponto ciano da direita ao ponto da esquerda de outro bloco.<br />
          3. O fluxo recalcula tudo <strong className="text-[#60d4ea]">em tempo real</strong>!
        </p>
      </div>
    </aside>
  );
};
