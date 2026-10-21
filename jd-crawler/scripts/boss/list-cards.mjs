// Boss搜索列表探测（配额内可用；墙检测勿误用「发送验证码」当条件——实测见 references/boss.md）

export const BOSS_SEARCH_URL = (query, city = "100010000") =>
  "https://www.zhipin.com/web/geek/job?query=" + encodeURIComponent(query) + "&city=" + city;

const CARDS_EVAL = `(() => {
  const dec = s => Array.from(s).map(c => { const cp = c.codePointAt(0); return (cp >= 0xE031 && cp <= 0xE03A) ? String(cp - 0xE031) : c; }).join('');
  const seen = new Set(); const out = [];
  for (const a of document.querySelectorAll('a[href*="job_detail"]')) {
    const url = a.href.split('?')[0];
    if (seen.has(url)) continue; seen.add(url);
    const li = a.closest('li');
    const salEl = li && li.querySelector('.job-salary');
    const salary = salEl ? dec(salEl.textContent.trim()) : '';
    let card = a;
    for (let i = 0; i < 6 && card; i++) card = card.parentElement;
    out.push({ url, salary, txt: (card ? card.innerText : a.innerText)
      .replace(/[ \\t]+/g, ' ').replace(/\\s*\\n\\s*/g, '|').trim().slice(0, 150) });
  }
  return out;
})()`;

/**
 * 探测搜索列表。未登录配额耗尽时返回 { walled: true }。
 * 注意：卡片文本不含薪资（未登录态隐藏），经验/学历有值。
 */
export async function probeSearchList(tab, query, opts = {}) {
  const wait = opts.waitMs ?? 3000;
  await tab.goto(BOSS_SEARCH_URL(query, opts.city));
  await tab.playwright.waitForLoadState({ state: "domcontentloaded" });
  await tab.playwright.waitForTimeout(wait);
  const title = await tab.title();
  if (/注册登录/.test(title)) {
    return { walled: true, title, cards: [] };
  }
  const cards = await tab.playwright.evaluate(CARDS_EVAL, null, { timeoutMs: 3000 });
  return { walled: false, title, cards };
}

/** 标题双条件过滤（领域词 ∧ 产品词） */
export function filterRelevant(cards, domain, must = "产品") {
  const d = new RegExp(domain, "i");
  const m = new RegExp(must);
  return cards.filter(c => d.test(c.txt.split("|")[0] || "") && m.test(c.txt.split("|")[0] || ""));
}
