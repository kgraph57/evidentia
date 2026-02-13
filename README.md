# Evidentia

Medical Fact-Check Skill for [Claude Code](https://claude.ai/claude-code)

医学情報のファクトチェックと批評的評価を行う Claude Code スキル。論文、記事、SNS投稿、患者向け資料など、あらゆる医学情報の正確性を15の評価項目で包括的に評価し、構造化されたレポートを生成します。

## Features

- **15項目の包括的評価** - エビデンスレベル、引用の正確性、統計解釈、因果関係、倫理的配慮など
- **AIハルシネーション引用の検出** - DOI照合による架空引用の4段階分類
- **構造化レポート生成** - A〜Fの総合スコア付きMarkdownレポート
- **修正後の再検証** - 記事修正後のフォローアップ評価
- **多様な情報形式に対応** - 論文、ブログ、SNS投稿、ニュースレター、患者向け資料

## Evaluation Items

| # | 評価項目 | 概要 |
|---|---------|------|
| 1 | エビデンスレベルと研究デザイン | RCT、メタアナリシス、観察研究等の質の評価 |
| 2 | 引用と出典の正確性 | DOI照合、ハルシネーション検出を含む |
| 3 | 統計の解釈 | 相対/絶対リスク、p値、効果量の適切性 |
| 4 | 因果関係と相関の区別 | 因果推論の妥当性 |
| 5 | バイアスと利益相反 | COI開示、出版バイアスの評価 |
| 6 | 誇張表現と断定的表現 | クリックベイト、過度な一般化の検出 |
| 7 | 対象集団の適切性 | 研究対象と適用対象の一致性 |
| 8 | 時間的妥当性 | 情報の新しさ、ガイドラインとの整合性 |
| 9 | 専門用語と平易さのバランス | 対象読者に応じた用語の適切性 |
| 10 | 倫理的配慮 | スティグマ回避、恐怖煽動の検出 |
| 11 | 論理的一貫性 | 主張と根拠の整合性 |
| 12 | 画像・図表の適切性 | データ可視化の公正性 |
| 13 | 代替説明の考慮 | 複数の視点のバランス |
| 14 | 実用性と臨床的意義 | 実臨床への適用可能性 |
| 15 | 情報の完全性 | リスク・ベネフィットの網羅性 |

## Scoring

| スコア | 基準 |
|--------|------|
| **A** | 優が12項目以上、不可が0項目 |
| **B** | 優または良が12項目以上、不可が1項目以下 |
| **C** | 可以上が12項目以上、不可が2項目以下 |
| **D** | 不可が3項目以上 |
| **F** | 不可が5項目以上、または重大な倫理的問題 |

## Installation

### Prerequisites

- [Claude Code](https://claude.ai/claude-code) がインストールされていること

### Setup

```bash
# 1. リポジトリをクローン
git clone https://github.com/kgraph57/evidentia.git

# 2. Claude Code のスキルディレクトリにコピー
mkdir -p ~/.claude/skills/medical-fact-check
cp -r evidentia/SKILL.md ~/.claude/skills/medical-fact-check/
cp -r evidentia/references ~/.claude/skills/medical-fact-check/
cp -r evidentia/templates ~/.claude/skills/medical-fact-check/
```

## Usage

Claude Code のチャットで以下のようなトリガーフレーズを使うと、スキルが起動します:

```
この記事をファクトチェックして
```

```
エビデンスチェックお願いします
```

```
この投稿の問題点を教えて
```

### Input

以下の形式の医学情報を評価できます:

- **テキスト**: チャットに直接ペースト
- **ファイル**: Markdownファイルのパスを指定
- **URL**: WebFetchで記事を取得して評価

### Output

評価結果は Markdown ファイルとして出力されます:

```
medical-fact-check-report-YYYY-MM-DD.md
```

## AI Hallucination Detection

本スキルの特徴的な機能として、AI生成コンテンツに含まれるハルシネーション引用の検出があります。

引用を4段階で分類します:

| 分類 | 説明 |
|------|------|
| **引用確認済み** | 論文が実在し、内容が一致 |
| **引用内容不一致** | 論文は実在するが、引用された文脈と異なる |
| **書誌情報不一致** | 論文は実在するが、DOI/著者名等に誤り |
| **ハルシネーション引用** | DOIが別論文を指す、または論文自体が実在しない |

## File Structure

```
evidentia/
├── SKILL.md                    # メインのスキル定義（9ステップのワークフロー）
├── references/
│   ├── checklist.md            # 15評価項目の詳細チェックリスト
│   └── evidence-levels.md      # エビデンスレベルの分類体系
└── templates/
    └── report-template.md      # レポートテンプレート（8セクション）
```

## Customization

### 評価項目のカスタマイズ

`references/checklist.md` を編集して、独自のチェック項目を追加できます。

### レポート形式のカスタマイズ

`templates/report-template.md` を編集して、レポートのセクション構成を変更できます。

### エビデンスレベルの拡張

`references/evidence-levels.md` に、特定の診療科や研究分野に特化した評価基準を追加できます。

## Limitations

- AIによる評価であり、専門家の判断を代替するものではありません
- 引用論文の全文確認はウェブ検索で取得可能な情報に限定されます
- 画像・図表の内容評価は限定的です
- 最終的な医学的判断は医療専門家が行ってください

## Contributing

改善提案やバグ報告は [Issues](https://github.com/kgraph57/evidentia/issues) からお寄せください。

## License

[MIT License](LICENSE)
