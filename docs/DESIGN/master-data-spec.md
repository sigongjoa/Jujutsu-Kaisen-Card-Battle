# DESIGN: Master Data Specification (마스터 데이터 명세)

**문서 분류**: Design Reference
**작성자**: Game Design & Data Team
**최종 업데이트**: 2025-11-30
**상태**: Draft

---

## 1. 마스터 데이터 개요

### 1.1 목적

마스터 데이터 시트(Master Data Sheet)는 모든 카드의 게임 데이터를 중앙집중식으로 관리하는 문서입니다.

```
┌──────────────────────────────────────┐
│   Master Data Sheet 역할              │
├──────────────────────────────────────┤
│  1. 카드 정의 (카드마다 모든 정보)    │
│  2. 밸런싱 분석 (통계 및 시각화)     │
│  3. 데이터 검증 (중복 체크 등)       │
│  4. 제작 연동 (개발팀 데이터 제공)   │
│  5. 분석 도구 (메타 분석 등)         │
└──────────────────────────────────────┘
```

### 1.2 주요 형식

- **Google Sheets** (협업)
- **Excel** (로컬 작업)
- **CSV/JSON** (개발팀 연동)

---

## 2. 마스터 데이터 컬럼 구조

### 2.1 기본 정보 섹션

| 컬럼 | 데이터타입 | 필수 | 설명 | 예시 |
|------|-----------|------|------|------|
| **Card_ID** | String | ✓ | 고유 카드 ID | SET01-001 |
| **Set_Code** | String | ✓ | 세트 코드 | SET01 |
| **Card_Number** | Integer | ✓ | 세트 내 번호 | 1~200 |
| **Name_EN** | String | ✓ | 영문명 | Yuto Kim |
| **Name_KR** | String | ✓ | 한글명 | 유토 김 |
| **Card_Type** | String | ✓ | 카드 유형 | JUJUTSU_USER |
| **Sub_Type** | String | - | 부분류 | 1st-Grade |
| **Rarity** | String | ✓ | 희귀도 | RARE |

### 2.2 게임 데이터 섹션

| 컬럼 | 데이터타입 | 필수 | 설명 |
|------|-----------|------|------|
| **Cost_Main** | Integer | ✓ | 비용 (0~10) |
| **Stats_ATK** | Integer | - | 공격력 (저주술사만) |
| **Stats_HP** | Integer | - | 체력 (저주술사만) |
| **Power_Score** | Float | ✓ | 파워 레벨 (자동 계산) |
| **Rarity_Weight** | Float | ✓ | 희귀도 가중치 |
| **Synergy_Tags** | String | - | 시너지 태그 (쉼표 구분) |

### 2.3 효과 및 텍스트 섹션

| 컬럼 | 설명 |
|------|------|
| **Text_Rules** | 게임 효과 텍스트 (최대 3줄) |
| **Text_Flavor** | 플레이버 텍스트 |
| **Keywords** | 포함된 키워드 (쉼표 구분) |
| **Ability_Type** | 능력 분류 (Passive/Trigger/Activated) |

### 2.4 제작 정보 섹션

| 컬럼 | 설명 |
|------|------|
| **Artist_Name** | 일러스트 아티스트 |
| **Artist_Credit** | 크레딧 표기 |
| **Illustration_URL** | 일러스트 저장소 링크 |
| **Art_Status** | 아트 진행 상태 |
| **Illustration_Approved** | 승인 여부 |

### 2.5 메타데이터 섹션

| 컬럼 | 설명 |
|------|------|
| **Status** | 카드 상태 (기획/테스트/완료/출시) |
| **Designer** | 담당 디자이너 |
| **Last_Updated** | 마지막 수정 날짜 |
| **Notes** | 개발 노트 |
| **Is_Legal** | 토너먼트 사용 가능 여부 |

---

## 3. 마스터 데이터 예시

### 3.1 저주술사 카드 예시

