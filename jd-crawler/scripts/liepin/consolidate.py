# -*- coding: utf-8 -*-
"""猎聘批次整合：去重 → JD库md + 总表csv + 统计json

用法：
  python consolidate.py --raw-dir <批次目录> --out-dir <输出目录> \
      [--dup-map dup.json] [--exclude exclude.txt] [--kw-file keywords.txt]

- 批次文件：_raw 目录下所有 *.json，每个为 record 数组，字段任意组合：
  url（必填）、jd/body（正文）、header、company、docTitle
- dup.json（可选）：{"variant数字id": "canonical数字id"}，同文多帖映射
- exclude.txt（可选）：一行一个数字id，剔除错标岗
- keywords.txt（可选）：一行一个统计词，缺省用内置通用表
"""
import argparse, csv, glob, json, os, re, sys, io
from collections import Counter, defaultdict

if sys.stdout and hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

DEFAULT_KW = ["PRD", "原型", "SQL", "Python", "Axure", "Figma", "Visio", "XMind",
              "WMS", "TMS", "OMS", "SRM", "ERP", "MES", "APS", "MRP", "CRM", "SAP",
              "AI", "从0到1", "B端", "数字化", "英语", "跨境", "敏捷",
              "库存", "采购", "仓储", "物流", "履约", "计划", "供应商", "补货", "调拨"]
SAL_RE = re.compile(r"(\d+)-(\d+)k(?:·(\d+)薪)?")
TRUNC_MARKS = ["登录查看", "展开更多", "点击展开", "加载更多"]


def uid(u):
    m = re.search(r"(\d+)\.shtml", u or "")
    return m.group(1) if m else ""


def parse_header(h):
    lines = [l.strip() for l in (h or "").split("\n") if l.strip()]
    if "投诉建议" in lines:
        lines = lines[lines.index("投诉建议") + 1:]
    for j, l in enumerate(lines):
        if SAL_RE.search(l) and j > 0:
            meta = {"title": lines[j - 1], "salary_raw": l, "meta_line": lines[j + 1] if j + 1 < len(lines) else ""}
            return meta
    return {"title": "", "salary_raw": "", "meta_line": ""}


def parse_body_top(b):
    """旧格式批次（正文开头即标题行）的头部解析。"""
    lines = [l.strip() for l in (b or "").split("\n") if l.strip()]
    for j, l in enumerate(lines[:8]):
        if SAL_RE.search(l) and j > 0:
            title = lines[j - 1] if lines[j - 1] != "急聘" else (lines[j - 2] if j >= 2 else "")
            meta_line = ""
            for k in range(j + 1, min(j + 4, len(lines))):
                if re.search(r"招\d+人|更新", lines[k]):
                    meta_line = lines[k]
                    break
            return {"title": title, "salary_raw": l, "meta_line": meta_line}
    return {"title": "", "salary_raw": "", "meta_line": ""}


