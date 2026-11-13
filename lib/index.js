/**
 * dsh-extrusion — 挤出工艺参数与缺陷排查
 */

export const name = "dsh-extrusion";
export const inject = ["tools"];

const NL = String.fromCharCode(10);
const SITE = "https://deepseekbase.com/zh/tools/";
const TEXT_OUTPUT = {
  schema: { type: "object", additionalProperties: false, properties: { text: { type: "string" } }, required: ["text"] },
  render: (_args, value) => [{ type: "text", text: (value && value.text) || "" }],
};

const MATS = {
  pvc: { name: "PVC", zones: [160, 175, 185, 190], die: 195, swell: "1–5%" },
  pe: { name: "PE", zones: [150, 165, 180, 190], die: 195, swell: "5–15%" },
  pp: { name: "PP", zones: [170, 185, 200, 210], die: 215, swell: "10–20%" },
  abs: { name: "ABS", zones: [180, 195, 205, 215], die: 220, swell: "5–12%" },
  pa: { name: "PA", zones: [230, 245, 255, 265], die: 270, swell: "3–8%" },
};

const DEFECTS = {
  roughness: ["表面粗糙", "料温低、塑化不足、口模磨损", "提料温、增背压、修口模"],
  dimension: ["尺寸波动", "牵引速度不稳、熔体压力波动、冷却不均", "稳定牵引、加熔体泵、调冷却"],
  bubbles: ["气泡", "原料含水、排气不良、剪切过热", "干燥原料、开排气、降螺杆转速"],
  dielines: ["合流线", "口模流道死角、熔体汇合", "抛光流道、改口模结构"],
  warpage: ["翘曲", "冷却不均、内应力大", "均匀冷却、退火"],
};

function n(v, d) { const x = Number(v); return Number.isFinite(x) ? x : d; }

const TOOLS = {
  extrusion_params: {
    description: "挤出参数：按材料给各段温度、口模温度与挤出胀大范围",
    parameters: {
      type: "object", additionalProperties: false,
      properties: { material: { type: "string", enum: ["pvc", "pe", "pp", "abs", "pa"], description: "材料" } },
      required: ["material"],
    },
    run(args) {
      const m = MATS[String(args.material || "").toLowerCase()];
      if (!m) throw new Error("材料支持: pvc / pe / pp / abs / pa");
      return ["挤出参数", "=".repeat(52), "材料: " + m.name,
        "机筒温度: " + m.zones.join(" / ") + " °C", "口模温度: " + m.die + " °C",
        "挤出胀大: " + m.swell, "", "温度为常见区间，实际按螺杆、模具与产品结构调整。", "",
        "更多工具：" + SITE].join(NL);
    },
  },
  extrusion_defect: {
    description: "挤出缺陷排查：按缺陷给原因与对策",
    parameters: {
      type: "object", additionalProperties: false,
      properties: { defect: { type: "string", enum: ["roughness", "dimension", "bubbles", "dielines", "warpage"], description: "缺陷" } },
      required: ["defect"],
    },
    run(args) {
      const d = DEFECTS[String(args.defect || "").toLowerCase()];
      if (!d) throw new Error("支持: " + Object.keys(DEFECTS).join(" / "));
      return ["挤出缺陷排查", "=".repeat(52), "缺陷: " + d[0], "", "原因: " + d[1], "对策: " + d[2], "", "更多工具：" + SITE].join(NL);
    },
  },
};

export function apply(ctx, config) {
  void config;
  for (const name of Object.keys(TOOLS)) {
    const t = TOOLS[name];
    ctx.tools.register({
      name: name,
      description: t.description,
      parameters: t.parameters,
      output: TEXT_OUTPUT,
      async execute(args) { try { return { text: t.run(args || {}) }; } catch (e) { return { text: "处理失败: " + String((e && e.message) || e) }; } },
    });
  }
}