```
Card_ID: SET01-001
Name_EN: Yuto Kim
Name_KR: 유토 김
Card_Type: JUJUTSU_USER
Sub_Type: 1st-Grade
Rarity: RARE
Cost_Main: 5
Stats_ATK: 3
Stats_HP: 4
Power_Score: 1.2 ← (3+4+키워드값)/5 = 1.2
Text_Rules: "이 저추술사가 플레이될 때, 상대의 저주물 1개를 파괴한다."
Keywords: Destruction
Status: 완료
Is_Legal: TRUE
```

### 3.2 주술 카드 예시

```
Card_ID: SET01-042
Name_EN: Great Wind
Name_KR: 대알
Card_Type: CURSED_TECHNIQUE
Sub_Type: Wind
Rarity: UNCOMMON
Cost_Main: 3
Power_Score: 1.0
Text_Rules: "상대의 저주술사 1명에게 3 손상을 입힌다.
            그 저주술사가 블록당할 수 없다면,
            대신 플레이어에게 3 손상을 입힌다."
Keywords: Damage,Conditional
Status: 완료
Is_Legal: TRUE
```

---

## 4. 자동화된 분석 (Automated Analysis)

### 4.1 마나 커브 계산

```
설정:
마나 커브 피벗 테이블
범주: Cost_Main (0~10)
값: COUNT(Card_ID)
차트 유형: 막대 그래프

기대 결과:
Cost 0-2: 20~30장
Cost 3-5: 40~50장
Cost 6-8: 20~30장
Cost 9-10: 10~15장
```

### 4.2 희귀도 분포

```
피벗 테이블 설정:
행: Rarity
값: COUNT(Card_ID)

목표 분포:
Common: 40% (약 80장)
Uncommon: 35% (약 70장)
Rare: 20% (약 40장)
Ultra Rare: 5% (약 10장)
```

### 4.3 파워 레벨 분포

```
공식:
Power_Score = (Stats_ATK + Stats_HP + Ability_Value) / Cost_Main

분석:
• 평균 Power_Score = 1.0 (기준)
• OP 카드 (Power_Score > 1.3): 조정 필요
• UP 카드 (Power_Score < 0.7): 조정 필요
• 목표: 평균 1.0 ± 0.1
```

---

## 5. 데이터 검증 (Data Validation)

### 5.1 필수 필드 체크

```
모든 카드는 다음을 필수로 포함:
✓ Card_ID (고유성 확인)
✓ Name_EN, Name_KR
✓ Card_Type
✓ Rarity
✓ Cost_Main
✓ Text_Rules (최소 1개 문장)
✓ Artist_Name
```

### 5.2 논리적 검증

```
Cost vs Stats 검증:
IF Card_Type = "JUJUTSU_USER" THEN
  Stats_ATK + Stats_HP >= Cost_Main * 1.5
  ELSE Warning

중복 검증:
IF Card_ID 중복 THEN Error
IF Name_KR 중복 THEN Warning (같은 의도일 수 있음)

타입별 필수 필드 검증:
IF Card_Type = "JUJUTSU_USER" THEN
  Stats_ATK NOT NULL AND Stats_HP NOT NULL
IF Card_Type = "CURSED_TECHNIQUE" THEN
  Stats_ATK = NULL AND Stats_HP = NULL
```

---

## 6. 버전 관리 (Version Control)

### 6.1 변경 로그 (Changelog)

```
시트: "Changelog" 탭

컬럼:
- Date
- Card_ID
- Change_Type (Added/Modified/Removed)
- Old_Value
- New_Value
- Reason
- Approved_By

예시:
Date: 2025-12-01
Card_ID: SET01-001
Change: Modified
Field: Cost_Main
Old: 5
New: 4
Reason: 밸런싱 - 너무 강함
Approved_By: Lead Designer
```

### 6.2 릴리스 버전

```
Master_v1.0 (SET01 초안)
├─ v1.0: 200장 완성
├─ v1.1: 밸런싱 1차 조정
├─ v1.2: 아트 확인 후 수정
└─ v1.3: 최종 출시 버전

각 버전별 스냅샷 유지
```

