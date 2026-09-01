
import { getConfig, hasAlpacaCredentials } from '../config.js';

export interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  regt_buying_power: string;
  daytrading_buying_power: string;
  cash: string;
  portfolio_value: string;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
  daytrade_count: number;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
}

export interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: 'us_equity' | 'us_option';
  avg_entry_price: string;
  qty: string;
  side: 'long' | 'short';
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

export interface AlpacaClock {
  timestamp: string;
  is_open: boolean;
  next_open: string;
  next_close: string;
}

export interface OptionSnapshot {
  symbol: string;
  latestQuote?: {
    askPrice: number;
    askSize: number;
    bidPrice: number;
    bidSize: number;
    timestamp: string;
  };
  latestTrade?: {
    price: number;
    size: number;
    timestamp: string;
  };
  greeks?: {
    delta: number;
    gamma: number;
    rho: number;
    theta: number;
    vega: number;
  };
  impliedVolatility?: number;
}

export interface StockSnapshot {
  symbol: string;
  latestQuote?: {
    ap: number; // ask price
    as: number; // ask size
    bp: number; // bid price
    bs: number; // bid size
    t: string;  // timestamp
  };
  latestTrade?: {
    p: number;  // price
    s: number;  // size
    t: string;  // timestamp
  };
  dailyBar?: {
    c: number;  // close
    h: number;  // high
    l: number;  // low
    n: number;  // number of trades
    o: number;  // open
    v: number;  // volume
    vw: number; // volume weighted price
  };
  prevDailyBar?: {
    c: number;
    h: number;
    l: number;
    v: number;
  };
}

export interface CreateOrderParams {
  symbol: string;
  qty?: number;
  notional?: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force: 'day' | 'gtc' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
  client_order_id?: string;
  order_class?: 'simple' | 'bracket' | 'oto' | 'oco' | 'mleg';
  legs?: Array<{
    symbol: string;
    ratio_qty: number;
    side: 'buy' | 'sell';
  }>;
}

export interface AlpacaOrder {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at?: string;
  expired_at?: string;
  canceled_at?: string;
  failed_at?: string;
  asset_id: string;
  symbol: string;
  asset_class: string;
  qty: string;
  filled_qty: string;
  type: string;
  side: string;
  time_in_force: string;
  limit_price?: string;
  stop_price?: string;
  status: 'new' | 'partially_filled' | 'filled' | 'done_for_day' | 'canceled' | 'expired' | 'replaced' | 'pending_cancel' | 'pending_replace' | 'accepted' | 'pending_new' | 'accepted_for_bidding' | 'stopped' | 'rejected' | 'suspended' | 'calculated';
}

export class AlpacaClient {
  private getHeaders(): Record<string, string> {
    const config = getConfig();
    return {
      'APCA-API-KEY-ID': config.alpacaApiKey,
      'APCA-API-SECRET-KEY': config.alpacaSecretKey,
      'Content-Type': 'application/json',
    };
  }

  private async fetchTradingApi<T>(path: string, options: RequestInit = {}): Promise<T | null> {
    if (!hasAlpacaCredentials()) {
      return null;
    }
    const config = getConfig();
    const url = `${config.alpacaBaseUrl}${path}`;
    try {
      const res = await fetch(url, {
        ...options,
        signal: options.signal || AbortSignal.timeout(4000),
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[Alpaca Trading API Error] ${res.status} ${res.statusText}: ${errorText}`);
        return null;
      }
      return (await res.json()) as T;
    } catch (err) {
      console.error(`[Alpaca Trading API Exception] ${path}:`, err);
      return null;
    }
  }

  private async fetchDataApi<T>(path: string, options: RequestInit = {}): Promise<T | null> {
    if (!hasAlpacaCredentials()) {
      return null;
    }
    const config = getConfig();
    const url = `${config.alpacaDataUrl}${path}`;
    try {
      const res = await fetch(url, {
        ...options,
        signal: options.signal || AbortSignal.timeout(4000),
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[Alpaca Data API Error] ${res.status} ${res.statusText}: ${errorText}`);
        return null;
      }
      return (await res.json()) as T;
    } catch (err) {
      console.error(`[Alpaca Data API Exception] ${path}:`, err);
      return null;
    }
  }

  public async getAccount(): Promise<AlpacaAccount | null> {
    return this.fetchTradingApi<AlpacaAccount>('/v2/account');
  }

  public async getClock(): Promise<AlpacaClock | null> {
    const liveClock = await this.fetchTradingApi<AlpacaClock>('/v2/clock');
    if (liveClock) return liveClock;

    // Fallback: Compute US Equities Market hours (9:30 AM - 4:00 PM Eastern Time, Mon-Fri)
    const now = new Date();
    try {
      const nyDateStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
      const nyDate = new Date(nyDateStr);

      const day = nyDate.getDay(); // 0 = Sun, 6 = Sat
      const timeInMinutes = nyDate.getHours() * 60 + nyDate.getMinutes();

      const isWeekday = day >= 1 && day <= 5;
      const isMarketHours = timeInMinutes >= (9 * 60 + 30) && timeInMinutes < (16 * 60);
      const isOpen = isWeekday && isMarketHours;

      return {
        timestamp: now.toISOString(),
        is_open: isOpen,
        next_open: new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
        next_close: new Date(now.getTime() + 6 * 3600 * 1000).toISOString(),
      };
    } catch {
      return null;
    }
  }

  public async getPositions(): Promise<AlpacaPosition[]> {
    const pos = await this.fetchTradingApi<AlpacaPosition[]>('/v2/positions');
    return pos || [];
  }

  public async getStockSnapshots(symbols: string[]): Promise<Record<string, StockSnapshot>> {
    if (symbols.length === 0) return {};
    const query = symbols.join(',');
    const data = await this.fetchDataApi<Record<string, StockSnapshot>>(`/v2/stocks/snapshots?symbols=${encodeURIComponent(query)}`);
    return data || {};
  }

  public async getOptionsSnapshots(underlyingSymbol: string): Promise<Record<string, OptionSnapshot>> {
    const data = await this.fetchDataApi<{ snapshots?: Record<string, OptionSnapshot> }>(
      `/v1beta1/options/snapshots/${encodeURIComponent(underlyingSymbol)}`
    );
    return data?.snapshots || {};
  }

  public async createOrder(orderParams: CreateOrderParams): Promise<AlpacaOrder | null> {
    return this.fetchTradingApi<AlpacaOrder>('/v2/orders', {
      method: 'POST',
      body: JSON.stringify(orderParams),
    });
  }

  public async getOrder(orderId: string): Promise<AlpacaOrder | null> {
    return this.fetchTradingApi<AlpacaOrder>(`/v2/orders/${orderId}`);
  }

  public async cancelOrder(orderId: string): Promise<boolean> {
    const res = await this.fetchTradingApi<unknown>(`/v2/orders/${orderId}`, {
      method: 'DELETE',
    });
    return res !== null;
  }

  public async closePosition(symbol: string): Promise<AlpacaOrder | null> {
    return this.fetchTradingApi<AlpacaOrder>(`/v2/positions/${encodeURIComponent(symbol)}`, {
      method: 'DELETE',
    });
  }
}

export const alpacaClient = new AlpacaClient();
