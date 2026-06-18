<div align="center">

# Evidentia

### AIが捏造した医学引用を、公開前に捕まえる。

Evidentia は医学文章中のすべての引用を **CrossRef・PubMed・OpenAlex・arXiv・ClinicalTrials.gov** に照合し、4段階で分類します。さらにエージェントスキルでは、15項目のエビデンス評価を重ねて A〜F のレポートを生成します。作者は小児科専門医。

[![npm](https://img.shields.io/npm/v/evidentia?color=cb3837&logo=npm)](https://www.npmjs.com/package/evidentia)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Claude Code Skill](https://img.shields.io/badge/Claude%20Code-skill-d97757)](https://code.claude.com/docs/en/skills)

</div>

---

> **なぜ今か:** 250万本の生物医学論文を監査した *Lancet*（Topaz et al., 2026年5月; [doi:10.1016/S0140-6736(26)00603-3](https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(26)00603-3/fulltext)）の調査で、**2026年初頭に出版された論文の277本に1本が捏造引用を含む**ことが判明しました。2023年の2,828本に1本から **12倍** の増加で、生成AIライティングツールの普及と時期が一致しています（監査対象はPubMed Centralオープンアクセス収載分）。報道: [STAT](https://www.statnews.com/2026/05/07/lancet-study-finds-steep-rise-fraudulent-citations-academic-papers/) ・ [Nature](https://www.nature.com/articles/d41586-026-00748-w) ・ [Columbia看護学部](https://www.nursing.columbia.edu/news/nearly-3-000-peer-reviewed-medical-papers-have-fake-citations-columbia-nursing-ai-assisted-audit-finds) ・ [Retraction Watch](https://retractionwatch.com/2026/05/07/one-in-277-pubmed-indexed-papers-in-2026-shows-fabricated-references-says-analysis/)
>
> 捏造されたDOIは、本物のDOIと見分けがつきません。Evidentia は一つずつ実際に解決し、どれが本物でどれが偽物かを教えます。

> ⚕️ **適用範囲:** Evidentia は執筆者・編集者・研究者のための公開前支援ツールであり、**臨床判断支援ではありません。** 診断・治療・医療専門家の判断を代替しません。

## 30秒で始める

**コマンドラインツールとして**（インストール不要・APIキー不要）:

```bash
npx evidentia check your-article.md
```

**Claude Code スキルとして**（15項目の完全評価）:

```bash
/plugin marketplace add kgraph57/evidentia
/plugin install evidentia@evidentia
```

あとは「この記事をファクトチェックして」と言うだけです。

**Codex Desktop プラグインとして**:

```text
Marketplace source: https://github.com/kgraph57/evidentia.git
Plugin: evidentia
```

## 何を捕まえるのか

ビタミンDと小児感染症についての、実際のAI生成回答に対して Evidentia を実行した例です。引用は4件、書式は完璧、どれも一見もっともらしく見えます:

```text
$ npx evidentia check examples/inputs/ai-generated-answer.md

Evidentia: 4 citations — 1 verified, 1 mismatch, 2 hallucinated (75.0% fabrication rate)
  [OK ] doi:10.1136/bmj.i6583       — 論文は実在し、引用メタデータも一致
  [HAL] doi:10.1056/nejmoa2105512   — CrossRef・OpenAlex のどちらでも解決せず、一致する論文なし
  [HAL] pmid:18768876               — 引用とは別の論文を指している
  [MIS] doi:10.1002/14651858.cd012734 — 論文は実在するが、メタデータ（年）が不一致
```

実在は1件。1件はDOIをでっち上げ。1件のPMIDは無関係な論文を指し、1件は年が誤り。**人間のレビュアーなら4件すべてを手で確認する必要があります。** Evidentia は数秒で終えました。

## 4段階分類

多くの「引用チェッカー」は *「検証できませんでした」* で止まります。Evidentia はそこから踏み込み、識別子を実際に解決して **なぜ** その引用が疑わしいのかを示します:

| Tier | 判定 | 意味 |
|:----:|------|------|
| ✅ **1** | **検証済み** | 論文が実在し、引用のタイトル/著者/年/誌名がレジストリ記録と一致 |
| ⚠️ **3** | **書誌の不一致** | 実在する論文だが、DOI/PMID が誤っている、またはメタデータが食い違う |
| ❌ **4** | **ハルシネーション** | 識別子が何も解決しない、または *まったく別の* 論文を指す。AI生成テキストの典型 |
| 🔍 **2** | **文脈レビューが必要** | 論文は実在するが、*正しい文脈で使われているか* は人間かLLMの判断が必要（下記スキルが担当） |

## 2層構成: 決定論エンジン + LLM評価

Evidentia は「機械が完璧にできる部分」と「判断を要する部分」を意図的に分けています。

**1. エンジン（CLI + MCPサーバー）** — 純粋に決定論的な引用検証。APIキー不要、LLM不要、それ自身がハルシネーションを起こすこともありません。「この引用論文は本当に実在し、識別子はそれを指しているか?」という1点を確実に答えます。ターミナル、CI、または任意のエージェントの MCP ツールとして使えます。

**2. スキル（Claude Code）** — エンジンを **15項目の批判的評価ルーブリック** で包みます。エビデンスレベル、統計解釈（相対リスク vs 絶対リスク、NNT）、因果と相関、利益相反、誇張、対象集団の適合、倫理など — **A〜F のレポート** と具体的な修正案を生成。これはエンジン単独ではできない Tier 2「正しく使われているか」の層です。

どちらも単独で使えます。組み合わせれば、引用の *存在*（決定論的）と引用の *誠実さ*（評価）の両方をカバーします。

## MCPツールとして使う

任意のエージェントに引用検証能力を与えます:

```bash
claude mcp add evidentia -- npx -y evidentia-mcp
```

JSON出力には、人間向けの4段階判定に加えて `lookupVerified` と `resolverOutcomes` が含まれます。どのレジストリに何を照合し、`matched / unmatched / unreachable / skipped` のどれだったかを機械的に追跡できます。

## CIで使う

捏造引用を混入させたプルリクエストをブロックします:

```yaml
- run: npx evidentia check content/**/*.md --fail-on-fabrication
```

`--fail-on-fabrication` は、いずれかの引用が不一致・ハルシネーションなら非ゼロ終了します。

## インストール

### CLI

```bash
npx evidentia check article.md            # 単発・インストール不要
npm install -g evidentia                   # グローバルインストール
evidentia check article.md --format md --out report.md
evidentia check article.md --cache ~/.cache/evidentia/cache.json
```

### Claude Code スキル / プラグイン

```bash
/plugin marketplace add kgraph57/evidentia
/plugin install evidentia@evidentia
```

手動コピーの場合:

```bash
git clone https://github.com/kgraph57/evidentia.git
cp -r evidentia/skills/medical-fact-check ~/.claude/skills/
```

## 実例

| 入力 | 結果 |
|------|------|
| [AI生成回答](examples/inputs/ai-generated-answer.md)（実在＋捏造の混在） | [捏造率75%](examples/reports/ai-generated-answer.report.md) |
| [クリーンな参考文献リスト](examples/inputs/clean-references.md)（全て実在） | [0%（全件検証済み）](examples/reports/clean-references.report.md) |

## ロードマップ

- [ ] `evidentia-bench` — 実在 vs 捏造の医学引用のオープンベンチマーク（モデル別捏造率付き）
- [x] バッチ/glob入力とJSONサマリのGitHub Action
- [x] arXiv ID検証、resolver trace、ローカルcache
- [ ] CrossRef/OpenAlex抄録取得によるTier 2文脈チェック支援
- [ ] スキルのメディアプリセット拡充

進捗は[ロードマップIssue](https://github.com/kgraph57/evidentia/issues)で追跡しています。コントリビューションは [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## 制限事項

- **エンジン** は引用の *存在と書誌の正確さ* を検証します。実在論文が *正しく要約されているか* は検証しません。その意味的チェックはスキルの役割（Tier 2）で、公開インデックス（抄録・オープンアクセス全文・メタデータ）に依存します。
- これは **執筆者・編集者・研究者のための判断支援であり、臨床判断支援ではありません。** 診断・治療・医療専門家の判断を代替しません。
- ごく新しい論文は未収載のことがあり、誤って「未検証」と出る場合があります。後で再実行するか、`--mailto` を付けて最新インデックスを使ってください。

## 作者について

**岡本賢（Ken Okamoto, MD）** — 小児科専門医・医療AI起業家。Evidentia は、AI支援の医学執筆において「本物のエビデンス」と「もっともらしい捏造」を切り分けるという日々の課題から生まれました。

## ライセンス

[MIT](LICENSE)