---

## 7. 피벗 테이블 가이드

### 7.1 주요 분석 피벗 테이블

#### 비용별 카드 분포

```
행: Cost_Main
열: Rarity
값: COUNT(Card_ID)

결과 예시:
Cost | Common | Uncommon | Rare | Ultra | 합계
-----|--------|----------|------|-------|-----
0    | 2      | -        | -    | -     | 2
1    | 8      | 2        | -    | -     | 10
2    | 6      | 4        | 1    | -     | 11
3    | 4      | 5        | 2    | -     | 11
...
합계 | 80     | 70       | 40   | 10    | 200
```

#### 카드 타입별 비용 분석

```
행: Card_Type
열: Cost_Main (그룹화: 0-2, 3-5, 6-10)
값: COUNT(Card_ID)

시각화: 누적 막대 그래프
```

---

## 8. 밸런싱 워크플로우 (Balancing Workflow)

### 8.1 밸런싱 사이클

```
주간 밸런싱 회의
├─ 1. 메타 분석 (지난주 데이터 검토)
├─ 2. 문제 카드 식별 (OP/UP 카드)
├─ 3. 조정 결정 (비용/효과 변경)
├─ 4. 변경사항 마스터 데이터 반영
└─ 5. 테스트 서버에 배포

주기: 매주 월요일 회의 → 화요일 반영 → 수요일 테스트
```

### 8.2 조정 템플릿

```
카드명: [카드]
현재 상태: 과강함 / 과약함
근거:
  - 메타 점유율: XX%
  - 승률: XX%
  - 플레이어 피드백: [의견]

제안 조정:
  Option A: 비용 5 → 6
  Option B: 효과 "모든 저주물" → "상대 저주물 1개"
  Option C: 체력 4 → 3

테스트 예정: [날짜]
```

---

## 9. 내보내기 (Export) 포맷

### 9.1 개발팀용 JSON 내보내기

```json
{
  "cards": [
    {
      "cardId": "SET01-001",
      "nameEn": "Yuto Kim",
      "nameKr": "유토 김",
      "type": "JUJUTSU_USER",
      "rarity": "RARE",
      "cost": 5,
      "stats": {
        "atk": 3,
        "hp": 4
      },
      "textRules": "이 저추술사가 플레이될 때...",
      "keywords": ["Destruction"],
      "isLegal": true
    }
  ]
}
```

### 9.2 프린팅 회사용 CSV

```
card_id,name_kr,type,rarity,cost,atk,hp,text_rules,artist,illustration_url
SET01-001,유토 김,저주술사,희귀,5,3,4,"이 저추술사가...",김아티스트,https://...
```

---

## 10. 마스터 데이터 시트 보안

### 10.1 접근 제어

```
권한 수준:

Editor (편집 권한):
- Game Design Lead
- Balance Lead
- Data Manager

Commenter (댓글 권한):
- Designers (의견 제시)
- Developers (피드백)

Viewer (조회만):
- Other team members
```

### 10.2 백업 정책

```
자동 백업: 매 4시간마다
수동 백점: 매주 금요일 (버전 명시)
아카이브: 구 버전 별도 폴더에 보관
```

---

## 11. FAQ

### Q: 카드 ID는 어떻게 할당하나?
A: SET##-### 형식으로, 각 세트별로 001부터 순차 할당. 예: SET01-001 ~ SET01-200

### Q: Power_Score는 정확한가?
A: 근사치입니다. 카드의 상호작용, 메타 영향 등을 고려하면 조정 필요.

### Q: 카드 효과를 수정하면 어디서부터?
A: 마스터 데이터 → GDD 업데이트 → 개발팀 알림 → 테스트 서버 배포

---

**관련 문서**:
- `SDD/02-game-design-document.md`
- `DESIGN/balancing-framework.md`
- `TDD/02-data-schema.md`
