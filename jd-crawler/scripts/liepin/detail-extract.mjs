// 猎聘详情页批量提取 —— 职位介绍→猎聘温馨提示 全文切片（DOM即全文，无需点展开；实测见 references/liepin.md）

const EXTRACT_EVAL = `(() => {
  const t = document.body.innerText;
  const i = t.indexOf('职位介绍');
  const j = t.indexOf('猎聘温馨提示');
  const jd = i >= 0 ? t.slice(i + 5, j > i ? j : t.length).trim() : '(no marker)';
  let header = '';
  const m = t.match(/[\\s\\S]{0,600}?(投简历|聊一聊)\\s*\\n/);
  if (m) header = m[0].trim();
  const ci = t.indexOf('公司信息');
  const company = ci >= 0
    ? t.slice(ci, Math.min(ci + 500, t.length)).split('\\n')
        .filter(l => /企业行业|融资阶段|人数规模|职位地址/.test(l)).join(' | ')
    : '';
  const oi = t.indexOf('其他信息');
  const other = oi >= 0
    ? t.slice(oi, Math.min(oi + 200, j > oi ? j : oi + 200)).replace(/\\n/g, ' ')
    : '';
  return { docTitle: document.title, jd, header, company, other };
})()`;

// 真截断标记（「查看全部」只控公司简介，不算截断）
const TRUNC_MARKS = ["登录查看", "展开更多", "点击展开", "加载更多"];

/**
 * 批量提取详情页。
 * @param tab   Tab 对象
 * @param urls  详情直链数组（批次≤8-10，纪律1）
 * @param opts  { pauseMs?: 700, waitMs?: 2500, scroll?: true }
 * @returns [{ url, docTitle, jd, header, company, other, jdLen, trunc:[标记] }]
 */
export async function extractDetails(tab, urls, opts = {}) {
  const pause = opts.pauseMs ?? 700;
  const wait = opts.waitMs ?? 2500;
  const out = [];
  for (const u of urls) {
    const rec = { url: u };
    try {
      await tab.goto(u);
      await tab.playwright.waitForLoadState({ state: "domcontentloaded" });
      await tab.playwright.waitForTimeout(wait);
      if (opts.scroll !== false) {
        await tab.playwright.evaluate("window.scrollTo(0, 600)", null, { timeoutMs: 1500 });
        await tab.playwright.waitForTimeout(600);
      }
      const d = await tab.playwright.evaluate(EXTRACT_EVAL, null, { timeoutMs: 3000 });
      Object.assign(rec, d);
      rec.jdLen = (d.jd || "").length;
      rec.trunc = TRUNC_MARKS.filter(mk => (d.jd || "").includes(mk));
    } catch (e) {
      rec.error = String(e).slice(0, 150);
    }
    await tab.playwright.waitForTimeout(pause);
    out.push(rec);
  }
  return out;
}

/** 批次序列化为落盘 JSON（经 Write 工具写 _raw/batchN.json） */
export function toBatchJson(records, meta = {}) {
  return JSON.stringify({ _meta: { ts: new Date().toISOString(), ...meta }, records }, null, 1);
}
