# -*- coding: utf-8 -*-
"""Boss批次整合：总表csv（含剔除/低置信标注）+ 统计

用法：
  python consolidate.py --raw-dir <批次目录> --out-csv <输出.csv> [--kw-file keywords.txt]

- 批次文件：_raw 目录下 *.json，record 数组；字段：url（必填）+ main/body/jd 任一
  （旧格式 docTitle+body 也兼容），可选 note
- 采集时在正文中写「剔除备注：」标记错标岗（保留数据、统计剔除），「低置信」同理
- Boss未登录态无薪资；登录态采集后把薪资写进 meta 字段即可入表
"""
import argparse, csv, glob, json, os, re, sys, io
from collections import Counter

if sys.stdout and hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

DEFAULT_KW = ["WMS", "TMS", "OMS", "SRM", "ERP", "MES", "SQL", "PRD", "原型", "AI",
              "补货", "需求预测", "库存", "采购", "仓储", "物流", "履约", "计划",
              "供应商", "数字化", "B端"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw-dir", required=True)
    ap.add_argument("--out-csv", required=True)
    ap.add_argument("--kw-file")
    a = ap.parse_args()
    kws = [l.strip() for l in open(a.kw_file, encoding="utf-8") if l.strip()] if a.kw_file else DEFAULT_KW

    rows = []
    for fn in sorted(glob.glob(os.path.join(a.raw_dir, "*.json"))):
        for r in json.load(open(fn, encoding="utf-8")):
            body = r.get("main") or r.get("jd") or r.get("body") or ""
            if r.get("docTitle"):
                m = re.match(r"「(.+?)招聘」_(.+?)招聘-BOSS直聘", r["docTitle"])
                title, company = (m.group(1), m.group(2)) if m else (r["docTitle"], "")
                meta = ""
            else:
                title, company, meta = r.get("title", ""), r.get("company", ""), r.get("meta", "")
            if not meta:
                mm = re.search(r"\n([^\n]{2,12}\s(?:经验不限|\d+-\d+年|1年以内|10年以上)[^\n]*)", body)
                meta = mm.group(1).strip() if mm else ""
            excluded = "剔除备注" in body
            low_conf = r.get("note") == "低置信" or "低置信" in body
            rows.append(dict(url=r["url"], title=title, company=company, meta=meta,
                             excluded=excluded, low_conf=low_conf, body=body))

    with open(a.out_csv, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["职位名称", "公司", "城市/经验/学历/公司信息", "薪资", "置信度", "URL"])
        for r in rows:
            conf = "剔除-错标" if r["excluded"] else ("低置信" if r["low_conf"] else "有效")
            w.writerow([r["title"], r["company"], r["meta"], r.get("salary", "（未登录不可见）"), conf, r["url"]])

    kept = [r for r in rows if not r["excluded"]]
    exp_c, edu_c, city_c = Counter(), Counter(), Counter()
    for r in kept:
        mm = re.search(r"(1-3年|3-5年|5-10年|10年以上|经验不限|1年以内|\d+-\d+年)", r["meta"])
        if mm: exp_c[mm.group(1)] += 1
        for k in ("硕士", "本科", "大专", "学历不限"):
            if k in r["meta"]: edu_c[k] += 1; break
        c = r["meta"].split(" ")[0] if r["meta"] else ""
        if c: city_c[c] += 1
    kw_c = {}
    for k in kws:
        pats = {"AI": ["AI", "人工智能"], "B端": ["B端", "To B"]}.get(k, [k])
        kw_c[k] = sum(1 for r in kept if any(p.lower() in (r["body"] + r["meta"]).lower() for p in pats))

    print("总帖:", len(rows), "| 剔除:", len(rows) - len(kept),
          "| 低置信:", sum(r["low_conf"] for r in kept))
    print("经验:", dict(exp_c))
    print("学历:", dict(edu_c))
    print("城市:", dict(city_c.most_common(10)))
    print("词频:", dict(sorted(kw_c.items(), key=lambda x: -x[1])))


if __name__ == "__main__":
    main()
