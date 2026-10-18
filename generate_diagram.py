import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set high DPI and professional IEEE paper styling
fig = plt.figure(figsize=(11, 7.5), dpi=300)
ax = fig.add_subplot(111)
ax.set_xlim(0, 110)
ax.set_ylim(0, 100)
ax.axis('off')

# Color palette (Clean IEEE Technical Theme)
c_agent    = '#eff6ff'  # Soft blue
c_agent_b  = '#2563eb'
c_backend  = '#f0fdf4'  # Soft emerald
c_backend_b= '#16a34a'
c_ai       = '#fef2f2'  # Soft red
c_ai_b     = '#dc2626'
c_ui       = '#faf5ff'  # Soft violet
c_ui_b     = '#7c3aed'
c_dark     = '#0f172a'
c_sub      = '#334155'

def draw_box(x, y, w, h, bg, border, title, items, badge="", port=""):
    # Main rounded box with shadow-like appearance
    shadow = patches.FancyBboxPatch((x + 0.4, y - 0.4), w, h, boxstyle="round,pad=0.6,rounding_size=1.2",
                                    linewidth=0, facecolor='#e2e8f0', zorder=1)
    ax.add_patch(shadow)
    
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.6,rounding_size=1.2",
                                  linewidth=1.6, edgecolor=border, facecolor=bg, zorder=2)
    ax.add_patch(rect)
    
    # Title Banner
    ax.text(x + 2.5, y + h - 3.8, title, ha='left', va='center',
            fontsize=10.5, fontweight='bold', color=c_dark, family='sans-serif', zorder=3)
    
    if port:
        ax.text(x + w - 2.5, y + h - 3.8, port, ha='right', va='center',
                fontsize=8.5, fontweight='bold', color=border, family='monospace', zorder=3,
                bbox=dict(boxstyle="round,pad=0.2", facecolor='#ffffff', edgecolor=border, lw=1.0))
        
    # Bullet Items
    start_y = y + h - 8.0
    for idx, item in enumerate(items):
        ax.text(x + 3.0, start_y - idx * 3.4, f"•  {item}", ha='left', va='center',
                fontsize=8.5, color=c_sub, family='sans-serif', zorder=3)

def draw_horizontal_arrow(x1, y1, x2, y2, label=""):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(facecolor='#475569', edgecolor='#475569',
                                arrowstyle="-|>", lw=1.6, mutation_scale=13), zorder=4)
    if label:
        mx = (x1 + x2)/2
        ax.text(mx, y1 + 1.8, label, ha='center', va='center',
                fontsize=7.8, fontweight='bold', color='#1e293b', family='sans-serif', zorder=5,
                bbox=dict(boxstyle="round,pad=0.25", facecolor='#ffffff', edgecolor='#cbd5e1', lw=0.8))

def draw_vertical_arrow(x1, y1, x2, y2, label=""):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(facecolor='#475569', edgecolor='#475569',
                                arrowstyle="-|>", lw=1.6, mutation_scale=13), zorder=4)
    if label:
        my = (y1 + y2)/2
        ax.text(x1 + 1.2, my, label, ha='left', va='center',
                fontsize=7.8, fontweight='bold', color='#1e293b', family='sans-serif', zorder=5,
                bbox=dict(boxstyle="round,pad=0.25", facecolor='#ffffff', edgecolor='#cbd5e1', lw=0.8))

# ── 1. LAYER 1: ENDPOINT TELEMETRY SENSOR (Bottom-Left) ───────────────
draw_box(4, 8, 44, 34, c_agent, c_agent_b,
         "1. Endpoint Hardware Telemetry Sensor",
         [
             "Real Host OS Sensor daemon (agent/monitor.py)",
             "Process Enumeration (psutil snapshot delta)",
             "Win32 Kernel: GetDriveTypeW == 2 (Physical USB)",
             "Delta Tx Bytes: Real NIC Outbound Exfiltration",
             "Monitored Sandbox: Real Local File Activity"
         ],
         port="KERNEL")

# ── 2. LAYER 2: ENTERPRISE REST API GATEWAY (Top-Left) ────────────────
draw_box(4, 54, 44, 34, c_backend, c_backend_b,
         "2. Node.js / Express API Gateway",
         [
             "Port 5000: Microservices Orchestrator & JWT Auth",
             "Persistent Store: registered_employees.json",
             "Activity Controller: Ingests Real Endpoint Stream",
             "Sanitizer Service: Infinity / NaN Float Sanitization",
             "Dynamic Risk Index: 0–100 Weighted Score Engine"
         ],
         port=":5000")

