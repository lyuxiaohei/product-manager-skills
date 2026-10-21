// 猎聘搜索列表卡片采集 —— 在 mcp__node_repl__js 中 bootstrap 后 import 调用
// 用法见 SKILL.md；机制依据 references/liepin.md（全部实测）

export const LP_SEARCH_URL = (key, city) =>
  "https://www.liepin.com/zhaopin/?key=" + encodeURIComponent(key) + (city ? "&city=" + city : "");

const CARDS_EVAL = `(() => {
  const links = Array.from(document.querySelectorAll('a[href]'))
    .filter(a => /liepin\\.com\\/(job|a)\\/\\d+\\.shtml/.test(a.href));
  const seen = new Set(); const out = [];
  for (const a of links) {
    const url = a.href.split('?')[0];
    if (seen.has(url)) continue; seen.add(url);
    let card = a;
    for (let i = 0; i < 4; i++) { if (card.parentElement) card = card.parentElement; }
    const text = (card ? card.innerText : a.innerText)
      .replace(/[ \\t]+/g, ' ').replace(/\\s*\\n\\s*/g, '|').trim();
    out.push({ id: url.match(/\\d+/)[0], url, text: text.slice(0, 200) });
  }
  return out;
})()`;

/**
 * 多关键词收集卡片，跨词去重。
 * @param tab   browser-use 绑定的 Tab 对象
 * @param keys  关键词数组，如 ["供应链产品经理", "物流产品经理"]
 * @param opts  { city?: string, pauseMs?: number(默认1200), waitMs?: number(默认3000) }
 * @returns { groups: [{key, n, title}], cards: [{id,url,text,from}] }
 */
export async function collectCards(tab, keys, opts = {}) {
  const pause = opts.pauseMs ?? 1200;
  const wait = opts.waitMs ?? 3000;
  const byId = new Map();
  const groups = [];
  for (const k of keys) {
    await tab.goto(LP_SEARCH_URL(k, opts.city));
    await tab.playwright.waitForLoadState({ state: "domcontentloaded" });
    await tab.playwright.waitForTimeout(wait);
    const title = await tab.title();
    let cards = [];
    try {
      cards = await tab.playwright.evaluate(CARDS_EVAL, null, { timeoutMs: 3000 });
    } catch (e) {
      cards = [];
    }
    for (const c of cards) {
      if (!byId.has(c.id)) byId.set(c.id, { ...c, from: k });
    }
    groups.push({ key: k, n: cards.length, title: title.slice(0, 40) });
    await tab.playwright.waitForTimeout(pause);
  }
  return { groups, cards: [...byId.values()] };
}

/**
 * 标题双条件过滤（纪律4：领域词 ∧ 产品词）。
 * @param cards  collectCards 的输出
 * @param domain 领域词正则源，如 "供应链|物流|仓储|采购|计划|履约|WMS|SRM|TMS|OMS"
 * @param must   产品词正则源，默认 "产品"
 */
export function filterRelevant(cards, domain, must = "产品") {
  const d = new RegExp(domain, "i");
  const m = new RegExp(must);
  return cards.filter(c => d.test(c.text.split("|")[0] || "") && m.test(c.text.split("|")[0] || ""));
}
