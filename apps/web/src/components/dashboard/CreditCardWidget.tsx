import React from 'react';
import { formatINR } from '@personal-finance/shared';
import { CreditCard as CardIcon, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CreditCardWidgetProps {
  cards: {
    id: string;
    name: string;
    bank?: string;
    outstanding: number;
    limit: number;
    available: number;
    statementDate?: number;
    dueDate?: number;
  }[];
}

export const CreditCardWidget: React.FC<CreditCardWidgetProps> = ({ cards }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <CardIcon className="w-4 h-4 text-indigo-500" />
            <span>Credit Cards</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track outstanding and billing cycles</p>
        </div>
        <Link to="/accounts" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
          Manage
        </Link>
      </div>

      <div className="space-y-3">
        {cards.map((card) => {
          const utilization = card.limit > 0 ? (card.outstanding / card.limit) * 100 : 0;
          return (
            <div
              key={card.id}
              className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-xs tracking-wider uppercase text-slate-300">
                  {card.bank || 'Credit Card'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">**** 6789</span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-[10px] uppercase text-slate-400">Outstanding</span>
                  <p className="text-lg font-extrabold">{formatINR(card.outstanding)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-400">Available Limit</span>
                  <p className="text-xs font-bold text-emerald-400">{formatINR(card.available)}</p>
                </div>
              </div>

              {/* Utilization bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full ${
                    utilization > 50 ? 'bg-rose-500' : utilization > 30 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, utilization)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Limit: {formatINR(card.limit)} ({utilization.toFixed(0)}% used)</span>
                {card.dueDate && (
                  <span className="flex items-center gap-1 text-amber-300">
                    <Calendar className="w-3 h-3" /> Due on {card.dueDate}th
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
