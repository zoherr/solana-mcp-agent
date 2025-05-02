import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { z } from "zod";

const connectionTestnet = new Connection("https://api.testnet.solana.com");
const connectionMainnet = new Connection("https://api.mainnet-beta.solana.com");
const connectionDevnet = new Connection("https://api.devnet.solana.com");

let wallet: string = "";

const server = new McpServer({
  name: "solana-mcp-agent",
  version: "0.0.1",
  capabilities: [
    "config-my-wallet",
    "get-testnet-balance",
    "get-testnet-last-transaction",
    "get-testnet-account-tokens",
    "get-mainnet-balance",
    "get-mainnet-last-transaction",
    "get-mainnet-account-tokens",
    "get-devnet-balance",
  ],
});

server.tool(
  "config-my-wallet",
  "Setup my wallet address",
  {
    address: z.string().describe("The wallet address"),
  },
  async ({ address }) => {
    wallet = address;
    return {
      content: [
        {
          type: "text",
          text: `Your account set successfully`,
        },
      ],
    };
  }
);

server.tool(
  "get-testnet-balance",
  "Get the balance of a address on the solana testnet",

  async () => {
    const balance = await connectionTestnet.getBalance(new PublicKey(wallet));
    return {
      content: [
        {
          type: "text",
          text: `Balance: ${balance}`,
        },
      ],
    };
  }
);

server.tool(
  "get-testnet-last-transaction",
  "Get the last transaction on the solana testnet",

  async () => {
    try {
      const signatures = await connectionTestnet.getSignaturesForAddress(
        new PublicKey(wallet),
        { limit: 1 }
      );

      if (signatures.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No transactions found for this address",
            },
          ],
        };
      }

      const latestSignature = signatures[0].signature;
      const transaction = await connectionTestnet.getConfirmedTransaction(
        latestSignature
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(transaction),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting transaction: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-testnet-account-tokens",
  "Get the tokens on the solana testnet",

  async () => {
    try {
      const tokens = await connectionTestnet.getTokenAccountsByOwner(
        new PublicKey(wallet),
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
        }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tokens),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting tokens: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-mainnet-balance",
  "Get the balance on the Solana mainnet",
  async () => {
    const balance = await connectionMainnet.getBalance(new PublicKey(wallet));
    return {
      content: [
        {
          type: "text",
          text: `Balance: ${balance}`,
        },
      ],
    };
  }
);

server.tool(
  "get-mainnet-last-transaction",
  "Get the last transaction on the Solana mainnet",

  async () => {
    try {
      const signatures = await connectionMainnet.getSignaturesForAddress(
        new PublicKey(wallet),
        { limit: 1 }
      );

      if (signatures.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No transactions found for this address",
            },
          ],
        };
      }

      const latestSignature = signatures[0].signature;
      const transaction = await connectionMainnet.getConfirmedTransaction(
        latestSignature
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(transaction),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting transaction: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-mainnet-account-tokens",
  "Get the tokens on the Solana mainnet",

  async () => {
    try {
      const tokens = await connectionMainnet.getTokenAccountsByOwner(
        new PublicKey(wallet),
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
        }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tokens),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting tokens: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-devnet-balance",
  "Get the balance on the Solana devnet",
  async () => {
    const balance = await connectionDevnet.getBalance(new PublicKey(wallet));
    return {
      content: [
        {
          type: "text",
          text: `Balance: ${balance}`,
        },
      ],
    };
  }
);

async function main() {
  try {
    console.error("Starting MCP server...");
    const transport = new StdioServerTransport();
    console.error("Transport initialized, connecting to server...");
    await server.connect(transport);
    console.error("Server connection established successfully");
  } catch (error) {
    console.error("There was an error connecting to the server:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("There was an error starting the server:", err);
  process.exit(1);
});