# ── 3. LAYER 3: PYTHON AI INFERENCE ENGINE (Bottom-Right) ─────────────
draw_box(60, 8, 46, 34, c_ai, c_ai_b,
         "3. Python AI Behavioral Microservice",
         [
             "Port 5001 (Flask): Isolation Forest Model (T=100)",
             "6-Vector Behavioral Baseline (n=600 Normals)",
             "Drift Metric: D_t = ∑ |Z_j| Across 6 Behavioral Features",
             "Persistence Lock: Halt Baseline Updates if D_t ≥ 4.5",
             "Paired t-Test Engine: Multi-Trial Research Suite"
         ],
         port=":5001")

# ── 4. LAYER 4: EXECUTIVE SOC CONSOLE & LAB (Top-Right) ───────────────
draw_box(60, 54, 46, 34, c_ui, c_ui_b,
         "4. React 18 / Vite Security Console",
         [
             "Port 3000: Executive Bright SIEM Interface",
             "Real-Time SOC Dashboard & 7-Day Trend Visualizer",
             "Workstation Telemetry Audit (4s Polling Refresh)",
             "What-If Sandbox: Interactive Attack Vector Testing",
             "Empirical 30-Trial Evaluation Lab & CSV/JSON Export"
         ],
         port=":3000")

# ── CONNECTORS / ARROWS (Carefully aligned so no text collides) ────────
# 1. Sensor -> API Gateway (Vertical upward)
draw_vertical_arrow(26, 42, 26, 54, label="HTTP POST /api/activities\n(Real Telemetry Events)")

# 2. API Gateway -> AI Engine (Diagonal downward right)
ax.annotate('', xy=(60, 32), xytext=(48, 62),
            arrowprops=dict(facecolor='#475569', edgecolor='#475569',
                            arrowstyle="-|>", lw=1.6, mutation_scale=13), zorder=4)
ax.text(53.5, 48.5, "Forward Features\n/research/simulate", ha='center', va='center',
        fontsize=7.8, fontweight='bold', color='#1e293b', family='sans-serif', zorder=5,
        bbox=dict(boxstyle="round,pad=0.25", facecolor='#ffffff', edgecolor='#cbd5e1', lw=0.8))

# 3. AI Engine -> API Gateway (Diagonal upward left)
ax.annotate('', xy=(48, 56), xytext=(60, 24),
            arrowprops=dict(facecolor='#dc2626', edgecolor='#dc2626',
                            arrowstyle="-|>", lw=1.6, mutation_scale=13), zorder=4)
ax.text(54.5, 38.5, "Lock State & Scores\n(D_t ≥ 4.5 Trigger)", ha='center', va='center',
        fontsize=7.8, fontweight='bold', color='#dc2626', family='sans-serif', zorder=5,
        bbox=dict(boxstyle="round,pad=0.25", facecolor='#ffffff', edgecolor='#fecaca', lw=0.8))

# 4. Sensor -> AI Engine Schema indicator (Horizontal bottom)
draw_horizontal_arrow(48, 14, 60, 14, label="6D Feature Vector x_t")

# 5. Gateway <-> UI Console (Horizontal top, clean dual lines)
draw_horizontal_arrow(48, 74, 60, 74, label="Telemetry & Audit Logs")
draw_horizontal_arrow(60, 64, 48, 64, label="User Controls & Simulation Calls")

# Overall Figure Header
ax.text(55, 96.5, "Figure 1: Architectural Workflow of the Drift-Aware Insider Threat Detection Framework",
        ha='center', va='center', fontsize=12, fontweight='bold', color=c_dark, family='sans-serif')
ax.text(55, 93.5, "Illustrating OS telemetry ingestion, microservices API gateway, Isolation Forest drift-lock engine, and executive console.",
        ha='center', va='center', fontsize=8.8, color=c_sub, family='sans-serif')

plt.tight_layout()
plt.savefig('fig1.png', dpi=300, bbox_inches='tight')
print("Polished architecture diagram successfully regenerated as fig1.png")
