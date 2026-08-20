import React, { useState } from 'react';
import { AutomationRule } from '../../types';
import { Zap, Play, CheckCircle2, XCircle, Plus, Sparkles, ArrowRight, Activity } from 'lucide-react';

interface AutomationViewProps {
  automations: AutomationRule[];
  onToggleRule: (ruleId: string) => void;
  onSimulateRuleTrigger: (ruleId: string) => void;
}

export const AutomationView: React.FC<AutomationViewProps> = ({
  automations,
  onToggleRule,
  onSimulateRuleTrigger
}) => {
  const [testNotification, setTestNotification] = useState<string | null>(null);

  const handleTestTrigger = (rule: AutomationRule) => {
    onSimulateRuleTrigger(rule.id);
    setTestNotification(`Regla "${rule.name}" probada con éxito. Ejecutadas ${rule.actions.length} acciones.`);
    setTimeout(() => setTestNotification(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Automatizaciones, Flujos & Reglas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatiza respuestas fuera de horario, etiquetado de leads, asignación de agentes y disparos de Webhooks API.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {testNotification && (
        <div className="m-6 mb-0 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{testNotification}</span>
        </div>
      )}

      {/* Rules List */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {automations.map(rule => (
            <div
              key={rule.id}
              className={`bg-white border rounded-2xl p-5 shadow-2xs transition-all space-y-4 ${
                rule.enabled ? 'border-indigo-200 bg-white' : 'border-slate-200 bg-slate-50/50 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    rule.enabled ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{rule.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>Ejecuciones: <strong className="text-slate-800">{rule.triggerCount}</strong></span>
                      <span>•</span>
                      <span>Último disparo: <strong className="text-slate-800">{rule.lastTriggered || 'Nunca'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTestTrigger(rule)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Simular Ejecución</span>
                  </button>

                  <button
                    onClick={() => onToggleRule(rule.id)}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      rule.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      rule.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Trigger & Actions Diagram */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center gap-3 text-xs">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shrink-0 font-medium text-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">DISPARADOR:</span>
                  <span>{rule.triggerEvent}</span>
                  {rule.conditionKeyword && <span className="text-indigo-600 font-bold">("{rule.conditionKeyword}")</span>}
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {rule.actions.map((act, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-800 text-[11px] font-semibold rounded-lg flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      {act.type}: {act.targetValue}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
