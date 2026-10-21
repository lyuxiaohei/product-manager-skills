// Boss详情页提取 + 未登录BFS采集（JD截断于登录墙属正常态，truncated 标记之；实测见 references/boss.md）

const EXTRACT_EVAL = `(() => {
  const dec = s => Array.from(s).map(c => { const cp = c.codePointAt(0); return (cp >= 0xE031 && cp <= 0xE03A) ? String(cp - 0xE031) : c; }).join('');
  const t = document.body.innerText;
  const salEl = document.querySelector('.job-salary, [class*="salary"]');
  const salary = salEl ? dec(salEl.textContent.trim()) : '';
  // 登录态全文：职位描述→竞争力分析；未登录态到「登录查看完整内容」自然截断（trunc 标记）
  const i1 = t.indexOf('职位描述');
  const i2 = t.indexOf('竞争力分析');
  const i3 = t.indexOf('BOSS 安全提示');
  const jd = i1 >= 0 ? t.slice(i1 + 4, i2 > 0 ? i2 : (i3 > 0 ? i3 : i1 + 3000)).trim() : t.slice(0, 2000).trim();
  const ci = t.indexOf('公司介绍');
  const gi = t.indexOf('工商信息');
  const intro = (ci > 0 && gi > ci) ? t.slice(ci + 4, Math.min(ci + 300, gi)).replace(/\\n/g, ' ') : '';
  const rel = [];
  for (const a of document.querySelectorAll('a[href*="job_detail"]')) {
    const url = a.href.split('?')[0];
    const txt = a.innerText.replace(/\\s*\\n\\s*/g, '|').trim();
    if (txt && !rel.some(r => r.url === url)) rel.push({ url, txt: txt.slice(0, 100) });
  }
  return { docTitle: document.title, salary, jd, intro, rel, trunc: /登录查看完整内容/.test(jd) };
})()`;

const uidOf = u => { const m = (u || "").match(/job_detail\/(.+?)\.html/); return m ? m[1] : u; };

// Boss薪资字体反爬解码：数字映射在 U+E031..E03A，实测顺序式 e031+n=数字n（见 references/boss.md）
export const decodeSalary = s =>
  Array.from(s || "").map(c => {
    const cp = c.codePointAt(0);
    return cp >= 0xe031 && cp <= 0xe03a ? String(cp - 0xe031) : c;
  }).join("");

// 解码结果必须过格式校验：不匹配说明映射已轮换，勿静默采用
export const validSalary = s => /^\d+(-\d+)?K(·\d+薪)?$/.test(s || "");

export const isWalled = docTitle => /注册登录】/.test(docTitle || "");

/** 默认相关性：领域词∧产品词（调用方可传自定义） */
export const REL_DEFAULT = t => /(供应链|物流|仓储|采购|计划|履约|wms|srm|tms|oms|erp)/i.test(t) && /产品/.test(t);

/** 单页提取 */
export async function extractDetail(tab, url, opts = {}) {
  const wait = opts.waitMs ?? 2200;
  const rec = { url };
  try {
    await tab.goto(url);
    await tab.playwright.waitForLoadState({ state: "domcontentloaded" });
    await tab.playwright.waitForTimeout(wait);
    const d = await tab.playwright.evaluate(EXTRACT_EVAL, null, { timeoutMs: 3000 });
    Object.assign(rec, d, { walled: isWalled(d.docTitle) });
  } catch (e) {
    rec.error = String(e).slice(0, 150);
  }
  return rec;
}

/**
 * 未登录BFS：访问 urls 各页并收集记录 + 过滤后的新队列。
 * 无跨调用状态（kernel每次重置），把返回的 queue/known 序列化后在下一批传回。
 * @param tab   Tab 对象
 * @param urls  本批要访问的详情URL（≤8）
 * @param known 已知id数组（含已访问+已入队），跨批传入
 * @param opts  { rel?: 判定函数, pauseMs?: 1000, waitMs?: 2200 }
 * @returns { records, queue:[{url,txt}], known:[id] }
 */
export async function bfsCollect(tab, urls, known = [], opts = {}) {
  const rel = opts.rel || REL_DEFAULT;
  const pause = opts.pauseMs ?? 1000;
  const kset = new Set(known);
  const records = [], queue = [];
  for (const u of urls) {
    const id = uidOf(u);
    if (!id || kset.has(id)) continue;
    kset.add(id);
    const rec = await extractDetail(tab, u, opts);
    if (rec.walled) { records.push(rec); break; } // 墙检测：立即停批（纪律3）
    records.push(rec);
    for (const r of rec.rel || []) {
      const rid = uidOf(r.url);
      if (rid && !kset.has(rid) && rel(r.txt)) { kset.add(rid); queue.push(r); }
    }
    await tab.playwright.waitForTimeout(pause);
  }
  return { records, queue, known: [...kset] };
}

export { uidOf };
