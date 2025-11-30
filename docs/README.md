# Jujutsu Kaisen Card Battle - 개발 문서 가이드

## 📋 문서 구조

본 프로젝트의 개발 문서는 **SDD(Software Design Document)**와 **TDD(Technical Design Document)** 두 가지 관점으로 구성됩니다.

### 디렉토리 구조

```
docs/
├── README.md (본 파일)
├── SDD/                           # Software Design Document
│   ├── 01-vision-statement.md      # 비전 및 프로젝트 정체성
│   ├── 02-game-design-document.md  # 게임 디자인 문서 (GDD)
│   ├── 03-rulebook.md              # 플레이어용 룰북
│   ├── 04-comprehensive-rules.md   # 종합 규칙 (CR)
│   ├── 05-card-design-skeleton.md  # 카드 디자인 스켈레톤
│   └── 06-art-direction.md         # 아트 바이블 및 스타일 가이드
│
├── TDD/                           # Technical Design Document
│   ├── 01-architecture-overview.md # 시스템 아키텍처 개요
│   ├── 02-data-schema.md           # 데이터 스키마 및 정규화
│   ├── 03-game-logic.md            # 게임 로직 구현 명세
│   ├── 04-server-design.md         # 서버 설계 및 API
│   ├── 05-client-design.md         # 클라이언트 설계
│   ├── 06-database-design.md       # 데이터베이스 설계
│   └── 07-security-rng.md          # 보안 및 난수 생성 명세
│
├── DESIGN/                        # 디자인 참고 자료
│   ├── card-template.md            # 카드 템플릿 및 레이아웃
│   ├── balancing-framework.md      # 밸런싱 프레임워크
│   ├── power-curve-analysis.md     # 파워 커브 분석
│   └── master-data-spec.md         # 마스터 데이터 명세
│
├── PRODUCTION/                    # 제작 및 출판
│   ├── print-specifications.md     # 인쇄 사양서
│   ├── packaging-dielines.md       # 패키징 및 다이라인
│   └── manufacturing-guide.md      # 제조 가이드
│
├── LEGAL/                         # 법적 및 비즈니스
│   ├── work-for-hire-template.md   # 저작물 계약서 템플릿
│   ├── terms-of-service.md         # 이용약관
│   ├── privacy-policy.md           # 개인정보 처리방침
│   └── tournament-rules.md         # 토너먼트 규정
│
└── OPERATIONS/                    # 운영 및 마케팅
    ├── playtesting-framework.md    # 플레이테스트 프레임워크
    ├── community-guidelines.md     # 커뮤니티 가이드라인
    └── launch-checklist.md         # 런칭 체크리스트
```

---

## 📚 문서 작성 우선순위

### Phase 1: 핵심 기획 (1~2주)
1. **Vision Statement** - 게임의 비전과 정체성 정의
2. **Game Design Document (GDD)** - 게임의 기본 메커니즘과 룰
3. **Comprehensive Rules** - 상세한 규칙 정의

### Phase 2: 기술 설계 (2~3주)
4. **Architecture Overview** - 시스템 전체 구조 설계
5. **Data Schema** - 데이터베이스 구조 정의
6. **Game Logic** - 서버 로직 명세

### Phase 3: 세부 설계 (3~4주)
7. **Card Design Skeleton** - 카드 밸런싱 프레임워크
8. **Art Direction** - 아트 가이드라인
9. **Server/Client Design** - 상세 기술 설계

### Phase 4: 운영 준비 (4주)
10. **Legal Documents** - 계약서 및 이용약관
11. **Production Specs** - 제조 사양서
12. **Tournament Rules** - 대회 규정

---

## 🎯 SDD vs TDD의 역할

### SDD (Software Design Document)
**"게임을 어떻게 플레이하는가"에 집중**

- 게임의 비전과 목표
- 게임의 규칙과 메커니즘
- 플레이 경험과 사용자 인터페이스
- 카드 디자인과 밸런싱
- 아트 및 비주얼 스타일

**독자**: 디자이너, 기획자, 아티스트, 마케터

### TDD (Technical Design Document)
**"게임을 어떻게 구현하는가"에 집중**

- 시스템 아키텍처와 기술 스택
- 데이터 스키마와 데이터베이스 설계
- 서버와 클라이언트 구현 명세
- API 설계와 통신 프로토콜
- 보안, 성능, 확장성

**독자**: 개발자, 아키텍트, QA 엔지니어

---

## 📖 문서 읽는 방법

### 신규 팀원 온보딩
1. `SDD/01-vision-statement.md` 읽기 (게임 이해)
2. `SDD/02-game-design-document.md` 읽기 (게임 메커니즘 이해)
3. 자신의 역할에 맞는 문서 선택적 읽기

### 개발자 온보딩
1. `SDD/01-vision-statement.md` 읽기
2. `TDD/01-architecture-overview.md` 읽기
3. 담당 영역의 TDD 문서 상세 읽기
4. `TDD/02-data-schema.md` 읽기

### 아티스트 온보딩
1. `SDD/01-vision-statement.md` 읽기
2. `SDD/06-art-direction.md` 읽기
3. `DESIGN/card-template.md` 읽기

---

## 🔄 문서 유지보수

이 문서들은 **살아있는 문서(Living Document)**입니다.

- 게임 개발이 진행되면서 규칙이 변경되면, 해당 문서를 즉시 업데이트합니다
- 매주 월요일 게임 디자인 미팅 후 SDD 업데이트
- 매주 목요일 기술 미팅 후 TDD 업데이트
- 모든 변경사항은 Git commit 메시지에 "docs: " prefix 사용

---

## 📝 문서 작성 가이드라인

1. **구체성**: "아마도", "가능할 수 있다" 같은 불확실한 표현 금지
2. **시각화**: 흐름도, 다이어그램, 예제 코드 포함
3. **예시**: 실제 카드 예시나 게임플레이 예시 포함
4. **일관성**: 같은 개념은 같은 용어로 표현
5. **정확성**: 게임 규칙이나 기술 사양은 정확하고 검증 가능해야 함

---

## 🤝 기여 방법

문서를 수정하거나 추가할 때:

1. 해당 `.md` 파일을 편집
2. Git에 commit: `git commit -m "docs: [파일명] - [변경 내용]"`
3. 변경사항이 크면 팀 리뷰 후 merge

---

## 📞 문의

문서에 대한 질문이나 명확하지 않은 부분:
- 게임 설계 관련: Game Design Lead에게 연락
- 기술 설계 관련: Tech Lead에게 연락
- 아트 관련: Art Director에게 연락

---

**Last Updated**: 2025-11-30
**Version**: 1.0
