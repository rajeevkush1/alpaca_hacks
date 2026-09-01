import { exec } from 'child_process';
import { promisify } from 'util';
import { getConfig } from '../config.js';

const execAsync = promisify(exec);

export interface McpToolCallResult {
  success: boolean;
  source: 'MCP' | 'CLI' | 'DIRECT';
  command: string;
  output?: any;
  error?: string;
}

export class AlpacaMcpWrapper {
  /**
   * Check if Alpaca CLI or MCP server is available in system environment
   */
  public async checkAvailability(): Promise<{ cliAvailable: boolean; mcpAvailable: boolean }> {
    let cliAvailable = false;
    try {
      const { stdout } = await execAsync('alpaca --version', { timeout: 2000 });
      if (stdout && stdout.trim().length > 0) {
        cliAvailable = true;
      }
    } catch {
      cliAvailable = false;
    }

    return {
      cliAvailable,
      mcpAvailable: true, // Internal MCP wrapper integration
    };
  }

  /**
   * Execute an Alpaca command via CLI if available, or fall back to structured direct API dispatch
   */
  public async executeCommand(command: string, args: Record<string, any> = {}): Promise<McpToolCallResult> {
    const config = getConfig();

    if (!config.useMcpCli) {
      return {
        success: false,
        source: 'DIRECT',
        command,
        error: 'MCP/CLI integration is disabled in configuration',
      };
    }

    // Try executing via CLI command if available
    try {
      const formattedArgs = Object.entries(args)
        .map(([k, v]) => `--${k}="${v}"`)
        .join(' ');
      const fullCmd = `alpaca ${command} ${formattedArgs}`;

      const { stdout, stderr } = await execAsync(fullCmd, {
        env: {
          ...process.env,
          APCA_API_KEY_ID: config.alpacaApiKey,
          APCA_API_SECRET_KEY: config.alpacaSecretKey,
        },
        timeout: 5000,
      });

      if (stderr && stderr.trim()) {
        console.warn(`[Alpaca CLI Warning] ${stderr}`);
      }

      let parsed = stdout.trim();
      try {
        parsed = JSON.parse(stdout);
      } catch {
        // Raw string output
      }

      return {
        success: true,
        source: 'CLI',
        command: fullCmd,
        output: parsed,
      };
    } catch (err: any) {
      // Return structured response indicating fallback to Direct REST API client
      return {
        success: false,
        source: 'DIRECT',
        command,
        error: `CLI Execution fallback: ${err.message || 'Alpaca CLI not installed or failed'}`,
      };
    }
  }
}

export const mcpWrapper = new AlpacaMcpWrapper();
