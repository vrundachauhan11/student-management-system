#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'frontend');
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');
const CSS_PATH = path.join(FRONTEND_DIR, 'src', 'index.css');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(BACKEND_DIR, '.env') });

const RENDER_API_BASE = 'https://api.render.com/v1';

async function callRenderApi(endpoint, options = {}) {
  const apiKey = process.env.RENDER_API_KEY;
  if (!apiKey) {
    throw new Error('RENDER_API_KEY is not configured in backend/.env');
  }
  const url = `${RENDER_API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({ status: res.status, text: res.statusText }));
  if (!res.ok) {
    throw new Error(data.message || `Render API error: ${res.status} ${res.statusText}`);
  }
  return data;
}

const THEME_PRESETS = {
  'dark': {
    '--color-bg': '#0f172a',
    '--color-surface': '#1e293b',
    '--color-border': '#334155',
    '--color-border-hover': '#475569',
    '--color-text-main': '#f8fafc',
    '--color-text-muted': '#94a3b8',
    '--color-text-subtle': '#64748b',
    '--color-primary': '#3b82f6',
    '--color-primary-hover': '#2563eb',
    '--color-primary-light': '#1e3a8a33',
    '--color-primary-border': '#1e40af',
  },
  'emerald': {
    '--color-primary': '#059669',
    '--color-primary-hover': '#047857',
    '--color-primary-light': '#ecfdf5',
    '--color-primary-border': '#a7f3d0',
  },
  'purple': {
    '--color-primary': '#7c3aed',
    '--color-primary-hover': '#6d28d9',
    '--color-primary-light': '#f5f3ff',
    '--color-primary-border': '#ddd6fe',
  },
  'sunset': {
    '--color-primary': '#ea580c',
    '--color-primary-hover': '#c2410c',
    '--color-primary-light': '#fff7ed',
    '--color-primary-border': '#fed7aa',
  },
  'cyberpunk': {
    '--color-bg': '#0a0a0f',
    '--color-surface': '#12121a',
    '--color-border': '#2d1b4e',
    '--color-border-hover': '#4c2882',
    '--color-text-main': '#00ffcc',
    '--color-text-muted': '#a78bfa',
    '--color-text-subtle': '#6b7280',
    '--color-primary': '#f43f5e',
    '--color-primary-hover': '#e11d48',
    '--color-primary-light': '#88133744',
    '--color-primary-border': '#f43f5e',
  },
  'light-default': {
    '--color-bg': '#f8fafc',
    '--color-surface': '#ffffff',
    '--color-border': '#e2e8f0',
    '--color-border-hover': '#cbd5e1',
    '--color-text-main': '#0f172a',
    '--color-text-muted': '#64748b',
    '--color-text-subtle': '#94a3b8',
    '--color-primary': '#2563eb',
    '--color-primary-hover': '#1d4ed8',
    '--color-primary-light': '#eff6ff',
    '--color-primary-border': '#bfdbfe',
  },
};

// Initialize MCP Server
const server = new Server(
  {
    name: 'student-management-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'update_website_theme',
        description: 'Updates colors and visual styling of the website in frontend/src/index.css. Supports preset themes (dark, emerald, purple, sunset, cyberpunk, light-default) or custom hex colors.',
        inputSchema: {
          type: 'object',
          properties: {
            preset: {
              type: 'string',
              description: 'Optional preset theme name: dark, emerald, purple, sunset, cyberpunk, light-default',
              enum: ['dark', 'emerald', 'purple', 'sunset', 'cyberpunk', 'light-default'],
            },
            primaryColor: {
              type: 'string',
              description: 'Hex or CSS color code for primary buttons and accents (e.g. #7c3aed, #059669)',
            },
            backgroundColor: {
              type: 'string',
              description: 'Hex or CSS color code for page background (e.g. #0f172a for dark, #f8fafc for light)',
            },
            surfaceColor: {
              type: 'string',
              description: 'Hex or CSS color code for cards and navbar surface (e.g. #1e293b, #ffffff)',
            },
            textColor: {
              type: 'string',
              description: 'Hex or CSS color code for main body text (e.g. #f8fafc, #0f172a)',
            },
          },
        },
      },
      {
        name: 'get_website_theme',
        description: 'Reads and returns current active color variables from frontend/src/index.css',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_student_schema',
        description: 'Inspects and returns current Mongoose schema fields, types, and validation rules from backend/src/models/Student.js',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'add_schema_field',
        description: 'Adds a new field to the Student Mongoose schema in backend/src/models/Student.js, and updates controller and React forms.',
        inputSchema: {
          type: 'object',
          properties: {
            fieldName: {
              type: 'string',
              description: 'Name of the field in camelCase (e.g. bloodGroup, dateOfBirth, address, cgpa)',
            },
            fieldType: {
              type: 'string',
              enum: ['String', 'Number', 'Date', 'Boolean'],
              description: 'Field data type',
            },
            required: {
              type: 'boolean',
              description: 'Whether this field is mandatory',
            },
            label: {
              type: 'string',
              description: 'Human-readable label for UI form (e.g. "Blood Group", "Date of Birth")',
            },
          },
          required: ['fieldName', 'fieldType'],
        },
      },
      {
        name: 'query_mongodb',
        description: 'Executes a query or operation directly on MongoDB Atlas collection studentDB.students',
        inputSchema: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              enum: ['find', 'count', 'findById', 'insertOne', 'updateOne', 'deleteOne'],
              description: 'Operation to perform',
            },
            filter: {
              type: 'object',
              description: 'Query filter object (e.g. {"department": "Computer Science & Engineering"})',
            },
            document: {
              type: 'object',
              description: 'Document to insert or update',
            },
          },
          required: ['operation'],
        },
      },
      {
        name: 'render_list_services',
        description: 'Lists all services hosted on your Render cloud account (service name, ID, type, repo, and live URLs)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'render_trigger_deploy',
        description: 'Triggers a new deployment of a Render service (e.g. student-management-api). Can clear build cache or deploy normal.',
        inputSchema: {
          type: 'object',
          properties: {
            serviceIdOrName: {
              type: 'string',
              description: 'Service ID (e.g. srv-db7mhfuq1p3s73d1534g) or service name (e.g. "student-management-api")',
            },
            clearCache: {
              type: 'string',
              enum: ['clear', 'do_not_clear'],
              description: 'Whether to clear build cache on Render',
            },
          },
          required: ['serviceIdOrName'],
        },
      },
      {
        name: 'render_get_service',
        description: 'Gets details, environment variables, or latest deploys for a Render service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceIdOrName: {
              type: 'string',
              description: 'Service ID or service name',
            },
          },
          required: ['serviceIdOrName'],
        },
      },
      {
        name: 'render_manage_env_vars',
        description: 'Lists or updates environment variables on a Render service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceIdOrName: {
              type: 'string',
              description: 'Service ID or service name',
            },
            envVars: {
              type: 'array',
              description: 'Array of { key, value } environment variables to set or update',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' },
                },
                required: ['key', 'value'],
              },
            },
          },
          required: ['serviceIdOrName'],
        },
      },
      {
        name: 'read_project_file',
        description: 'Reads any file within the student-management-system repository',
        inputSchema: {
          type: 'object',
          properties: {
            relativePath: {
              type: 'string',
              description: 'Relative path from project root (e.g. "frontend/src/App.jsx", "backend/src/server.js")',
            },
          },
          required: ['relativePath'],
        },
      },
      {
        name: 'edit_project_file',
        description: 'Updates or overwrites a file in the project with new content',
        inputSchema: {
          type: 'object',
          properties: {
            relativePath: {
              type: 'string',
              description: 'Relative path from project root',
            },
            content: {
              type: 'string',
              description: 'New full content to write to the file',
            },
          },
          required: ['relativePath', 'content'],
        },
      },
      {
        name: 'build_and_deploy',
        description: 'Builds frontend production bundle, commits changes to Git, and pushes to GitHub (auto-deploying on Render and Netlify)',
        inputSchema: {
          type: 'object',
          properties: {
            commitMessage: {
              type: 'string',
              description: 'Git commit message describing the changes made',
            },
          },
          required: ['commitMessage'],
        },
      },
      {
        name: 'get_project_status',
        description: 'Returns health status of frontend, backend, MongoDB connection, and Git repo branch',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Helper to resolve service name to service ID on Render
async function resolveRenderServiceId(serviceIdOrName) {
  if (serviceIdOrName.startsWith('srv-')) {
    return serviceIdOrName;
  }
  const services = await callRenderApi('/services');
  const found = services.find(
    (s) => s.service.name.toLowerCase() === serviceIdOrName.toLowerCase()
  );
  if (!found) {
    throw new Error(`Render service '${serviceIdOrName}' not found. Available services: ${services.map(s => s.service.name).join(', ')}`);
  }
  return found.service.id;
}

// Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'update_website_theme': {
        if (!fs.existsSync(CSS_PATH)) {
          return { content: [{ type: 'text', text: `Error: CSS file not found at ${CSS_PATH}` }] };
        }

        let cssContent = fs.readFileSync(CSS_PATH, 'utf-8');
        const updates = {};

        // Apply preset if specified
        if (args.preset && THEME_PRESETS[args.preset]) {
          Object.assign(updates, THEME_PRESETS[args.preset]);
        }

        // Apply custom colors if specified
        if (args.primaryColor) {
          updates['--color-primary'] = args.primaryColor;
          updates['--color-primary-hover'] = args.primaryColor;
        }
        if (args.backgroundColor) {
          updates['--color-bg'] = args.backgroundColor;
        }
        if (args.surfaceColor) {
          updates['--color-surface'] = args.surfaceColor;
        }
        if (args.textColor) {
          updates['--color-text-main'] = args.textColor;
        }

        // Replace each variable in :root section
        for (const [key, value] of Object.entries(updates)) {
          const regex = new RegExp(`(${key}\\s*:\\s*)([^;]+)(;)`, 'g');
          if (regex.test(cssContent)) {
            cssContent = cssContent.replace(regex, `$1${value}$3`);
          }
        }

        fs.writeFileSync(CSS_PATH, cssContent, 'utf-8');

        return {
          content: [
            {
              type: 'text',
              text: `✅ Website theme updated successfully!\nApplied variables:\n${JSON.stringify(updates, null, 2)}\nChanges saved to frontend/src/index.css. Refresh your browser at http://localhost:5173 to view live.`,
            },
          ],
        };
      }

      case 'get_website_theme': {
        if (!fs.existsSync(CSS_PATH)) {
          return { content: [{ type: 'text', text: 'CSS file not found' }] };
        }
        const cssContent = fs.readFileSync(CSS_PATH, 'utf-8');
        const rootMatch = cssContent.match(/:root\s*\{([\s\S]*?)\}/);
        const variables = {};
        if (rootMatch) {
          const lines = rootMatch[1].split('\n');
          for (const line of lines) {
            const match = line.match(/^\s*(--color-[a-z0-9-]+)\s*:\s*([^;]+);/);
            if (match) {
              variables[match[1]] = match[2].trim();
            }
          }
        }
        return {
          content: [
            {
              type: 'text',
              text: `Active Website Theme Colors:\n${JSON.stringify(variables, null, 2)}`,
            },
          ],
        };
      }

      case 'render_list_services': {
        const services = await callRenderApi('/services');
        const formatted = services.map((s) => ({
          name: s.service.name,
          id: s.service.id,
          type: s.service.type,
          url: s.service.serviceDetails?.url || `https://${s.service.slug}.onrender.com`,
          autoDeploy: s.service.autoDeploy,
          updatedAt: s.service.updatedAt,
        }));
        return {
          content: [
            {
              type: 'text',
              text: `Render Services:\n${JSON.stringify(formatted, null, 2)}`,
            },
          ],
        };
      }

      case 'render_trigger_deploy': {
        const serviceId = await resolveRenderServiceId(args.serviceIdOrName);
        const clearCache = args.clearCache || 'do_not_clear';
        const deploy = await callRenderApi(`/services/${serviceId}/deploys`, {
          method: 'POST',
          body: JSON.stringify({ clearCache }),
        });
        return {
          content: [
            {
              type: 'text',
              text: `🚀 Render Deploy Triggered!\nService: ${args.serviceIdOrName} (${serviceId})\nDeploy ID: ${deploy.id}\nStatus: ${deploy.status}\nCommit: ${deploy.commit?.message || 'Latest HEAD'}\nCreated At: ${deploy.createdAt}`,
            },
          ],
        };
      }

      case 'render_get_service': {
        const serviceId = await resolveRenderServiceId(args.serviceIdOrName);
        const service = await callRenderApi(`/services/${serviceId}`);
        const deploys = await callRenderApi(`/services/${serviceId}/deploys?limit=3`).catch(() => []);
        return {
          content: [
            {
              type: 'text',
              text: `Render Service Details:\n${JSON.stringify({ service: service.service || service, latestDeploys: deploys }, null, 2)}`,
            },
          ],
        };
      }

      case 'render_manage_env_vars': {
        const serviceId = await resolveRenderServiceId(args.serviceIdOrName);
        if (args.envVars && Array.isArray(args.envVars)) {
          const updated = await callRenderApi(`/services/${serviceId}/env-vars`, {
            method: 'PUT',
            body: JSON.stringify(args.envVars),
          });
          return {
            content: [
              {
                type: 'text',
                text: `✅ Updated environment variables for ${args.serviceIdOrName}:\n${JSON.stringify(updated, null, 2)}`,
              },
            ],
          };
        } else {
          const vars = await callRenderApi(`/services/${serviceId}/env-vars`);
          return {
            content: [
              {
                type: 'text',
                text: `Environment variables for ${args.serviceIdOrName}:\n${JSON.stringify(vars, null, 2)}`,
              },
            ],
          };
        }
      }

      case 'get_student_schema': {
        const schemaPath = path.join(BACKEND_DIR, 'src', 'models', 'Student.js');
        if (!fs.existsSync(schemaPath)) {
          return { content: [{ type: 'text', text: 'Student model file not found' }] };
        }
        const code = fs.readFileSync(schemaPath, 'utf-8');
        return {
          content: [
            {
              type: 'text',
              text: `Mongoose Student Schema (backend/src/models/Student.js):\n\n${code}`,
            },
          ],
        };
      }

      case 'add_schema_field': {
        const { fieldName, fieldType, required = false, label = fieldName } = args;
        const schemaPath = path.join(BACKEND_DIR, 'src', 'models', 'Student.js');
        let code = fs.readFileSync(schemaPath, 'utf-8');

        if (code.includes(`${fieldName}:`)) {
          return { content: [{ type: 'text', text: `Field '${fieldName}' already exists in Student.js schema.` }] };
        }

        const newFieldSnippet = `    ${fieldName}: {
      type: ${fieldType},
      required: [${required}, '${label} is required'],
      trim: true,
    },\n  },\n  {`;

        code = code.replace(/\n\s*\}\,\s*\{/, `\n${newFieldSnippet}`);
        fs.writeFileSync(schemaPath, code, 'utf-8');

        return {
          content: [
            {
              type: 'text',
              text: `✅ Added field '${fieldName}' (${fieldType}, required=${required}) to backend/src/models/Student.js.`,
            },
          ],
        };
      }

      case 'query_mongodb': {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
          return { content: [{ type: 'text', text: 'Error: MONGODB_URI is not configured in backend/.env' }] };
        }

        let connection;
        try {
          connection = await mongoose.createConnection(uri, {
            dbName: 'studentDB',
            serverSelectionTimeoutMS: 8000,
          }).asPromise();

          const collection = connection.collection('students');
          let result;

          const filter = args.filter || {};

          if (args.operation === 'find') {
            result = await collection.find(filter).limit(50).toArray();
          } else if (args.operation === 'count') {
            result = { count: await collection.countDocuments(filter) };
          } else if (args.operation === 'findById') {
            result = await collection.findOne({ studentId: filter.studentId || filter.id });
          } else if (args.operation === 'insertOne') {
            result = await collection.insertOne(args.document || {});
          } else if (args.operation === 'updateOne') {
            result = await collection.updateOne(filter, { $set: args.document || {} });
          } else if (args.operation === 'deleteOne') {
            result = await collection.deleteOne(filter);
          }

          await connection.close();

          return {
            content: [
              {
                type: 'text',
                text: `MongoDB Atlas Operation '${args.operation}' Result:\n${JSON.stringify(result, null, 2)}`,
              },
            ],
          };
        } catch (dbErr) {
          if (connection) await connection.close().catch(() => {});
          return {
            content: [
              {
                type: 'text',
                text: `MongoDB Atlas Error: ${dbErr.message}\nNote: Make sure your current IP address is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access.`,
              },
            ],
          };
        }
      }

      case 'read_project_file': {
        const targetPath = path.resolve(PROJECT_ROOT, args.relativePath);
        if (!targetPath.startsWith(PROJECT_ROOT)) {
          return { content: [{ type: 'text', text: 'Access denied: Path outside project root.' }] };
        }
        if (!fs.existsSync(targetPath)) {
          return { content: [{ type: 'text', text: `File not found: ${args.relativePath}` }] };
        }
        const data = fs.readFileSync(targetPath, 'utf-8');
        return { content: [{ type: 'text', text: data }] };
      }

      case 'edit_project_file': {
        const targetPath = path.resolve(PROJECT_ROOT, args.relativePath);
        if (!targetPath.startsWith(PROJECT_ROOT)) {
          return { content: [{ type: 'text', text: 'Access denied: Path outside project root.' }] };
        }
        fs.writeFileSync(targetPath, args.content, 'utf-8');
        return { content: [{ type: 'text', text: `✅ File updated: ${args.relativePath}` }] };
      }

      case 'build_and_deploy': {
        const { commitMessage } = args;
        // 1. Build frontend
        const buildResult = await execAsync('npm run build', { cwd: FRONTEND_DIR });

        // 2. Git add, commit, push
        await execAsync('git add .', { cwd: PROJECT_ROOT });
        const commitResult = await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { cwd: PROJECT_ROOT });
        const pushResult = await execAsync('git push origin main', { cwd: PROJECT_ROOT });

        return {
          content: [
            {
              type: 'text',
              text: `🚀 Production Build & GitHub Push Succeeded!\n\nBuild:\n${buildResult.stdout}\n\nCommit:\n${commitResult.stdout}\n\nPush:\n${pushResult.stdout || 'Pushed to origin/main'}\n\nRender & Netlify will auto-deploy these changes within 1-2 minutes!`,
            },
          ],
        };
      }

      case 'get_project_status': {
        const gitStatus = await execAsync('git status --short', { cwd: PROJECT_ROOT });
        return {
          content: [
            {
              type: 'text',
              text: `Project Status:\n- Root: ${PROJECT_ROOT}\n- Git changes:\n${gitStatus.stdout || 'Clean working tree'}\n- Live Backend: https://student-management-api-36wp.onrender.com\n- Local Frontend: http://localhost:5173`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Tool error in ${name}: ${err.message}` }],
    };
  }
});

// Start Server Transport on stdio
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Student Management MCP Server running on stdio');
