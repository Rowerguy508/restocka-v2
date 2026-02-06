import { supabase } from '@/integrations/supabase/client';
import type { LowStockItem, UsageRate, ReorderRule, Product } from '@/types/database';

interface PredictionResult {
  productId: string;
  productName: string;
  currentStock: number;
  dailyUsage: number;
  daysUntilStockout: number;
  suggestedOrderDate: Date;
  suggestedQuantity: number;
  confidence: number;
  reason: string;
}

interface AnomalyResult {
  productId: string;
  productName: string;
  expectedUsage: number;
  actualUsage: number;
  deviation: number;
  type: 'SPIKE' | 'DROP' | 'UNUSUAL';
  message: string;
}

interface AIInsight {
  type: 'warning' | 'tip' | 'alert' | 'success';
  title: string;
  message: string;
  action?: string;
  priority: number;
}

// Support OpenAI, MiniMax, or Grok
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY || '';
const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY || '';

// Priority: Grok > MiniMax > OpenAI > None
const USE_GROK = GROK_API_KEY && !MINIMAX_API_KEY && !OPENAI_API_KEY;
const USE_MINIMAX = MINIMAX_API_KEY && !OPENAI_API_KEY;

export class RestockaAI {
  private orgId: string;

  constructor(organizationId: string) {
    this.orgId = organizationId;
  }

  // Predict when products will run out based on usage rates
  async predictStockouts(items: LowStockItem[], usageRates: UsageRate[]): Promise<PredictionResult[]> {
    const predictions: PredictionResult[] = [];
    
    for (const item of items) {
      const usageRate = usageRates.find(u => u.product_id === item.product_id);
      const dailyUsage = usageRate?.daily_usage || this.estimateDailyUsage(item);
      
      if (dailyUsage > 0) {
        const daysUntilStockout = Math.floor(item.current_qty / dailyUsage);
        const safetyBuffer = 3; // 3 days safety
        const suggestedOrderDate = new Date();
        suggestedOrderDate.setDate(suggestedOrderDate.getDate() + Math.max(0, daysUntilStockout - safetyBuffer));
        
        // Calculate suggested quantity (cover until next review + safety stock)
        const suggestedQuantity = Math.ceil(dailyUsage * 7); // 1 week buffer
        
        predictions.push({
          productId: item.product_id,
          productName: item.product_name,
          currentStock: item.current_qty,
          dailyUsage,
          daysUntilStockout,
          suggestedOrderDate,
          suggestedQuantity,
          confidence: usageRate ? 0.85 : 0.6,
          reason: usageRate 
            ? `Based on ${dailyUsage} ${item.unit}/day usage rate`
            : `Estimated usage from stock depletion rate`
        });
      }
    }
    
    return predictions.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
  }

  // Detect anomalies in usage patterns
  async detectAnomalies(
    currentUsage: number, 
    historicalAverage: number, 
    product: Product
  ): Promise<AnomalyResult | null> {
    if (historicalAverage === 0) return null;
    
    const deviation = Math.abs(currentUsage - historicalAverage) / historicalAverage;
    const threshold = 0.5; // 50% deviation is anomalous
    
    if (deviation > threshold) {
      const isSpike = currentUsage > historicalAverage;
      return {
        productId: product.id,
        productName: product.name,
        expectedUsage: historicalAverage,
        actualUsage: currentUsage,
        deviation,
        type: isSpike ? 'SPIKE' : 'DROP',
        message: isSpike
          ? `Unusual spike in ${product.name} consumption (${Math.round(deviation * 100)}% above normal)`
          : `Lower than expected usage of ${product.name} (${Math.round(deviation * 100)}% below normal)`
      };
    }
    
    return null;
  }