def safe(s, n=40):
    return re.sub(r'[\\/:*?"<>|·（）()【】\s]+', "", str(s))[:n] or "untitled"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw-dir", required=True)
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--dup-map")
    ap.add_argument("--exclude")
    ap.add_argument("--kw-file")
    a = ap.parse_args()

    dup_map = json.load(open(a.dup_map, encoding="utf-8")) if a.dup_map else {}
    exclude = set(open(a.exclude, encoding="utf-8").read().split()) if a.exclude else set()
    kws = [l.strip() for l in open(a.kw_file, encoding="utf-8") if l.strip()] if a.kw_file else DEFAULT_KW

    jd_dir = os.path.join(a.out_dir, "JD库")
    os.makedirs(jd_dir, exist_ok=True)

    records, variants = {}, defaultdict(list)
    for fn in sorted(glob.glob(os.path.join(a.raw_dir, "*.json"))):
        for r in json.load(open(fn, encoding="utf-8")):
            records.setdefault(r["url"], r)

    canon = {}
    for url, r in records.items():
        i = uid(url)
        if not i or i in exclude:
            continue
        if i in dup_map:
            variants[dup_map[i]].append(url)
            continue
        canon[url] = r

    stats = []
    for idx, (url, r) in enumerate(canon.items(), 1):
        jd_text = r.get("jd") or r.get("body") or ""
        m = parse_header(r.get("header", ""))
        if not m["salary_raw"]:
            m = parse_body_top(jd_text) or m
        meta_line = m["meta_line"]
        parts = [p.strip() for p in re.split(r"\s{2,}", meta_line)] if meta_line else []
        sn = SAL_RE.search(m["salary_raw"])
        lo, hi = (int(sn.group(1)), int(sn.group(2))) if sn else (0, 0)
        months = int(sn.group(3)) if sn and sn.group(3) else 12
        mo = re.search(r"行业要求[：:\s]*([^\n。；;（(]+)", jd_text)
        company = r.get("company", "")
        if not company:
            mc = re.search(r"公司信息[：:]\s*([^\n]+)", jd_text)
            if mc:
                company = mc.group(1).split(" ")[0]
        rec = dict(no=idx, url=url, title=m["title"], salary_raw=m["salary_raw"],
                   city=parts[0] if parts else "", exp=parts[1] if len(parts) > 1 else "",
                   edu=parts[2] if len(parts) > 2 else "", company=company,
                   industry=mo.group(1).strip() if mo else "", jd=jd_text,
                   lo=lo, hi=hi, months=months, trunc=[t for t in TRUNC_MARKS if t in jd_text])
        rec.update(mid=(lo + hi) / 2, annual=(lo + hi) / 2 * months,
                   top_city=rec["city"].split("-")[0])
        stats.append(rec)

    for r in stats:
        var = "、".join(variants.get(uid(r["url"]), []))
        note = ("\n> 同文多帖（按1份计）：" + var + "\n") if var else ""
        fn = f"{r['no']:02d}-{safe(r['company'] or '匿名')}-{safe(r['title'], 30)}.md"
        with open(os.path.join(jd_dir, fn), "w", encoding="utf-8") as f:
            f.write(f"""# {r['title']}

- **公司**：{r['company'] or '（猎头匿名发布）'}
- **城市**：{r['city']}　**薪资**：{r['salary_raw']}　**经验**：{r['exp']}　**学历**：{r['edu']}
- **行业要求**：{r['industry']}
- **来源**：猎聘 {r['url']}{note}
## 职位介绍

{r['jd']}
""")

    with open(os.path.join(a.out_dir, "JD总表.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["编号", "职位名称", "公司", "城市", "薪资", "月薪下限k", "月薪上限k", "薪",
                    "年薪中值万", "经验", "学历", "行业", "URL"])
        for r in stats:
            w.writerow([r["no"], r["title"], r["company"], r["city"], r["salary_raw"],
                        r["lo"], r["hi"], r["months"], round(r["annual"] / 10, 1),
                        r["exp"], r["edu"], r["industry"], r["url"]])

    kw_c = {}
    for k in kws:
        pats = {"AI": ["AI", "人工智能"], "B端": ["B端", "To B"],
                "从0到1": ["从0到1", "从 0 到 1"]}.get(k, [k])
        kw_c[k] = sum(1 for r in stats if any(p.lower() in r["jd"].lower() for p in pats))
    annuals = sorted(r["annual"] for r in stats if r["annual"])

    def pct(arr, p):
        return arr[min(int(len(arr) * p), len(arr) - 1)] if arr else 0

    summary = {
        "total": len(stats),
        "truncated": sum(1 for r in stats if r["trunc"]),
        "variants_merged": sum(len(v) for v in variants.values()),
        "city": dict(Counter(r["top_city"] for r in stats if r["top_city"]).most_common()),
        "exp": dict(Counter(r["exp"] for r in stats).most_common()),
        "edu": dict(Counter(r["edu"] for r in stats).most_common()),
        "keywords": dict(sorted(kw_c.items(), key=lambda x: -x[1])),
        "salary_annual_wan": {"min": round(annuals[0] / 10, 1) if annuals else 0,
                               "p25": round(pct(annuals, .25) / 10, 1),
                               "p50": round(pct(annuals, .5) / 10, 1),
                               "p75": round(pct(annuals, .75) / 10, 1),
                               "max": round(annuals[-1] / 10, 1) if annuals else 0},
    }
    json.dump(summary, open(os.path.join(a.out_dir, "_stats.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print("TOTAL:", summary["total"], "| truncated:", summary["truncated"],
          "| variants merged:", summary["variants_merged"])


if __name__ == "__main__":
    main()
