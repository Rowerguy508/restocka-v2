import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface AIInsight {
  type: 'warning' | 'tip' | 'alert' | 'success';
  title: string;
  message: string;
  action?: string;
  priority: number;
}

interface AIInsightsPanelProps {
  insights: AIInsight[];
  loading?: boolean;
  onAction?: (action: string) => void;
}

const iconMap = {
  warning: AlertTriangle,
  tip: Lightbulb,
  alert: AlertTriangle,
  success: CheckCircle
};

const colorMap = {
  warning: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  tip: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  alert: 'from-red-500/20 to-pink-500/20 border-red-500/30',
  success: 'from-green-500/20 to-emerald-500/20 border-green-500/30'
};

const iconColorMap = {
  warning: 'text-amber-400',
  tip: 'text-blue-400',
  alert: 'text-red-400',
  success: 'text-green-400'
};

export function AIInsightsPanel({ insights, loading, onAction }: AIInsightsPanelProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-secondary/10 rounded-xl border border-primary/20 p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="font-semibold text-foreground">AI Insights</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-primary/10 rounded animate-pulse" />
          <div className="h-4 bg-primary/10 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-primary/10 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-xl border border-green-500/20 p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Inventario Saludable</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">Sin acción requerida</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/10 rounded-xl border border-primary/20 p-4 lg:p-6">
      <div className="flex items-center gap-3 mb-3 lg:mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">AI Insights</h3>
      </div>
      
      <div className="space-y-2 lg:space-y-3">
        {insights.map((insight, index) => {
          const Icon = iconMap[insight.type];
          const colors = colorMap[insight.type];
          const iconColor = iconColorMap[insight.type];
          
          return (
            <div
              key={index}
              className={`bg-gradient-to-r ${colors} rounded-lg p-3 lg:p-4 border transition-all duration-200 hover:shadow-sm`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-2 lg:gap-3">
                <div className={`mt-0.5 ${iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{insight.message}</p>
                  {insight.action && (
                    <button
                      onClick={() => onAction?.(insight.action!)}
                      className="text-xs text-primary hover:underline mt-1.5 font-medium"
                    >
                      {insight.action} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center gap-2 mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-primary/10">
        <TrendingUp className="h-3 w-3 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Análisis de IA de tu inventario
        </p>
      </div>
    </div>
  );
}