  // Generate AI-powered insights summary
  async generateInsights(
    predictions: PredictionResult[],
    anomalies: AnomalyResult[],
    draftOrdersCount: number,
    criticalCount: number
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Critical items insight
    if (criticalCount > 0) {
      insights.push({
        type: 'alert',
        title: 'Critical Stock Alert',
        message: `${criticalCount} product(s) have critical stock levels and need immediate attention.`,
        action: 'Review and reorder now',
        priority: 1
      });
    }
    
    // Predicted stockouts
    const urgentPredictions = predictions.filter(p => p.daysUntilStockout <= 3);
    if (urgentPredictions.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Upcoming Stockouts',
        message: `${urgentPredictions.length} product(s) predicted to run out within 3 days.`,
        action: 'Prepare orders',
        priority: 2
      });
    }
    
    // Anomalies detected
    if (anomalies.length > 0) {
      const spikeCount = anomalies.filter(a => a.type === 'SPIKE').length;
      insights.push({
        type: 'tip',
        title: 'Usage Patterns Detected',
        message: `${spikeCount} unusual consumption spike(s) detected - may indicate events or issues.`,
        priority: 3
      });
    }
    
    // Draft orders pending
    if (draftOrdersCount > 0) {
      insights.push({
        type: 'success',
        title: 'Orders in Progress',
        message: `${draftOrdersCount} draft order(s) ready for approval and sending to suppliers.`,
        action: 'Review and send orders',
        priority: 4
      });
    }
    
    // All good
    if (insights.length === 0) {
      insights.push({
        type: 'success',
        title: 'Inventory Healthy',
        message: 'All stock levels are normal with no immediate concerns.',
        priority: 5
      });
    }
    
    return insights.sort((a, b) => a.priority - b.priority);
  }

  // Generate AI-powered natural language summary
  async generateSummary(
    totalProducts: number,
    lowStockCount: number,
    criticalCount: number,
    pendingOrders: number
  ): Promise<string> {
    const issues = criticalCount + lowStockCount;
    
    if (issues === 0) {
      return `Tu inventario está saludable con ${totalProducts} productos rastreados. No se detectan preocupaciones inmediatas.`;
    }
    
    let summary = `Tienes ${issues} producto(s) que requieren atención: ${criticalCount} crítico(s), ${lowStockCount} con stock bajo.`;
    
    if (pendingOrders > 0) {
      summary += ` ${pendingOrders} orden(es) están pendientes y deben revisarse.`;
    }
    
    if (criticalCount > 0) {
      summary += ' Se recomienda acción inmediata para los artículos críticos.';
    }
    
    // If we have an API key, use AI
    if (USE_GROK || USE_MINIMAX || OPENAI_API_KEY) {
      return this.callAISummary(totalProducts, lowStockCount, criticalCount, pendingOrders);
    }
    
    return summary;
  }

  private async callAISummary(
    totalProducts: number,
    lowStockCount: number,
    criticalCount: number,
    pendingOrders: number
  ): Promise<string> {
    const prompt = `Analiza este inventario de restaurante y genera un resumen en español:
    - Total productos: ${totalProducts}
    - Stock bajo: ${lowStockCount}
    - Crítico: ${criticalCount}
    - Órdenes pendientes: ${pendingOrders}
    
    Genera un resumen corto y útil (máximo 50 palabras) con recomendaciones específicas.`;

    if (USE_GROK) {
      return this.callGrok(prompt);
    } else if (USE_MINIMAX) {
      return this.callMiniMax(prompt);
    } else if (OPENAI_API_KEY) {
      return this.callOpenAI(prompt);
    }
    
    return '';
  }

  private async callGrok(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error('Grok API error:', error);
    }
    return '';
  }

  private async callMiniMax(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'abab6.5s-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error('MiniMax API error:', error);
    }
    return '';
  }

  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
    return '';
  }

  // Smart supplier recommendation based on price, lead time, reliability
  async recommendSupplier(
    productId: string,
    requiredQuantity: number,
    suppliers: any[]
  ): Promise<{ supplierId: string; reason: string; savings?: number } | null> {
    if (suppliers.length === 0) return null;
    
    // Score each supplier
    const scored = suppliers.map(s => ({
      ...s,
      score: this.calculateSupplierScore(s, requiredQuantity)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    
    return {
      supplierId: best.id,
      reason: `Best overall value: ${best.name} (${best.lead_time_hours}h lead time)`,
      savings: best.savings
    };
  }

  // Calculate optimal order quantity using EOQ-like formula
  calculateOptimalQuantity(
    dailyUsage: number,
    orderingCost: number,
    holdingCostRate: number,
    unitPrice: number
  ): number {
    if (dailyUsage <= 0 || unitPrice <= 0) return 0;
    
    // Economic Order Quantity (simplified)
    const annualDemand = dailyUsage * 365;
    const holdingCost = unitPrice * holdingCostRate;
    
    const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
    return Math.ceil(eoq);
  }

  // Private helpers
  private estimateDailyUsage(item: LowStockItem): number {
    // Fallback: estimate from current stock and status
    if (item.status === 'CRITICAL') return item.current_qty / 2;
    if (item.status === 'LOW') return item.current_qty / 5;
    return item.current_qty / 30; // Assume 30 days supply
  }

  private calculateSupplierScore(supplier: any, quantity: number): number {
    let score = 100;
    
    // Lower lead time is better
    if (supplier.lead_time_hours) {
      score -= supplier.lead_time_hours * 0.5;
    }
    
    // Has WhatsApp is a bonus (faster communication)
    if (supplier.whatsapp_phone) {
      score += 10;
    }
    
    // Active supplier
    if (!supplier.active === false) {
      score += 5;
    }
    
    return Math.max(0, score);
  }
}

export const createRestockaAI = (orgId: string) => new RestockaAI(orgId);
